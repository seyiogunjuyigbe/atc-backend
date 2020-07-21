const config = require('../../../config');
import mail from './mail';

export default class Notifier {
  public static async notify(type = 'email', recipient: string, subject: string, message: string) {
    if (config.get('env') !== 'production' && config.get('featureFlags.enableNotifier') !== '1') {
      return;
    }
    const notifier = new Notifier;

    switch (type) {
      case 'email':
        await notifier.sendEmail(recipient, subject, message);
        break;

      default:
        break;
    }
  }

  public async sendEmail(to: string, subject: string, message: string) {
    mail.send({
      subject: subject || 'NotificationDebug',
      to: to || config.get('debugEmail'),
      html: message,
      text: message,
    });
  }
}
