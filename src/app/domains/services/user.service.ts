import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, switchMap, catchError, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { 
  SessionInfo, 
  UsuarioCompleto, 
  EstadoAutenticacion, 
  JWTClaims 
} from '../interfaces/oauth2.interfaces';
import { CardsInfoBandejadeAtencionService } from './cards-info-bandejade-atencion.service';
import { AdministracionResponse } from '../interfaces/datosCards.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private estadoAutenticacionSubject = new BehaviorSubject<EstadoAutenticacion>({
    isAuthenticated: false,
    isLoading: false,
    usuario: null,
    error: null
  });

  public estadoAutenticacion$ = this.estadoAutenticacionSubject.asObservable();

  constructor(private cardsService: CardsInfoBandejadeAtencionService) {
    this.inicializarUsuario();
    
    // Monitorear cambios en localStorage (para tabs múltiples)
    window.addEventListener('storage', (event) => {
      if (event.key === 'sessionInfo') {
        this.inicializarUsuario();
      }
    });

    // Verificar expiración cada minuto
    setInterval(() => {
      this.verificarExpiracionToken();
    }, 60000);
  }

  /**
   * Inicializa el usuario desde localStorage
   */
  private inicializarUsuario(): void {
    try {
      this.setLoading(true);
      const sessionInfo = this.getSessionInfoFromStorage();
      
      if (sessionInfo) {
        const usuarioCompleto = this.construirUsuarioCompleto(sessionInfo);
        this.setUsuarioAutenticado(usuarioCompleto);
        
        // Cargar información de administración de forma asíncrona
        // NO llamar setLoading(false) aquí porque cargarAdministracion() lo maneja
        this.cargarAdministracion();
        return; // No ejecutar el finally para este caso
      } else {
        this.setUsuarioNoAutenticado();
      }
    } catch (error) {
      console.error('❌ [UserService] Error al inicializar usuario:', error);
      this.setError('Error al cargar información del usuario');
    } finally {
      // Solo se ejecuta si no hay sessionInfo o hay un error
      this.setLoading(false);
    }
  }

  /**
   * Obtiene sessionInfo desde localStorage de forma segura
   */
  private getSessionInfoFromStorage(): SessionInfo | null {
    try {
      const sessionInfoString = localStorage.getItem('sessionInfo');
      if (!sessionInfoString) return null;
      
      const sessionInfo: SessionInfo = JSON.parse(sessionInfoString);
      
      // Validar que tenga los campos requeridos
      if (!sessionInfo.rfc || !sessionInfo.token) {
        console.warn('SessionInfo incompleta en localStorage');
        return null;
      }
      
      return sessionInfo;
    } catch (error) {
      console.error('Error al parsear sessionInfo:', error);
      localStorage.removeItem('sessionInfo'); // Limpiar datos corruptos
      return null;
    }
  }

  /**
   * Construye el objeto UsuarioCompleto con información del JWT
   */
  private construirUsuarioCompleto(sessionInfo: SessionInfo): UsuarioCompleto {
    let jwtClaims: JWTClaims | null = null;
    
    try {
      // Decodificar el JWT para obtener información adicional
      jwtClaims = jwtDecode<JWTClaims>(sessionInfo.token);
    } catch (error) {
      console.warn('No se pudo decodificar el JWT, usando solo sessionInfo:', error);
    }

    const rolesArray = this.parseRoles(sessionInfo.roles);
    const fechaExpiracion = new Date(sessionInfo.exp * 1000);
    const fechaEmision = jwtClaims ? new Date(jwtClaims.iat * 1000) : new Date();
    const tiempoRestante = this.calcularTiempoRestante(fechaExpiracion);

    return {
      // Datos básicos de sessionInfo
      rfc: sessionInfo.rfc,
      nombre: sessionInfo.nombre,
      roles: sessionInfo.roles,
      token: sessionInfo.token,
      exp: sessionInfo.exp,
      
      // Datos adicionales del JWT (si están disponibles)
      tipoContribuyente: jwtClaims?.tipoContribuyente,
      tipoPersona: jwtClaims?.tipoPersona,
      fechaExpiracion,
      fechaEmision,
      rolesArray,
      
      // Información de administración (se cargará después)
      administracion: null,
      descripcionAdministracion: 'Cargando...',
      
      // Datos calculados/derivados
      esAdmin: this.esAdminPrivado(rolesArray),
      esCapturista: this.esCapturista(rolesArray),
      esSupervisor: this.esSupervisor(rolesArray),
      esSupervisorAtencion: this.esSupervisorAtencion(rolesArray),
      esCapturistaAtencion: this.esCapturistaAtencion(rolesArray),
      tiempoRestanteSesion: tiempoRestante,
      sesionProximaExpirar: tiempoRestante <= 15
    };
  }

  /**
   * Parsea la cadena de roles en un array
   */
  private parseRoles(rolesString: string): string[] {
    if (!rolesString) return [];
    return rolesString.split(',').map(role => role.trim()).filter(role => role.length > 0);
  }

  /**
   * Calcula el tiempo restante de sesión en minutos
   */
  private calcularTiempoRestante(fechaExpiracion: Date): number {
    const ahora = new Date();
    const diferencia = fechaExpiracion.getTime() - ahora.getTime();
    return Math.max(0, Math.floor(diferencia / (1000 * 60)));
  }

  /**
   * Verifica si el usuario es administrador (método privado para construcción)
   */
  private esAdminPrivado(roles: string[]): boolean {
    return roles.some(role => 
      role.includes('ADMIN') || 
      role.includes('SUPERVISA') ||
      role.includes('SUPERVISA_ATENCION')
    );
  }

  /**
   * Verifica si el usuario es capturista
   */
  private esCapturista(roles: string[]): boolean {
    return roles.some(role => role.includes('CAPTURA') && !role.includes('ATENCION'));
  }

  /**
   * Verifica si el usuario es supervisor
   */
  private esSupervisor(roles: string[]): boolean {
    return roles.some(role => role.includes('SUPERVISA') && !role.includes('ATENCION'));
  }

  /**
   * Verifica si el usuario es supervisor de atención
   */
  private esSupervisorAtencion(roles: string[]): boolean {
    return roles.some(role => role.includes('SUPERVISA_ATENCION'));
  }

  /**
   * Verifica si el usuario es capturista de atención
   */
  private esCapturistaAtencion(roles: string[]): boolean {
    return roles.some(role => role.includes('CAPTURA_ATENCION'));
  }

  /**
   * Verifica la expiración del token
   */
  private verificarExpiracionToken(): void {
    const estadoActual = this.estadoAutenticacionSubject.value;
    if (estadoActual.isAuthenticated && estadoActual.usuario) {
      const ahora = new Date();
      if (estadoActual.usuario.fechaExpiracion <= ahora) {
        console.warn('Token expirado, cerrando sesión');
        this.logout();
      } else {
        // Actualizar tiempo restante
        const tiempoRestante = this.calcularTiempoRestante(estadoActual.usuario.fechaExpiracion);
        const usuarioActualizado = {
          ...estadoActual.usuario,
          tiempoRestanteSesion: tiempoRestante,
          sesionProximaExpirar: tiempoRestante <= 15
        };
        this.setUsuarioAutenticado(usuarioActualizado);
      }
    }
  }

  /**
   * Métodos de gestión de estado
   */
  private setLoading(loading: boolean): void {
    const estadoActual = this.estadoAutenticacionSubject.value;
    this.estadoAutenticacionSubject.next({
      ...estadoActual,
      isLoading: loading
    });
  }

  private setError(error: string): void {
    const estadoActual = this.estadoAutenticacionSubject.value;
    this.estadoAutenticacionSubject.next({
      ...estadoActual,
      error,
      isLoading: false
    });
  }

  private setUsuarioAutenticado(usuario: UsuarioCompleto): void {
    this.estadoAutenticacionSubject.next({
      isAuthenticated: true,
      isLoading: false,
      usuario,
      error: null
    });
  }

  private setUsuarioNoAutenticado(): void {
    this.estadoAutenticacionSubject.next({
      isAuthenticated: false,
      isLoading: false,
      usuario: null,
      error: null
    });
  }

  /**
   * Métodos públicos de la API
   */
  
  /**
   * Obtiene el usuario actual como observable
   */
  public getUsuario$(): Observable<UsuarioCompleto | null> {
    return this.estadoAutenticacion$.pipe(
      map(estado => estado.usuario)
    );
  }

  /**
   * Obtiene el usuario actual de forma síncrona
   */
  public getUsuarioActual(): UsuarioCompleto | null {
    return this.estadoAutenticacionSubject.value.usuario;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  public isAuthenticated$(): Observable<boolean> {
    return this.estadoAutenticacion$.pipe(
      map(estado => estado.isAuthenticated)
    );
  }

  /**
   * Verifica si el usuario está autenticado de forma síncrona
   */
  public isAuthenticated(): boolean {
    return this.estadoAutenticacionSubject.value.isAuthenticated;
  }

  /**
   * Obtiene el RFC del usuario actual
   */
  public getRFC(): string {
    return this.getUsuarioActual()?.rfc || '';
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  public getNombre(): string {
    return this.getUsuarioActual()?.nombre || '';
  }

  /**
   * Obtiene los roles del usuario actual
   */
  public getRoles(): string[] {
    return this.getUsuarioActual()?.rolesArray || [];
  }

  /**
   * Obtiene el token actual
   */
  public getToken(): string {
    return this.getUsuarioActual()?.token || '';
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  public tieneRol(rol: string): boolean {
    const roles = this.getRoles();
    return roles.some(userRole => userRole.includes(rol));
  }

  /**
   * Verifica si el usuario tiene permisos de administrador
   */
  public esAdmin(): boolean {
    return this.getUsuarioActual()?.esAdmin || false;
  }

  /**
   * Actualiza la información del usuario cuando cambia sessionInfo
   */
  public actualizarUsuario(): void {
    this.inicializarUsuario();
  }

  /**
   * Cierra la sesión del usuario
   */
  public logout(): void {
    localStorage.removeItem('sessionInfo');
    this.setUsuarioNoAutenticado();
  }

  /**
   * Carga la información de administración del usuario desde el backend
   */
  private cargarAdministracion(): void {
    const usuarioActual = this.getUsuarioActual();
    if (!usuarioActual) {
      this.setLoading(false);
      return;
    }

    // expedientes/buscar es placeholder legacy; en backend Tlalcalli cae en GET /expedientes/{id}
    // con id="buscar" y falla al parsear i32.
    if (environment.cardsInfo === 'expedientes/buscar') {
      this.establecerAdministracionPorDefecto(usuarioActual);
      return;
    }

    // Añadir timeout para evitar carga infinita
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ [UserService] Timeout al cargar administración, estableciendo valores por defecto');
      this.establecerAdministracionPorDefecto(usuarioActual);
    }, 10000); // 10 segundos timeout

    this.cardsService.cardsInfo().subscribe({
      next: (data) => {
        clearTimeout(timeoutId);
        const administracionObj = data.find(i => 'Administracion' in i) as { Administracion: AdministracionResponse };
        
        if (administracionObj && administracionObj.Administracion) {
          const numeroAdministracion = administracionObj.Administracion.Administracion;
          const descripcion = this.obtenerDescripcionAdministracion(numeroAdministracion);
          
          // Actualizar el usuario con la información de administración
          const usuarioActualizado: UsuarioCompleto = {
            ...usuarioActual,
            administracion: numeroAdministracion,
            descripcionAdministracion: descripcion
          };
          
          this.setUsuarioAutenticado(usuarioActualizado);
        } else {
          this.establecerAdministracionPorDefecto(usuarioActual);
        }
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.warn('⚠️ [UserService] Error al cargar información de administración (endpoint no disponible):', error.status);
        
        // Continuar sin bloquear la app - el endpoint de Tlalcalli aún no está implementado
        console.warn('⚠️ [UserService] Continuando con administración por defecto...');
        
        this.establecerAdministracionPorDefecto(usuarioActual);
      }
    });
  }

  /**
   * Establece la administración por defecto para el usuario
   */
  private establecerAdministracionPorDefecto(usuarioActual: UsuarioCompleto): void {
    const usuarioActualizado: UsuarioCompleto = {
      ...usuarioActual,
      administracion: null,
      descripcionAdministracion: 'Sin administración'
    };
    
    this.setUsuarioAutenticado(usuarioActualizado);
  }

  /**
   * Obtiene la descripción de la administración basada en el número
   */
  private obtenerDescripcionAdministracion(numero: number): string {
    const administraciones: Record<number, string> = {
      1: 'Administración Central de Servicios Tributarios al Contribuyente',
      2: 'Administración Central de Recaudación',
      3: 'Administración Central de Fiscalización',
      4: 'Administración Central de Normatividad',
      5: 'Administración Central de Planeación y Evaluación'
    };

    return administraciones[numero] || `Administración ${numero}`;
  }

  /**
   * Obtiene la administración del usuario actual
   */
  public getAdministracion(): number | null {
    return this.getUsuarioActual()?.administracion || null;
  }

  /**
   * Obtiene la descripción de la administración del usuario actual
   */
  public getDescripcionAdministracion(): string {
    return this.getUsuarioActual()?.descripcionAdministracion || 'No disponible';
  }

  /**
   * Obtiene información de sesión para debuging
   */
  public getInfoSesion(): any {
    const usuario = this.getUsuarioActual();
    if (!usuario) return null;
    
    return {
      rfc: usuario.rfc,
      nombre: usuario.nombre,
      roles: usuario.rolesArray,
      administracion: usuario.administracion,
      descripcionAdministracion: usuario.descripcionAdministracion,
      tiempoRestante: usuario.tiempoRestanteSesion,
      proximaExpirar: usuario.sesionProximaExpirar,
      fechaExpiracion: usuario.fechaExpiracion,
      tipoContribuyente: usuario.tipoContribuyente,
      tipoPersona: usuario.tipoPersona
    };
  }
} 