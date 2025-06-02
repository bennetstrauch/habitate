import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PushSubscription as WebPushSubscription } from 'web-push';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReflectionReminderService {
  private snackBar = inject(MatSnackBar);

  async handlePushSubscription(
    enablePush: boolean,
    existingSubscriptions: WebPushSubscription[] = []
  ): Promise<WebPushSubscription[]> {
    const registration = await navigator.serviceWorker.ready;
    const currentSubscription = await registration.pushManager.getSubscription();

    let updatedSubscriptions = [...existingSubscriptions];

    if (!enablePush) {
      if (currentSubscription) {
        await currentSubscription.unsubscribe().catch((error) => {
          console.error('Failed to unsubscribe:', error);
        });
        updatedSubscriptions = updatedSubscriptions.filter(
          (sub) => sub.endpoint !== currentSubscription.endpoint
        );
      }
      return updatedSubscriptions;
    }

    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      if (currentSubscription) {
        updatedSubscriptions = updatedSubscriptions.filter(
          (sub) => sub.endpoint !== currentSubscription.endpoint
        );
        await currentSubscription.unsubscribe().catch((error) => {
          console.error('Failed to unsubscribe existing:', error);
        });
      }

      const applicationServerKey = this.urlBase64ToUint8Array(environment.vapidPublicKey);
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Convert browser PushSubscription to web-push PushSubscription
      updatedSubscriptions.push(newSubscription.toJSON() as WebPushSubscription);
      return updatedSubscriptions;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      this.snackBar.open('Failed to enable push notifications', 'Close', { duration: 3000 });
      return updatedSubscriptions;
    }
  }

  async isCurrentDeviceSubscribed(existingSubscriptions: WebPushSubscription[] = []): Promise<boolean> {
    const registration = await navigator.serviceWorker.ready;
    const currentSubscription = await registration.pushManager.getSubscription();
    if (!currentSubscription) return false;
    return existingSubscriptions.some((sub) => sub.endpoint === currentSubscription.endpoint);
  }

  getReflectionReminderTime(form: FormGroup): string | undefined {
    const enablePush = form.get('enablePush')?.value || false;
    const enableEmail = form.get('enableEmail')?.value || false;

    if (enablePush || enableEmail) {
      const hour = parseInt(form.get('hour')?.value || '08');
      const minute = form.get('minute')?.value;
      const period = form.get('period')?.value;
      const adjustedHour = period === 'PM' && hour < 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour;
      return `${adjustedHour.toString().padStart(2, '0')}:${minute}`;
    }
    return undefined;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}