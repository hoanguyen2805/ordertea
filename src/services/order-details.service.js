import authHeader from "./auth-header";
import axios from "axios";

require('dotenv').config()
const API_URL = process.env.REACT_APP_ENDPOINT + '/order-detail/';


const countHistory = async () => {
    return await axios.get(API_URL + "count-history", {headers: authHeader()})
}

const getOrderDetails = async (pagination) => {
    return await axios.get(API_URL, {headers: authHeader(), params:pagination});
};

const addSingleOrderDetail = async (orderDetail) => {
    return await axios.post(API_URL, orderDetail,{headers: authHeader()});
};

const updateOrderDetail = async (orderDetail) => {
    return await axios.put(API_URL, orderDetail, {headers: authHeader()});
};

const updateAllOrderDetail = async (list) => {
    return await axios.put(API_URL + "list", list, {headers: authHeader()});
};

const deleteOrderDetails = async (ids) => {
    return await axios({
        url: API_URL,
        method: 'delete',
        data: ids,
        headers: authHeader()
    })
};
const addOrderDetail = (data) => {
    return axios
        .post(API_URL + "create-by-list", data, {
            headers: authHeader(),
        })
        .then((response) => {
            return response;
        });
};
const getCartByOrderId = async (orderId) => {
    return await axios.get(API_URL + `cart/${orderId}`, {headers: authHeader()})
};

export default {
    countHistory,
    getOrderDetails,
    deleteOrderDetails,
    updateOrderDetail,
    addOrderDetail,
    updateAllOrderDetail,
    getCartByOrderId,
    addSingleOrderDetail
}
