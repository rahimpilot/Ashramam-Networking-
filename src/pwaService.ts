// PWA Service Worker Registration and Install Prompt
export class PWAService {
  private deferredPrompt: any = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Register service worker
    this.registerServiceWorker();
    
    // Listen for install prompt
    this.setupInstallPrompt();
    
    // Check if already installed
    this.checkIfInstalled();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('PWA: Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                this.showUpdateAvailable();
              }
            });
          }
        });

      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt() {
    // Enhanced beforeinstallprompt listener
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available!', e);
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccess();
    });

    // Additional debugging - check PWA criteria
    this.debugPWACriteria();
    
    // Fallback - show install option after delay if criteria met but no prompt
    setTimeout(() => {
      if (!this.deferredPrompt && !this.isInstalled) {
        console.log('PWA: No install prompt after 3 seconds, checking criteria...');
        this.checkPWACriteriaAndShowFallback();
      }
    }, 3000);
  }

  private debugPWACriteria() {
    console.log('PWA Debug Info:');
    console.log('- Service Worker supported:', 'serviceWorker' in navigator);
    console.log('- HTTPS:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    console.log('- Manifest linked:', document.querySelector('link[rel="manifest"]') !== null);
    console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    console.log('- User agent:', navigator.userAgent);
  }

  private checkPWACriteriaAndShowFallback() {
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
    
    console.log('PWA Criteria Check:', { hasServiceWorker, hasHttps, hasManifest });
    
    if (hasServiceWorker && hasHttps && hasManifest && !this.isInstalled) {
      console.log('PWA: All criteria met, showing fallback install option');
      this.showInstallButton();
    }
  }

  private checkIfInstalled() {
    // Check if running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      this.isInstalled = true;
      console.log('PWA: App is running in installed mode');
    }
  }

  public async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
      } else {
        console.log('PWA: User dismissed install prompt');
      }
      
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Error during install:', error);
      return false;
    }
  }

  private showInstallButton() {
    // Dispatch custom event to show install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallButton() {
    // Dispatch custom event to hide install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  private showInstallSuccess() {
    // Dispatch custom event to show success message
    window.dispatchEvent(new CustomEvent('pwa-install-success', {
      detail: { message: 'Ashramam app installed successfully!' }
    }));
  }

  private showUpdateAvailable() {
    // Dispatch custom event to show update available message
    window.dispatchEvent(new CustomEvent('pwa-update-available', {
      detail: { message: 'New version available! Refresh to update.' }
    }));
  }

  public async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('PWA: Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  }

  public async subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            // You'll need to replace this with your VAPID public key
            'your-vapid-public-key-here'
          )
        });
        
        console.log('PWA: Push subscription:', subscription);
        return subscription;
      } catch (error) {
        console.error('PWA: Push subscription failed:', error);
        return null;
      }
    }
    return null;
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public getInstallStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt
    };
  }
}

// Export singleton instance
export const pwaService = new PWAService();