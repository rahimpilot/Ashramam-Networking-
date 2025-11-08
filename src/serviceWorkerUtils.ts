// Service Worker Registration and Installation Prompt
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
};

// BeforeInstallPromptEvent handler for install button
let deferredPrompt: any;

export const setupInstallPrompt = (callback?: (canInstall: boolean) => void) => {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event for later use
    deferredPrompt = e;
    // Update UI to show install button
    if (callback) {
      callback(true);
    }
    console.log('Install prompt available');
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    if (callback) {
      callback(false);
    }
  });
};

export const installApp = async () => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);
  
  // Clear the deferredPrompt for re-use
  deferredPrompt = null;
};

// Check if the app is already installed
export const isAppInstalled = async () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  if ('getInstalledRelatedApps' in navigator) {
    const relatedApps = await (navigator as any).getInstalledRelatedApps();
    return relatedApps.length > 0;
  }
  
  return false;
};
