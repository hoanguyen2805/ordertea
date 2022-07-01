import axios from "axios";
import authHeader from "./auth-header";
import {format} from "date-fns";

require('dotenv').config()
const API_URL = process.env.REACT_APP_ENDPOINT + '/';

const getAllOrderData = async (pagination) => {
    let params = {page: pagination.page, pageSize: pagination.pageSize, searchData: pagination.searchData, sortData: "status asc,id desc"};
    return axios.get(API_URL + "orders/", {headers: authHeader(),params:params}).then((response) => {
        return response.data;
    });
};

const getOrderById = (id) => {
  return axios.get(API_URL + "orders/" + id, {headers: authHeader()}).then((response) => {
      return response.data;
    });
};

const getBillDetail = (id) => {
  return axios.get(API_URL + "orders/totalBill/?id=" + id, {headers: authHeader()}).then((response) => {
      return response.data;
    });
};

const getStore = (url) => {
  return axios.post(API_URL + "category/by-url?url=" + url,null, {headers: authHeader()}).then((response) => {
      return response.data;
    });
};

const createOrder = (status, store, timeRemain) => {
  var datetimeString = format(timeRemain , 'dd/MM/yyyy HH:mm:ss');
  return axios.post(API_URL + "orders" ,{
    store:store, status: status, time_remaining: datetimeString
  }, {headers: authHeader()}).then((response) => {
      return response.data;
    });
};

const updOrder = (id, status, timeRemain, order) => {
  var datetimeString = format(timeRemain , 'dd/MM/yyyy HH:mm:ss');
  return axios.put(API_URL + "orders" ,{
    id, status, time_remaining: datetimeString, store:order.store , orderDetailList:order.orderDetailList}, {headers: authHeader()}).then((response) => {
      return response.data;
  });
};

const getOrderActivated = () => {
  let params = {searchData: "status=ACTIVATED,time_remaining=" + format(new Date(), 'dd/MM/yyyy HH:mm:ss')};
    return axios.get(API_URL + "orders", {params, headers: authHeader()});
};

const deleteOrder = async (ids) => {
    return await axios({
        url: API_URL + "orders",
        method: 'delete',
        data: ids,
        headers: authHeader()
    })
};

export default {
    getAllOrderData,
    getBillDetail,
    getOrderById,
    getStore,
    createOrder,
    updOrder,
    getOrderActivated,
    deleteOrder
};