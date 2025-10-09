import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  ElementRef,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChanges,
} from '@angular/core';
import {
  CameraType,
  CameraConstraints,
} from '../../../../shared/interfaces/identity.interfaces';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CameraComponent implements OnInit, OnDestroy, OnChanges {
  @Input() type: CameraType = 'dni-front';
  @Input() isActive: boolean = false;
  @Output() imageCaptured = new EventEmitter<string>();
  @Output() cameraError = new EventEmitter<string>();

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false })
  canvasElement!: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  isCapturing = false;

  ngOnInit(): void {
    // Initialize camera if isActive is already true
    if (this.isActive) {
      setTimeout(() => {
        this.initializeCamera();
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActive']) {
      const { currentValue, previousValue } = changes['isActive'];
      if (currentValue !== previousValue) {
        if (currentValue) {
          setTimeout(() => {
            this.initializeCamera();
          }, 0);
        } else {
          this.stopCamera();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  /**
   * Sets up video element properties for optimal mobile display
   * Following SOLID SRP - single responsibility for video setup
   */
  private setupVideoElement(video: HTMLVideoElement): void {
    // Clear any existing srcObject first
    video.srcObject = null;

    // Set video properties to ensure it displays correctly on mobile
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.controls = false;
    video.preload = 'none';

    // Set attributes for iOS Safari compatibility
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('muted', 'true');

    // Additional mobile-specific attributes
    // if (this.isMobileDevice()) {
    video.setAttribute('x-webkit-airplay', 'allow');
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'true');
    // }

    // Log video element properties for debugging
    console.log('Video element setup:', {
      muted: video.muted,
      autoplay: video.autoplay,
      playsInline: video.playsInline,
      preload: video.preload,
      controls: video.controls,
    });
  }

  /**
   * Detects the best supported MIME type for video
   */
  private getSupportedMimeType(): string | undefined {
    const mimeTypes = [
      'video/webm;codecs=vp8',
      'video/webm;codecs=vp9',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('Supported MIME type:', mimeType);
        return mimeType;
      }
    }

    console.log('No specific MIME type supported, using default');
    return undefined;
  }

  /**
   * Fallback method to get basic camera constraints without MIME type
   */
  private getFallbackConstraints(): MediaStreamConstraints {
    const isSelfie = this.type === 'selfie';
    const facingMode = isSelfie ? 'user' : 'environment';
    // const facingMode = 'user';

    return {
      video: {
        facingMode,
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    };
  }

  /**
   * Sets up video event handlers for proper video playback
   */
  private setupVideoEventHandlers(video: HTMLVideoElement): void {
    // Wait for video to be ready
    video.onloadedmetadata = () => {
      console.log(
        'Video metadata loaded, dimensions:',
        video.videoWidth,
        'x',
        video.videoHeight
      );
      console.log('Video srcObject:', video.srcObject);
      console.log('Video readyState:', video.readyState);

      // Force play immediately after metadata loads
      video
        .play()
        .then(() => {
          console.log('Video playing successfully');
        })
        .catch((playError) => {
          console.error('Error playing video:', playError);
          this.cameraError.emit('Error al reproducir el video de la cámara');
        });
    };

    // Handle video loading errors
    video.onerror = (error) => {
      console.error('Video error:', error);
      this.cameraError.emit('Error al cargar el video de la cámara');
    };

    // Additional event listeners for debugging
    video.oncanplay = () => {
      console.log('Video can play');
    };

    video.onplaying = () => {
      console.log('Video is playing');
    };

    video.onloadstart = () => {
      console.log('Video load started');
    };

    video.onloadeddata = () => {
      console.log('Video data loaded');
    };

    video.oncanplaythrough = () => {
      console.log('Video can play through');
    };

    // Force play after a short delay if autoplay fails
    setTimeout(() => {
      if (video.paused) {
        console.log('Video is paused, trying to play again...');
        video.play().catch((error) => {
          console.error('Failed to play video after timeout:', error);
        });
      }
    }, 1000);

    // Additional timeout for mobile devices
    setTimeout(() => {
      if (video.paused) {
        console.log('Video still paused after 2 seconds, forcing play...');
        video.play().catch((error) => {
          console.error('Failed to force play video:', error);
        });
      }
    }, 2000);
  }

  async initializeCamera(): Promise<void> {
    // Stop existing stream if any
    this.stopCamera();

    if (!this.isActive) {
      return;
    }

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported');
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        console.log('window.isSecureContext::', window.isSecureContext);
        throw new Error('Camera access requires HTTPS or localhost');
      }

      const constraints = this.getCameraConstraints();

      console.log('Requesting camera access with constraints:', constraints);

      try {
        // Request camera permission
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(
          'Camera access granted with MIME type, stream:',
          this.stream
        );
      } catch (mimeError) {
        console.log(
          'Failed with MIME type, trying fallback constraints:',
          mimeError
        );

        // Try with fallback constraints (without MIME type)
        const fallbackConstraints = this.getFallbackConstraints();
        console.log('Trying fallback constraints:', fallbackConstraints);

        this.stream = await navigator.mediaDevices.getUserMedia(
          fallbackConstraints
        );
        console.log(
          'Camera access granted with fallback, stream:',
          this.stream
        );
      }

      if (this.videoElement && this.stream) {
        const video = this.videoElement.nativeElement;
        console.log('video::', video);
        console.log('this.stream::', this.stream);

        // Setup video element properties first
        this.setupVideoElement(video);

        // Set the stream
        video.srcObject = this.stream;

        // Setup video event handlers
        this.setupVideoEventHandlers(video);

        // Force immediate play attempt
        setTimeout(() => {
          if (video.srcObject && video.paused) {
            console.log('Attempting immediate play...');
            video.play().catch((error) => {
              console.error('Immediate play failed:', error);
            });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);

      let errorMessage = 'No se pudo acceder a la cámara';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage =
            'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración del navegador.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'La cámara está siendo utilizada por otra aplicación.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'La cámara no cumple con los requisitos necesarios.';
        } else if (error.message.includes('HTTPS')) {
          errorMessage = 'La cámara requiere HTTPS o localhost para funcionar.';
        }
      }

      this.cameraError.emit(errorMessage);
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  async captureImage(): Promise<void> {
    if (this.isCapturing || !this.videoElement || !this.canvasElement) {
      return;
    }

    this.isCapturing = true;

    try {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      // Set canvas dimensions based on video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Validate image quality
      const isValid = await this.validateImageQuality(imageData);

      if (isValid) {
        this.imageCaptured.emit(imageData);
      } else {
        this.cameraError.emit(
          'La imagen no cumple con los requisitos de calidad'
        );
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      this.cameraError.emit('Error al capturar la imagen');
    } finally {
      this.isCapturing = false;
    }
  }

  /**
   * Gets camera constraints optimized for mobile devices
   * Following SOLID SRP - single responsibility for constraint configuration
   */
  private getCameraConstraints(): MediaStreamConstraints {
    const isSelfie = this.type === 'selfie';

    // Correct facing mode logic: selfie uses front camera, DNI uses rear camera
    const facingMode = isSelfie ? 'user' : 'environment';

    // Base constraints that work well on mobile
    const baseConstraints: MediaStreamConstraints = {
      video: {
        facingMode,
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    };

    // Add MIME type if supported
    const mimeType = this.getSupportedMimeType();
    if (mimeType) {
      (baseConstraints.video as any).mimeType = mimeType;
    }
    console.log('baseConstraints::', baseConstraints);

    // Add aspect ratio for better mobile compatibility
    if (isSelfie) {
      (baseConstraints.video as any).aspectRatio = 1;
    } else {
      (baseConstraints.video as any).aspectRatio = 16 / 9;
    }

    return baseConstraints;
  }

  private async validateImageQuality(imageData: string): Promise<boolean> {
    // Basic validation - in a real app, this would call the API
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Simple quality checks
        const isGoodSize = img.width >= 800 && img.height >= 600;
        const isGoodAspectRatio =
          this.type === 'selfie'
            ? Math.abs(img.width / img.height - 1) < 0.2 // Square-ish for selfie
            : Math.abs(img.width / img.height - 1.6) < 0.2; // DNI aspect ratio

        resolve(isGoodSize && isGoodAspectRatio);
      };
      img.src = imageData;
    });
  }

  get overlayClass(): string {
    return `camera__overlay--${this.type}`;
  }

  get instructionText(): string {
    switch (this.type) {
      case 'dni-front':
        return 'Por favor, mantén la posición';
      case 'dni-back':
        return 'Por favor, mantén la posición';
      case 'selfie':
        return 'Ubica tu rostro al centro y espera a que la cámara te enfoque';
      default:
        return '';
    }
  }

  /**
   * Public method to force camera initialization
   * Useful for manual retry scenarios
   */
  public async forceInitializeCamera(): Promise<void> {
    console.log('Force initializing camera...');
    await this.initializeCamera();
  }
}
