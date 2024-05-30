import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AsuntoResponse, Value } from '../../interfaces/ausuntos-response.interface';



@Injectable({
    providedIn: 'root'
})
export class PdfAcuseService {

    constructor() { }
    async generatePDF(data: AsuntoResponse): Promise<Blob> {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        console.log("Entrando a la generacion");

        let htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acuse</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Montserrat';
                margin: 0;
                padding: 0;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
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
                max-width: 800px;
                margin: 20px;
                padding: 20px;
                background-color: #fff;

                position: relative;
            }
            h1 {
                text-align: center;
                color: #800020;
                margin-bottom: 20px;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .header .description {
                font-size: 10px;
                font-weight: normal;
                margin-top:30px;
                margin-left:20px;
                color: #800020;
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
                margin-bottom: 30px;
                padding: 20px;


            }
            .document h2 {
                margin-top: 0;
                margin-bottom: 16px;
                color: #800020;
                font-size: 24px;

                padding-bottom: 10px;
            }
            .document .fields {
                font-size:12px;
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: space-between;
            }
            .document .field {
                flex: 1 1 calc(50% - 20px);
                margin-bottom: 10px;
                color: #333;
            }
            .document label {
                font-weight: normal;
                color: #800020;
                display: block;
                margin-bottom: 5px;
            }
            .date {
                text-align: right;
                color: #666;
                font-style: italic;
                position: absolute;
                right: 20px;
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
                <img class="logo-left"  alt="Logo Izquierdo" width="300">
                <img class="logo-right"  alt="Logo Derecho" width="90">
                <h1>Acuse Akamba</h1>
                <div class="date">Fecha: ${formattedDate}</div>
                <div class="header">
                    <div class="description">Descripción: ${data.descripcion}</div>
                    <div class="author">Autor: ${data.autor}</div>
                </div>
                <div class="document">
                <div class="folio" style="color: #006666;  font-size: 12px; font-weight: normal;">Registros:</div>
                    <div class="fields">`;
        for (const [key, value] of Object.entries(data.values[0])) {
            if (value !== null) {
                htmlContent += ` <div class="field"><label>${key.replace(/_/g, ' ')}:</label> ${value !== null ? value : 'N/A'}</label></div>`;
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
        const canvas = await html2canvas(content, { scale: 2 });
        const imgWidth = 541.89; // Ancho personalizado
        const imgHeight = 795.28; // Alto personalizado
        const imgPosX = 10; // Posición X personalizada
        const imgPosY = 10; // Posición Y personalizada

        const imgData = canvas.toDataURL('image/png');

        doc.addImage(imgData, 'PNG', imgPosX, imgPosY, imgWidth, imgHeight);


        // await new Promise(resolve => setTimeout(resolve, 1000));

        doc.addImage(imgData, 'PNG', imgPosX, imgPosY, imgWidth, imgHeight);

        document.body.removeChild(content);
        return new Promise<Blob>((resolve) => {
          console.log("Descargando");
          doc.save("Acuse.pdf");
          document.body.removeChild(content);
            //const blob = doc.output('blob');
            //resolve(blob);
        });
    }
}
