import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type CustomModalType = 'confirm' | 'input';

@Component({
  selector: 'app-custom-modal2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './custom-modal.component.html',
})
export class CustomModalComponent2 implements OnChanges {
  @Input() visible = false;
  @Input() type: CustomModalType = 'confirm';

  @Input() title = '';
  @Input() inputPlaceholder = '';
  @Input() confirmText = 'Aceptar';
  @Input() cancelText = 'Cancelar';
  @Input() inputValue = '';

  valor = '';

  @Output() cancelClick =
    new EventEmitter<void>();

  @Output() confirm =
    new EventEmitter<string | void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['visible'] &&
      this.visible
    ) {
      this.valor =
        this.inputValue ?? '';
    }
  }

  onCancel(): void {
    this.valor = '';
    this.cancelClick.emit();
  }

  onConfirm(): void {
    if (this.type === 'input') {
      const valorLimpio =
        this.valor.trim();

      if (!valorLimpio) {
        return;
      }

      this.confirm.emit(valorLimpio);
      return;
    }

    this.confirm.emit();
  }
}