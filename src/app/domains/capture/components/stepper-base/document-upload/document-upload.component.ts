import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  url?: string;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="document-upload-container">
      <div class="upload-header">
        <h3 class="upload-title">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          Documentos Adjuntos
        </h3>
        <p class="upload-description">
          Sube documentos en formato PDF, Word, Excel o imágenes
        </p>
      </div>

      <!-- Zona de carga -->
      <div class="upload-zone" 
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.drag-over]="isDragOver"
           (click)="fileInput.click()">
        <input #fileInput 
               type="file" 
               multiple 
               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
               (change)="onFileSelected($event)"
               style="display: none;">
        
        <div class="upload-content">
          <mat-icon class="upload-cloud-icon">cloud_upload</mat-icon>
          <h4 class="upload-text">Arrastra archivos aquí o haz clic para seleccionar</h4>
          <p class="upload-subtext">Formatos soportados: PDF, Word, Excel, Imágenes</p>
          <p class="upload-size">Tamaño máximo: 10MB por archivo</p>
        </div>
      </div>

      <!-- Lista de documentos subidos -->
      <div class="uploaded-documents" *ngIf="documents.length > 0">
        <h4 class="documents-title">Documentos Subidos ({{ documents.length }})</h4>
        <div class="documents-list">
          <div class="document-item" *ngFor="let doc of documents; trackBy: trackByDocumentId">
            <div class="document-info">
              <mat-icon class="document-icon" [class]="getFileIconClass(doc.type)">
                {{ getFileIcon(doc.type) }}
              </mat-icon>
              <div class="document-details">
                <span class="document-name">{{ doc.name }}</span>
                <span class="document-size">{{ formatFileSize(doc.size) }}</span>
              </div>
            </div>
            <div class="document-actions">
              <button mat-icon-button 
                      class="action-btn preview-btn"
                      (click)="previewDocument(doc)"
                      matTooltip="Vista previa">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button 
                      class="action-btn download-btn"
                      (click)="downloadDocument(doc)"
                      matTooltip="Descargar">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button 
                      class="action-btn delete-btn"
                      (click)="removeDocument(doc.id)"
                      matTooltip="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-upload-container {
      padding: 1.5rem;
      background: linear-gradient(135deg, #DDC9A4/5, white);
      border-radius: 16px;
      border: 2px solid #DDC9A4/20;
    }

    .upload-header {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .upload-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2D2A26;
      margin: 0 0 0.5rem 0;
    }

    .upload-icon {
      color: #691C32;
      font-size: 1.5rem;
    }

    .upload-description {
      color: #663442;
      margin: 0;
      font-size: 0.9rem;
    }

    .upload-zone {
      border: 2px dashed #DDC9A4;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      margin-bottom: 1.5rem;
    }

    .upload-zone:hover {
      border-color: #691C32;
      background: #DDC9A4/5;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(105, 28, 50, 0.1);
    }

    .upload-zone.drag-over {
      border-color: #691C32;
      background: #DDC9A4/10;
      transform: scale(1.02);
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .upload-cloud-icon {
      font-size: 3rem;
      color: #691C32;
      margin-bottom: 0.5rem;
    }

    .upload-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2D2A26;
      margin: 0;
    }

    .upload-subtext {
      color: #663442;
      margin: 0;
      font-size: 0.9rem;
    }

    .upload-size {
      color: #B7B7B6;
      margin: 0;
      font-size: 0.8rem;
    }

    .uploaded-documents {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid #DDC9A4/20;
    }

    .documents-title {
      font-size: 1rem;
      font-weight: 600;
      color: #2D2A26;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .documents-title::before {
      content: "📄";
      font-size: 1.2rem;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #DDC9A4/5;
      border-radius: 8px;
      border: 1px solid #DDC9A4/20;
      transition: all 0.2s ease;
    }

    .document-item:hover {
      background: #DDC9A4/10;
      transform: translateX(4px);
    }

    .document-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .document-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .document-icon.pdf { color: #9F2241; }
    .document-icon.word { color: #235B4E; }
    .document-icon.excel { color: #691C32; }
    .document-icon.image { color: #663442; }
    .document-icon.default { color: #B7B7B6; }

    .document-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .document-name {
      font-weight: 500;
      color: #2D2A26;
      font-size: 0.9rem;
    }

    .document-size {
      color: #663442;
      font-size: 0.8rem;
    }

    .document-actions {
      display: flex;
      gap: 0.25rem;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .preview-btn { color: #235B4E; }
    .download-btn { color: #691C32; }
    .delete-btn { color: #9F2241; }

    .action-btn:hover {
      background: rgba(221, 201, 164, 0.2);
    }

    @media (max-width: 768px) {
      .document-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .document-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class DocumentUploadComponent implements OnInit {
  @Input() maxFiles: number = 10;
  @Input() maxFileSize: number = 10 * 1024 * 1024; // 10MB
  @Output() documentsChange = new EventEmitter<UploadedDocument[]>();

  documents: UploadedDocument[] = [];
  isDragOver = false;

  ngOnInit() {
    // Inicializar si hay documentos previamente cargados
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    for (const file of files) {
      if (this.documents.length >= this.maxFiles) {
        alert(`Solo puedes subir máximo ${this.maxFiles} archivos`);
        break;
      }

      if (file.size > this.maxFileSize) {
        alert(`El archivo ${file.name} excede el tamaño máximo de ${this.formatFileSize(this.maxFileSize)}`);
        continue;
      }

      if (!this.isValidFileType(file)) {
        alert(`El archivo ${file.name} no es un tipo de archivo válido`);
        continue;
      }

      const document: UploadedDocument = {
        id: this.generateId(),
        name: file.name,
        size: file.size,
        type: this.getFileType(file),
        file: file
      };

      this.documents.push(document);
    }

    this.documentsChange.emit(this.documents);
  }

  private isValidFileType(file: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    return validTypes.includes(file.type);
  }

  private getFileType(file: File): string {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'word';
    if (file.type.includes('sheet') || file.type.includes('excel')) return 'excel';
    if (file.type.includes('image')) return 'image';
    return 'default';
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'pdf': return 'picture_as_pdf';
      case 'word': return 'description';
      case 'excel': return 'table_chart';
      case 'image': return 'image';
      default: return 'insert_drive_file';
    }
  }

  getFileIconClass(type: string): string {
    return type;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  previewDocument(document: UploadedDocument) {
    // Implementar vista previa
    console.log('Preview document:', document.name);
  }

  downloadDocument(doc: UploadedDocument) {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  removeDocument(id: string) {
    this.documents = this.documents.filter(doc => doc.id !== id);
    this.documentsChange.emit(this.documents);
  }

  trackByDocumentId(index: number, document: UploadedDocument): string {
    return document.id;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
