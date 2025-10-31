import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
  private notifications = new Subject<any>();

  sendNotification(notification: any) {
    this.notifications.next(notification);
  }

  getNotifications() {
    return this.notifications.asObservable();
  }
}
