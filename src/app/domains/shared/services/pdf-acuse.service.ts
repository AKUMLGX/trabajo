import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AsuntoResponse, Value } from '../../interfaces/ausuntos-response.interface';



@Injectable({
    providedIn: 'root'
})
export class PdfAcuseService {

    constructor() { }
    generatePDF(file: string): void {
        const byteCharacters = atob(file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'Acuse.pdf';
        link.click();
    }
}
