const config = require('../../../config');
import IMailOptionsInterface from '../../shared/interface/mail';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get('sendgrid.apiKey'));

class MailService {
  private client: any;
  private senderName = 'Africa Travel Club';
  private senderEmail = config.get('sendgrid.sender');

  constructor() {
    this.client = sgMail;
  }

  public send(options: IMailOptionsInterface): any {
    return new Promise(async (resolve: any, reject: any) => {
      const formattedOptions = this.formatEmailOptions(options);

      try {
        const result = await this.client.send(formattedOptions);
        return resolve(result);
      } catch (error) {
        console.error(error);
        return reject(error);
      }
    });
  }

  private formatEmailOptions(options: any) {
    options.from = options.from || `${this.senderName} <${this.senderEmail}>`;

    return options;
  }
}

export default new MailService();
