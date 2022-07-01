import Pusher from "pusher-js";

const CHANNEL_NAME = 'TEABREAK_ORDER';
// Pusher.logToConsole = true;
let pusher = new Pusher('94e4ab3f1c94d7d3828f', {
    cluster: 'ap1'
});

var channel = null;

export function subscribeChannel() {
    channel = pusher.subscribe(CHANNEL_NAME);
    return channel;
}


export function unsubscribeChannel() {
    pusher.unsubscribe(CHANNEL_NAME);
}
