# Account Opening Module

Este módulo implementa la funcionalidad de apertura de cuenta con un formulario de datos personales, siguiendo los principios SOLID y las mejores prácticas de Angular.

## Estructura del Módulo

```
account-opening/
├── components/
│   ├── form-field/           # Componente reutilizable para campos de formulario
│   └── tax-declaration-toggle/ # Componente para el toggle de declaración de impuestos
├── pages/
│   └── welcome/              # Página principal del formulario
├── services/
│   └── account-opening-store.service.ts # Servicio de estado
├── account-opening.routes.ts # Rutas del módulo
├── account-opening.module.ts # Módulo principal
└── account-opening-entry.component.ts # Componente contenedor
```

## Características

### 🎨 Diseño Mobile-First
- Diseño responsive optimizado para dispositivos móviles
- Metodología BEM para estilos SCSS
- Colores del sistema de diseño (#127277 para enlaces, #e74c3c para errores)

### 🔧 Componentes Stencil
- `std-input` para campos de entrada
- `std-button` para botones
- `std-checkbox` para checkboxes
- Integración completa con la librería stencil

### ✅ Validaciones
- DNI: 8 dígitos numéricos
- Celular: 9 dígitos numéricos
- Email: formato válido de email
- Validación en tiempo real con mensajes de error

### 🌐 Internacionalización
- Servicio de textos con soporte para múltiples idiomas
- Archivos de traducción en `assets/i18n/`
- Uso de signals para reactividad

### 🏗️ Arquitectura SOLID
- **Single Responsibility**: Cada componente tiene una responsabilidad específica
- **Open/Closed**: Componentes extensibles sin modificación
- **Liskov Substitution**: Interfaces bien definidas
- **Interface Segregation**: Interfaces específicas para cada funcionalidad
- **Dependency Inversion**: Inyección de dependencias

## Componentes

### FormFieldComponent
Componente reutilizable para campos de formulario con validación integrada.

```typescript
interface FormFieldConfig {
  label: string;
  placeholder: string;
  errorMessage: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  maxLength?: number;
  required?: boolean;
}
```

### TaxDeclarationToggleComponent
Componente para el toggle de declaración de impuestos.

```typescript
interface TaxDeclarationOption {
  value: boolean;
  label: string;
}
```

## Servicios

### AccountOpeningStoreService
Servicio de estado que maneja:
- Datos del formulario
- Validaciones
- Estados de error
- Envío del formulario

## Rutas

```typescript
const routes: Routes = [
  {
    path: 'account-opening',
    children: ACCOUNT_OPENING_ROUTES,
  },
];
```

## Uso

1. **Navegación**: La ruta por defecto redirige a `/account-opening`
2. **Formulario**: Los campos se validan en tiempo real
3. **Envío**: El botón "Continuar" se habilita cuando el formulario es válido
4. **Estado**: El estado se mantiene en el servicio de store

## Estilos

Los estilos siguen la metodología BEM:

```scss
.welcome-page {
  &__container { }
  &__title { }
  &__field {
    &__label { }
    &__input { }
    &__error { }
  }
}
```

## Colores del Sistema

- **Error**: #e74c3c
- **Enlace**: #127277
- **Texto**: #333333
- **Placeholder**: #999999
- **Fondo**: #ffffff
- **Toggle activo**: #127277
