const PushNotifications = require('@pusher/push-notifications-server');
const Notification = require('../models/watchNotification');

const { PUSERINSTANCEID, PUSHERSECRETKEY } = process.env;
const beamsClient = new PushNotifications({
  instanceId: PUSERINSTANCEID,
  secretKey: PUSHERSECRETKEY,
});
const idType = {
  user: 'publishToUsers',
  client: 'publishToInterests',
};

class NotificationService {
  async sendNotificationList(_id, message, status, condition) {
    const productToPublish = await Notification.findOne({ product: _id });
    if (!message || !productToPublish) return null;
    if (status === 'soonExpired' && productToPublish.claim <= condition) {
      if (!productToPublish.type) return;
      beamsClient[idType[productToPublish.type]]([productToPublish.clientId], {
        web: {
          notification: {
            title: 'Product Updates',
            body: message,
          },
        },
      })
        .then(publishResponse => {
          console.log('published:', publishResponse.publishId);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }
}

// beamsClient.publishToInterests(["web-13d00b76-6063-437c-9b23-b1b3416795c1"], {
//   web: {
//     notification: {
//       title: 'Product Updates',
//       body: "message"
//     }
//   }
// }).then((publishResponse) => {
//   console.log('published:', publishResponse.publishId);
// }).catch((error) => {
//   console.error('Error:', error);
// });
module.exports = NotificationService;
