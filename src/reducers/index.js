import { combineReducers } from "redux";
import auth from "./auth";
import message from "./message";
import cart from "./cart";
import orderDetail from "./order-details"
export default combineReducers({
  auth,
  message,
  cart,
  orderDetail
});
