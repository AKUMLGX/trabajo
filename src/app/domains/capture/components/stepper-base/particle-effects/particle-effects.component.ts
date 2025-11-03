import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

@Component({
  selector: 'app-particle-effects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas 
      #particleCanvas 
      class="particle-canvas"
      [class.dark-mode]="isDarkMode">
    </canvas>
  `,
  styleUrls: ['./particle-effects.component.css']
})
export class ParticleEffectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() isDarkMode = false;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId!: number;
  private mouseX = 0;
  private mouseY = 0;
  private isMouseOver = false;

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.startAnimation();
    
    // Event listeners
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseenter', () => this.isMouseOver = true);
    this.canvas.addEventListener('mouseleave', () => this.isMouseOver = false);
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private onMouseMove(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
    
    // Crear partículas en la posición del mouse
    if (this.isMouseOver) {
      this.createParticles(this.mouseX, this.mouseY);
    }
  }

  private createParticles(x: number, y: number) {
    const colors = this.isDarkMode 
      ? ['#fbbf24', '#f59e0b', '#d97706', '#92400e']
      : ['#691C32', '#8B2635', '#A03342', '#dc2626'];
    
    for (let i = 0; i < 3; i++) {
      const particle: Particle = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 60 + 30
      };
      this.particles.push(particle);
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      
      // Aplicar gravedad
      particle.vy += 0.1;
      
      // Reducir velocidad por fricción
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      // Remover partículas muertas
      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      const alpha = 1 - (particle.life / particle.maxLife);
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private animate() {
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private startAnimation() {
    this.animate();
  }

  public setDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
  }
}

