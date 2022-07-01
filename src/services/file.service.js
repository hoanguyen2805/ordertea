import authHeader from "./auth-header";
import axios from "axios";

require('dotenv').config()
const API_URL = process.env.REACT_APP_ENDPOINT + '/file/avatar';

const uploadAvatar = async (formData) => {
    return await axios.post(API_URL, formData, {headers: authHeader()})
}

export default {
    uploadAvatar
}
