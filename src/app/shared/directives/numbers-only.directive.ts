import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]',
  standalone: true
})
export class NumbersOnlyDirective {

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Permitir teclas especiales
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }

    // Si es una tecla permitida, no hacer nada
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Si es un número (0-9), permitir
    if (event.key >= '0' && event.key <= '9') {
      return;
    }

    // Si no es un número ni una tecla permitida, prevenir la entrada
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    if (clipboardData) {
      const pastedText = clipboardData.getData('text');
      // Solo permitir pegar si el texto contiene solo números
      if (!/^\d*$/.test(pastedText)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Remover cualquier carácter que no sea número
    const numbersOnly = value.replace(/[^0-9]/g, '');
    
    if (value !== numbersOnly) {
      input.value = numbersOnly;
      // Disparar evento de input para notificar al componente padre
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
