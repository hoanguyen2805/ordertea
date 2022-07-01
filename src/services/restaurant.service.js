import axios from "axios";
import authHeader from "./auth-header";
require('dotenv').config()
const API_URL = process.env.REACT_APP_ENDPOINT+'/orders/';

const getRestaurant = async (id) => {
  return await
      axios.get(API_URL + id, {
    headers: authHeader(),
  });
};

export default {
  getRestaurant,
};
