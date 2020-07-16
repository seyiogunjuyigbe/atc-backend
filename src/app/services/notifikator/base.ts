import * as c from '../../../shared/constants/notification';
import { Notifikator } from './';

export class NotifikatorBase {
  public constructor() {
    this.register(c.DEVICE_CHANGED, this.changedDevice);
    this.register(c.PASSWORD_CHANGED, this.passwordChanged);
  }

  public changedDevice(topic: string, data: any): void { }

  public passwordChanged(topic: string, data: any): void { }

  public newTaskAssigned(topic: string, data: any): void { }

  public taskReminder(topic: string, data: any): void { }

  public eventReminder(topic: string, data: any): void { }

  private register(topic: string, cb: Function) {
    Notifikator.listen(topic, cb);
  }
}
