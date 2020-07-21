import * as superagent from 'superagent';
import { buildUrlParams } from '../../shared/util/app';

class HttpService {
  public async post(url: string, data: any, headers: any = {}) {
    let response = superagent
      .post(url)
      .set('Content-Type', 'application/json');

    if (headers && Object.keys(headers).length) {
      Object.keys(headers).forEach((key) => {
        response = response.set(key, headers[key]);
      });
    }

    return await response.send(data)
      .then(res => res.body);
  }

  public async get(url: string, headers: any, params = {}) {
    let response = superagent
      .get(`${buildUrlParams(url, params)}`)
      .set('Content-Type', 'application/json');

    if (headers && Object.keys(headers).length) {
      Object.keys(headers).forEach((key) => {
        response = response.set(key, headers[key]);
      });
    }

    return await response.then(res => res.body);
  }
}

export default new HttpService;
