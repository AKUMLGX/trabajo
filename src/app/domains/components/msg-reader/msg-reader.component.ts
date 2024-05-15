import { Component } from '@angular/core';
import fs from 'fs';
import MsgReader from '@kenjiuno/msgreader';

@Component({
  selector: 'app-msg-reader',
  standalone: true,
  imports: [],
  templateUrl: './msg-reader.component.html',
  styleUrl: './msg-reader.component.css',
})
export class MsgReaderComponent {
  loadMsg() {
    const msgFileBuffer = fs.readFileSync('./data/test.msg');
    const testMsg = new MsgReader(msgFileBuffer);
    const testMsgInfo = testMsg.getFileData();
    if (testMsgInfo.attachments != null) {
      for (const att of testMsgInfo.attachments) {
        console.log(att.fileName);
        // testMsg.getAttachment(att).content
      }
    }
  }
}
