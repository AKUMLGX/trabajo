import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AsuntoResponse, Value } from '../../interfaces/ausuntos-response.interface';



@Injectable({
    providedIn: 'root'
})
export class PdfAcuseService {

    constructor() { }
    async generatePDF(data: AsuntoResponse): Promise<void> {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        let htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acuse</title>
        <style>
            body {
                font-family: 'Montserrat';
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                width: 100vw;
                overflow: hidden;
            }
            .page {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
            }
            .container {
                width: 100%;
                padding-top: 20px;
                padding-bottom: 20px;
                background-color: #fff;
                position: relative;
                border: 1px solid  #800020;
            }
            h5 {
                font-size:14px;
                text-align: center;
                color: #800020;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .header .description {
                font-size: 10px;
                font-weight: normal;
                margin-top:10px;
                margin-left:5px;
                color: #006666
            }
            .header .author {
                font-size: 10px;
                margin-left:80px;
                color: #800020;
            }
            .header .folio {
                font-size: 18px;
                text-align: right;
            }
            .document {
                padding-left: 5px;
            }

            .document label {
                color: #800020;
                font-size: 10px;
            }
            span {
                color: black;
                font-size: 8px;
            }
            .date {
                text-align: right;
                font-size: 10px;
                color: #666;
                font-style: italic;
                position: absolute;
                right: 5px;
                top:0;
            }
            .logo-left {
                position: absolute;
                top: 10px;
                left: 20px;
            }
            .logo-right {
                position: absolute;
                top: 35px;
                right: 20px;
            }
        </style>
    </head>
    <body>
            <div class="container">
                <h5>Acuse Akamba</h5>
                <div class="date">Fecha: ${formattedDate}</div>
                <div class="header">
                    <div class="description">Descripción: <span> ${data.descripcion}</span></div>
                </div>
                <div class="document">
                <div class="folio" style="color: #006666;  font-size: 10px; font-weight: normal;">Registros:</div>
                    <div>`;
        for (const [key, value] of Object.entries(data.values[0])) {
            if (value !== null) {
                htmlContent += ` <div><label>${key.replace(/_/g, ' ')}:<span>${value !== null ? ' ' + value : ' N/A'}</span> </label> </div>`;
            }
        }
        htmlContent += `
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

        const doc = new jsPDF('p', 'pt', 'a4');
        const content: HTMLElement = document.createElement('div');
        content.innerHTML = htmlContent;

        document.body.appendChild(content);
        const canvas = await html2canvas(content, { scale: 10 });
        const imgWidth = 576; // Ancho personalizado
        const imgHeight = 820; // Alto personalizado
        const imgPosX = 10; // Posición X personalizada
        const imgPosY = 10; // Posición Y personalizada

        const imgData = canvas.toDataURL('image/png');

        doc.addImage(imgData, 'PNG', imgPosX, imgPosY, imgWidth, imgHeight);
        
        doc.save("Acuse.pdf");
        document.body.removeChild(content);
        return;
    }
}
