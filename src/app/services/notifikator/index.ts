import * as PubSub from 'pubsub-js';
import Mail from './mail';
import Update from './update';
// import Push from './push';
// import SMS from './sms';

export class Notifikator {
  public static loadServices() {
    Mail.init();
    Update.init();
    // Push.init();
    // SMS.init();
  }
  public static broadcast(topic: string, data: any) {
    return PubSub.publish(topic, data);
  }

  public static listen(topic: string, cb: Function) {
    return PubSub.subscribe(topic, cb);
  }

  public static unlisten(token: string) {
    return PubSub.unsubscribe(token);
  }
}
