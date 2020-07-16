import * as superagent from 'superagent';
const config = require('../../../config');
import endpointsUtil from '../../shared/util/endpoints';
// import logger from '../services/logger';

const { firebaseApi } = endpointsUtil();

export default class FirebasePush {
  public static async sendNotification(recipient: string, data: any) {
    const apiKey = config.get('modules.firebase.apiKey');

    return await superagent
      .post(`${firebaseApi}/send`)
      .set('Content-Type', 'application/json;charset=utf-8')
      .set('Authorization', `key=${apiKey}`)
      .send(FirebasePush.buildData(data, recipient))
      .then(res => console.info(res.body));
  }

  private static buildData(data: any, recipient: string) {
    const { body, title, memoId } = data;
    // tslint:disable-next-line:max-line-length
    const logo = 'https://www.logolynx.com/images/logolynx/1c/1c0347b29a01b2d1766cfd02e71f244d.jpeg';

    return {
      // tslint:disable-next-line:max-line-length
      to: recipient,
      data: {
        memoId,
      },
      notification: {
        title,
        body,
        image: logo,
      },
    };
  }
}
