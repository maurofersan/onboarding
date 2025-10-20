# Email Control Value Accessor Directive

## Uso en el template

### Opción 1: Con Reactive Forms
```html
<!-- En tu componente -->
<form [formGroup]="form">
  <std-input
    appEmailControlValueAccessor
    formControlName="email"
    type="email"
    label="Correo electrónico"
    placeholder="Ingresa tu correo"
  />
</form>
```

### Opción 2: Con Template-driven Forms
```html
<!-- En tu componente -->
<std-input
  appEmailControlValueAccessor
  [(ngModel)]="email"
  type="email"
  label="Correo electrónico"
  placeholder="Ingresa tu correo"
/>
```

### Opción 3: Con FormField Component
```html
<!-- Modificar el form-field.component.html -->
<std-input
  class="form-field__input"
  [type]="fieldType()"
  [label]="config.label"
  [placeholder]="config.placeholder"
  [value]="value"
  [maxlength]="maxLength()"
  [status]="hasError ? 'error' : 'default'"
  [appNumbersOnly]="shouldUseNumbersOnly()"
  [appDniValidation]="shouldUseDniValidation()"
  [appEmailControlValueAccessor]="config.type === 'email'"
  (stdInput)="onInputChange($event)"
  (focus)="onFocus($event)"
  (blur)="onBlur($event)"
/>
```

## Configuración en el componente

### Para Reactive Forms
```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class YourComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
}
```

### Para Template-driven Forms
```typescript
export class YourComponent {
  email: string = '';
}
```

## Características de la directiva

- ✅ **Implementa ControlValueAccessor** para integración con Angular Forms
- ✅ **Escucha eventos `stdInput`** del componente std-input
- ✅ **Maneja eventos `blur` y `focus`** correctamente
- ✅ **Logs detallados** para debugging
- ✅ **Sincronización bidireccional** automática
- ✅ **Soporte para validación** de Angular Forms

## Ventajas

1. **No modifica el componente form-field** existente
2. **Reutilizable** en cualquier std-input
3. **Compatible** con Reactive Forms y Template-driven Forms
4. **Mantiene la funcionalidad** existente del form-field
5. **Fácil de implementar** en otros proyectos
