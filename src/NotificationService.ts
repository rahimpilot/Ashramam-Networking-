// Push Notification Service for Ashramam App

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

export class NotificationService {
  private static instance: NotificationService;
  private isSupported: boolean;
  
  private constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications are not supported');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  // Show local notification
  public showNotification(title: string, options?: ExtendedNotificationOptions): void {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }
    
    const defaultOptions: ExtendedNotificationOptions = {
      icon: '/newlogo.svg',
      badge: '/newlogo.svg',
      vibrate: [200, 100, 200],
      tag: 'ashramam-notification',
      requireInteraction: true,
      ...options
    };
    
    // Remove vibrate for Notification API (it's for Service Worker)
    const { vibrate, ...notificationOptions } = defaultOptions;
    
    new Notification(title, notificationOptions);
  }
  
  // Show welcome notification for new users
  public showWelcomeNotification(): void {
    this.showNotification('Welcome to Ashramam! 🏠', {
      body: 'Explore our community, connect with residents, and discover amazing stories.',
      icon: '/newlogo.svg'
    });
  }
  
  // Show story notification
  public showStoryNotification(storyTitle: string): void {
    this.showNotification('New Story Available! 📚', {
      body: `Check out: ${storyTitle}`,
      icon: '/newlogo.svg'
    });
  }
  
  // Show resident update notification
  public showResidentNotification(message: string): void {
    this.showNotification('Community Update 👥', {
      body: message,
      icon: '/newlogo.svg'
    });
  }
  
  // Schedule periodic notifications (for engagement)
  public scheduleEngagementNotifications(): void {
    if (!this.isSupported) return;
    
    // Show notification after 1 hour of inactivity
    setTimeout(() => {
      this.showNotification('Come back to Ashramam! 🌟', {
        body: 'See what\'s new in your community',
        icon: '/newlogo.svg'
      });
    }, 60 * 60 * 1000); // 1 hour
  }
  
  // Check if notifications are supported
  public isNotificationSupported(): boolean {
    return this.isSupported;
  }
  
  // Get current permission status
  public getPermissionStatus(): NotificationPermission {
    return this.isSupported ? Notification.permission : 'denied';
  }
}

export default NotificationService.getInstance();