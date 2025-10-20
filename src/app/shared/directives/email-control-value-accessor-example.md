# Email Control Value Accessor Directive

## Uso en el template

### Opción 1: Con Reactive Forms (Standalone)
```html
<!-- En tu componente standalone -->
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

### Eventos que escucha la directiva:
- `changeEvent` - Evento principal del std-input cuando cambia el valor
- `blurEvent` - Evento cuando el input pierde el foco
- `focusEvent` - Evento cuando el input recibe el foco
- `input` - Evento nativo como fallback
- `blur` - Evento nativo como fallback

### Importar en el componente standalone
```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmailControlValueAccessorDirective } from './shared/directives/email-control-value-accessor.directive';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EmailControlValueAccessorDirective
  ],
  template: `
    <form [formGroup]="form">
      <std-input
        appEmailControlValueAccessor
        formControlName="email"
        type="email"
        label="Correo electrónico"
        placeholder="Ingresa tu correo"
      />
    </form>
  `
})
export class YourComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
}
```

### Opción 2: Con Template-driven Forms (Standalone)
```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmailControlValueAccessorDirective } from './shared/directives/email-control-value-accessor.directive';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [
    FormsModule,
    EmailControlValueAccessorDirective
  ],
  template: `
    <std-input
      appEmailControlValueAccessor
      [(ngModel)]="email"
      type="email"
      label="Correo electrónico"
      placeholder="Ingresa tu correo"
    />
  `
})
export class YourComponent {
  email: string = '';
}
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

## Uso Standalone

### Importar la directiva en cualquier componente
```typescript
import { EmailControlValueAccessorDirective } from './shared/directives/email-control-value-accessor.directive';

@Component({
  // ...
  imports: [
    EmailControlValueAccessorDirective, // ← Solo agregar aquí
    // otros imports...
  ]
})
```

### Ventajas del Standalone
- ✅ **No necesita módulos** - se importa directamente
- ✅ **Tree-shaking** - solo se incluye si se usa
- ✅ **Fácil de reutilizar** en cualquier componente
- ✅ **Compatible** con Angular 14+
- ✅ **Mejor rendimiento** - menos código cargado

## Características de la directiva

- ✅ **Standalone directive** - no requiere módulos
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
