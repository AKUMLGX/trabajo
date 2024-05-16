import { Component } from '@angular/core';
import fs from 'fs';
import MsgReader from '@kenjiuno/msgreader';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-msg-reader',
  standalone: true,
  imports: [],
  templateUrl: './msg-reader.component.html',
  styleUrl: './msg-reader.component.css',
})
export class MsgReaderComponent {
  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.fileService.msgUpdated.subscribe((msg) => {
      const byteCharacters = atob(msg);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/octet-stream' });
      var blobURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'archivo.msg';
      link.click();
    });
  }
}
