# Implementación de Identity MFE

## Estructura del Proyecto

La implementación sigue la misma estructura que el proyecto OTP, aplicando principios SOLID y Clean Code.

### Servicios Core

#### 1. IdentityStoreService

- **Ubicación**: `src/app/core/services/identity-store.service.ts`
- **Descripción**: Servicio de estado global usando Angular Signals
- **Características**:
  - Manejo de estado reactivo con signals
  - Estado inmutable con computed properties
  - Acciones para actualizar el estado
  - Validaciones de completitud de pasos

#### 2. IdentityApiService

- **Ubicación**: `src/app/core/services/identity-api.service.ts`
- **Descripción**: Servicio para comunicación con el backend
- **Endpoints**:
  - `verifyIdentity()`: Verifica identidad con imágenes capturadas
  - `uploadImage()`: Sube una imagen individual
  - `validateImageQuality()`: Valida calidad de imagen
  - `getVerificationStatus()`: Obtiene estado de verificación

#### 3. TextService

- **Ubicación**: `src/app/core/services/text.service.ts`
- **Descripción**: Servicio para internacionalización
- **Características**:
  - Carga de textos desde archivos JSON
  - Interpolación de parámetros
  - Soporte para propiedades anidadas

### Componentes Compartidos

#### 1. IdentityNavigationComponent

- **Ubicación**: `src/app/shared/components/identity-navigation/`
- **Descripción**: Componente de navegación con botón de retroceso
- **Metodología**: BEM (Block Element Modifier)

#### 2. IdentityTitleSectionComponent

- **Ubicación**: `src/app/shared/components/identity-title-section/`
- **Descripción**: Componente de título con soporte para prefix, highlight y suffix
- **Características**:
  - Soporte para ícono de éxito
  - Estilos personalizados para highlight (#dc3545)

#### 3. IdentityInstructionsComponent

- **Ubicación**: `src/app/shared/components/identity-instructions/`
- **Descripción**: Componente de lista de instrucciones
- **Características**:
  - Tarjeta con fondo #F5F9FB
  - Iconos personalizables
  - Diseño responsivo

#### 4. IdentityConsentComponent

- **Ubicación**: `src/app/shared/components/identity-consent/`
- **Descripción**: Componente de consentimiento biométrico
- **Características**:
  - Checkbox personalizado
  - Texto con highlight en color #23779A
  - Emisión de eventos de cambio

#### 5. IdentityCameraComponent

- **Ubicación**: `src/app/shared/components/identity-camera/`
- **Descripción**: Componente de captura de cámara
- **Características**:
  - Soporte para DNI (frente/reverso) y selfie
  - Overlay con marco guía (rectangular para DNI, circular para selfie)
  - Validación de calidad de imagen
  - Uso de cámara trasera para DNI y frontal para selfie
  - Manejo de permisos de cámara
  - Desactivación automática al salir
  - Atributo `playsinline` para iOS

### Páginas

#### 1. IdentityOnboardingPage

- **Ruta**: `/biometria/onboarding`
- **Descripción**: Pantalla de introducción
- **Características**:
  - Lista de instrucciones
  - Checkbox de consentimiento biométrico (opcional)
  - Botón de continuar

#### 2. IdentityDniFrente Page

- **Ruta**: `/biometria/dni-frente`
- **Descripción**: Captura del frente del DNI
- **Características**:
  - Cámara con overlay rectangular
  - Validación de calidad
  - Navegación automática al siguiente paso
  - Indicador de éxito

#### 3. IdentityDniReversoPage

- **Ruta**: `/biometria/dni-reverso`
- **Descripción**: Captura del reverso del DNI
- **Características**:
  - Cámara con overlay rectangular
  - Validación de calidad
  - Navegación automática al siguiente paso
  - Indicador de éxito

#### 4. IdentitySelfie Page

- **Ruta**: `/biometria/selfie`
- **Descripción**: Captura de selfie
- **Características**:
  - Cámara frontal con overlay circular
  - Validación de rostro
  - Navegación automática al siguiente paso
  - Indicador de éxito

#### 5. IdentitySuccessPage

- **Ruta**: `/biometria/success`
- **Descripción**: Pantalla de éxito
- **Características**:
  - Ícono de persona con checkmark
  - Navegación automática al inicio después de 3 segundos
  - Botón para ir al inicio

### Directivas

#### 1. StdButtonDirective

- **Ubicación**: `src/app/shared/directives/std-button.directive.ts`
- **Descripción**: Directiva para integrar std-button con Angular Forms
- **Implementa**: ControlValueAccessor

#### 2. StdCheckboxDirective

- **Ubicación**: `src/app/shared/directives/std-checkbox.directive.ts`
- **Descripción**: Directiva para integrar std-checkbox con Angular Forms
- **Implementa**: ControlValueAccessor

### Internacionalización

#### Archivo de Textos

- **Ubicación**: `src/assets/i18n/es.json`
- **Estructura**:
  ```json
  {
    "identity": {
      "onboarding": {
        "title": {
          "prefix": "...",
          "highlight": "..."
        },
        "subtitle": "...",
        "instructions": {...},
        "consent": {...}
      },
      "dni-frente": {...},
      "dni-reverso": {...},
      "selfie": {...},
      "success": {...},
      "common": {...}
    }
  }
  ```

### Rutas

```typescript
/biometria
  /onboarding
  /dni-frente
  /dni-reverso
  /selfie
  /success
```

### Estilos

#### Metodología BEM

Todos los componentes siguen la metodología BEM (Block Element Modifier):

- Block: `.identity-onboarding-page`
- Element: `.identity-onboarding-page__container`
- Modifier: `.identity-onboarding-page__container--active`

#### Colores

- Background principal: `#f8f9fa`
- Background secundario: `#F5F9FB`
- Texto highlight: `#dc3545`
- Texto biométrico: `#23779A`
- Éxito: `#28a745`
- Error: `#dc3545`

### Funcionalidad de Cámara

#### Características Implementadas

1. **Selección de cámara**: Trasera para DNI, frontal para selfie
2. **Overlay guía**: Rectangular para DNI, circular para selfie
3. **Validación de calidad**: Verificación de nitidez y luz
4. **Manejo de permisos**: Detección y manejo de permisos denegados
5. **Desactivación automática**: La cámara se desactiva al salir de la vista
6. **Soporte iOS**: Uso de `playsinline` para evitar pantalla completa
7. **Procesamiento en memoria**: No se guardan fotos localmente, se procesan en base64

#### Consideraciones de Seguridad

- Las imágenes se procesan en memoria
- No se almacenan localmente
- Se valida la calidad antes de enviar al backend
- Indicador de estado de cámara (activa/inactiva)

### Principios Aplicados

#### SOLID

- **Single Responsibility**: Cada componente tiene una única responsabilidad
- **Open/Closed**: Los componentes son extensibles sin modificar el código existente
- **Liskov Substitution**: Los componentes pueden ser sustituidos por sus subtipos
- **Interface Segregation**: Interfaces específicas para cada necesidad
- **Dependency Inversion**: Dependencias inyectadas, no hardcodeadas

#### Clean Code

- Nombres descriptivos y significativos
- Funciones pequeñas y enfocadas
- Comentarios JSDoc para documentación
- Manejo de errores consistente
- Código DRY (Don't Repeat Yourself)

### Componentes de Stencil Utilizados

1. **std-button**: Botón personalizado
2. **std-checkbox**: Checkbox personalizado (si está disponible)

### Próximos Pasos

1. Integrar con el backend real
2. Implementar validaciones avanzadas de imagen
3. Agregar animaciones de transición
4. Implementar manejo de errores más robusto
5. Agregar pruebas unitarias y e2e
6. Optimizar rendimiento de cámara
7. Agregar soporte para múltiples idiomas

### Notas Importantes

- No se modificó nada del proyecto OTP
- Se siguió la misma estructura y convenciones
- Se utilizaron componentes de stencil-library sin modificarlos
- Se aplicó metodología BEM para todos los estilos
- Se implementó manejo de estado con Angular Signals
- Se siguieron las mejores prácticas de Angular standalone components

