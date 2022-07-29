import { combineReducers } from "redux";
import auth from "./auth";
import message from "./message";
import cart from "./cart";
import orderDetail from "./order-details"
import paymentPending from "./paymentPending"
export default combineReducers({
  auth,
  message,
  cart,
  orderDetail,
  paymentPending
});
