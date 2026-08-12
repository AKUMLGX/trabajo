import { Component, OnInit } from '@angular/core';
import MsgReader, { FieldsData } from '@kenjiuno/msgreader';
import { FileService } from '../../services/file.service';

@Component({
    selector: 'app-msg-reader',
    imports: [],
    templateUrl: './msg-reader.component.html',
    styleUrl: './msg-reader.component.css'
})
export class MsgReaderComponent implements OnInit {

  public senderName: string | undefined = '';
  public senderEmail: string | undefined = '';
  public recipients: FieldsData[] | undefined = [];
  public submitTime: string | undefined = '';
  public subject: string | undefined = '';
  public body: string | undefined = '';
  public attachments: FieldsData[] | undefined = [];

  public msg = '';

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    this.fileService.msgUpdated.subscribe((msg) => {
      this.msg = msg;
      const byteCharacters = atob(msg);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const msgReader = new MsgReader(byteArray);
      const fileData = msgReader.getFileData();
      if (!fileData.error) {
        this.senderName = fileData.senderName;
        this.senderEmail = fileData.senderSmtpAddress !== null &&
          fileData.senderSmtpAddress !== undefined
          ? fileData.senderSmtpAddress : fileData.lastModifierName;
        this.recipients = fileData.recipients;
        this.submitTime = fileData.clientSubmitTime !== null &&
          fileData.clientSubmitTime !== undefined
          ? fileData.clientSubmitTime : fileData.creationTime;
        this.subject = fileData.subject;
        this.body = fileData.body;
        this.attachments = fileData.attachments;
      }
    });
  }

  downloadMsg(): void {
    const byteCharacters = atob(this.msg);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'correo.msg';
    link.click();
  }
}
