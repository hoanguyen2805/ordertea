import Pusher from "pusher-js";
import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_ENDPOINT + "/";

var CHANNEL_NAME = "TEABREAK_ORDER_NOTIFICATION=";

if (localStorage.getItem("user") !== null) {
  var user = JSON.parse(localStorage.getItem("user"));
  CHANNEL_NAME += user.id;

} else {
  CHANNEL_NAME += "-1";
}


let pusher = new Pusher("94e4ab3f1c94d7d3828f", {
  cluster: "ap1",
});

var channel = null;

export function subscribeChannel() {
  channel = pusher.subscribe(CHANNEL_NAME);
  return channel;
}

export function unsubscribeChannel() {
  pusher.unsubscribe(CHANNEL_NAME);
}

export async function getNotificationsByUser() {
  var url = API_URL + "notifications";
  return await axios.get(url, { headers: authHeader() });
};

export async function updateIsRead(notifications) {
  var url = API_URL + "notifications";
  return await axios.put(url, notifications, { headers: authHeader() });
}

export async function deleteNotificationUser(notification) {
  var url = API_URL + "notification_user";
  return await axios({
    url: url,
    method: "delete",
    data: notification,
    headers: authHeader(),
  });
}