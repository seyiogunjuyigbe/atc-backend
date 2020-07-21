const config = require('../../../config');
import { isArray } from 'util';
import http from './http';

export default class OneSignal {
  private static async send(body: any) {
    const apiKey = config.get('modules.onesignal.apiKey');
    const appId = config.get('modules.onesignal.appId');

    return await http.post(
      'https://onesignal.com/api/v1/notifications',
      { ...body, app_id: appId },
      {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${apiKey}`,
      },
    );
  }

  /**
   *
   * @param segmentName SEGMENT NAME
   * @param data object containing message info
   */
  public static async sendToTaggedSegment(segmentName: string, data: any) {
    await this.send({
      data,
      contents: { en: data.message },
      filters: [
        { field: 'tag', key: segmentName, relation: '=', value: '1' },
      ],
    });
  }

  /**
   *
   * @param tag User's UUID (user devices are tagged by the user's UUID)
   * @param data object containing message info
   */
  public static async sendToTaggedDevices(tag: string, data: any) {
    await this.send({
      data,
      contents: { en: `${data.message} Click to view details.` },
      filters: [
        { field: 'tag', key: 'deviceGroupKey', relation: '=', value: tag },
      ],
    });
  }

  /**
   *
   * @param ids String or array of device id(s)
   * @param data object containing message info
   */
  public static async sendNotification(ids: any, data: any) {
    await this.send({
      data,
      contents: { en: `${data.message} Click to view details.` },
      include_player_ids: isArray(ids) ? ids : [ids],
    });
  }

  /**
   *
   * @param segments String or array of segment name(s)
   * @param data object containing message info
   */
  public static async sendToSegments(segments: any, data: any) {
    await this.send({
      data,
      contents: { en: `${data.message} Click to view details.` },
      included_segments: isArray(segments) ? segments : [segments],
    });
  }
}
