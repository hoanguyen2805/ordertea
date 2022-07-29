import authHeader from "./auth-header";
import axios from "axios";

require('dotenv').config()
const API_URL = process.env.REACT_APP_ENDPOINT + '/file/';

const uploadAvatar = async (formData) => {
    return await axios.post(API_URL + "avatar", formData, {headers: authHeader()})
}

const uploadBankingPaymentInfo = async (formData) => {
    return await axios.post(API_URL + "qrcode", formData, {headers: authHeader()})
}

const deleteFileByUrl = async (url) => {
    return await axios({
        url: API_URL,
        method: 'delete',
        params:{
          url:url
        },
        headers: authHeader()
    })
};


export default {
    uploadAvatar,
    uploadBankingPaymentInfo,
    deleteFileByUrl
}
