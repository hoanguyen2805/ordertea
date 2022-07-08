import * as PusherPushNotifications from "@pusher/push-notifications-web";

const beamsClient = new PusherPushNotifications.Client({
    instanceId: '56a993ba-67f3-4e01-90dd-8d712272dc55',
});

const subscribe = (username) => {
    beamsClient.start()
        .then(() => beamsClient.addDeviceInterest(username))
        .then(() => console.log('Successfully registered and subscribed!'))
        .catch(console.error);
}

const unsubscribe = (username) => {
    beamsClient.removeDeviceInterest(username).then(() => {
        console.log('Successfully unsubscribe!');
    })
}

export default {subscribe, unsubscribe}