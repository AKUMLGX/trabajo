import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';

@Component({
  selector: 'app-comments-page',
  standalone: true,
  imports: [InitTemplateComponent],
  templateUrl: './comments-page.component.html',
  styleUrl: './comments-page.component.css'
})
export class CommentsPageComponent {

}
