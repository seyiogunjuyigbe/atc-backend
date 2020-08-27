const PushNotifications = require('@pusher/push-notifications-server');
const Notification = require('../models/watchNotification')
const { PUSERINSTANCEID, PUSHERSECRETKEY } = process.env;
let beamsClient = new PushNotifications({
  instanceId: PUSERINSTANCEID,
  secretKey: PUSHERSECRETKEY
});
class NotificationService {
  async sendNotificationList (_id, message) {
   const productToPublish = await Notification.findOne({product: _id })
   if(!message || !productToPublish) return null;
    beamsClient.publishToInterests([productToPublish.clientId], {
      web: {
        notification: {
          title: 'Product Updates',
          body: message
        }
      }
    }).then((publishResponse) => {
      console.log('published:', publishResponse.publishId);
    }).catch((error) => {
      console.error('Error:', error);
    });
  }
}

module.exports = NotificationService
