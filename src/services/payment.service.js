import axios from "axios";
import authHeader from "./auth-header";

require('dotenv').config()
const GET_ALL_URL = "https://api.vietqr.io/v2/banks";
const API_URL = process.env.REACT_APP_ENDPOINT + '/payment';

const getAll = async () => {
    return await axios.get(GET_ALL_URL);
};

const getAllPaymentInfo = async () => {
    return await axios.get(API_URL, {headers: authHeader()});
};
const getAllPaymentByOrderId = async (id) => {
    return await axios.get(API_URL + "/by-order-id", {headers: authHeader(), params: {orderId: id}});
};

const addBankingPaymentInfo = async (payment) => {
    return await axios.post(API_URL, payment, {headers: authHeader()})
}

const updatePayment = async (payment) => {
    return await axios.put(
        API_URL, payment, {headers: authHeader()})
}

const deletes = async (ids) => {
    return await axios({
        url: API_URL,
        method: 'delete',
        data: ids,
        headers: authHeader()
    })
}

const createQrcode = async (payment, total, info) => {

    let data;
    if (total && info) {
        data = {
            accountNo: payment.accountNo,
            accountName: payment.accountName,
            acqId: payment.bin,
            amount: total,
            addInfo: info,
            format: "compact2"
        }
    } else {
        data = {
            accountNo: payment.accountNo,
            accountName: payment.accountName,
            acqId: payment.bin,
            format: "compact2"
        }
    }
    return await axios.post(`https://api.vietqr.io/v2/generate`,
        data,
        {
            headers: {
                "x-client-id": "http://localhost:8080",
                "x-api-key": "we-l0v3-v1et-qr"
            }
        })
}

export default {
    getAll,
    getAllPaymentInfo,
    addBankingPaymentInfo,
    updatePayment,
    deletes,
    getAllPaymentByOrderId,
    createQrcode
};