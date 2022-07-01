import axios from "axios";
import authHeader from "./auth-header";
import { format } from "date-fns";

require('dotenv').config()
const API_URL = process.env.REACT_APP_ENDPOINT + '/';
const getPublicContent = () => {
    return axios.get(API_URL + "all");
};

const updateUser = async (user) => {
    return await axios.put(API_URL + "users", user, {headers: authHeader()})
}

const getUserBoard = () => {
    return axios.get(API_URL + "test/user", {headers: authHeader()});
};

const getAdminBoard = async (page, size, keyword) => {
    var url = API_URL + `users?page=${page}&size=${size}`;
    if (keyword !== null && keyword.trim()) {
        url = url + `&username=${keyword}`;
    }
    return await axios.get(url, {headers: authHeader()});
};

const getOrdererBoard = () => {
    return axios.get(API_URL + "test/orderer", {headers: authHeader()});
};

const changePassword = async (password) => {
    return await axios.patch(API_URL + "users/change-password", {password}, { headers: authHeader() })
}


const getUserInfo = async () => {
    return await axios.get(API_URL + "users/info", {headers: authHeader()})
}

const updateUserByAdmin = (id, username, email, checked, isAdmin, fullName, password, startDate) => {
    var time_remaining = null;
    var role = [];
    if (isAdmin == "ADMIN") {
        role = ["user", "orderer", "admin"]
    } else {
        if (checked) {
            role = ["user", "orderer"];
            time_remaining = format(startDate, "dd/MM/yyyy HH:mm:ss");
        } else {
            role = ["user"];
        }
    }

    return axios.patch(
        API_URL + "users/update_user_by_admin",
        {
            id,
            username,
            email,
            role,
            fullName,
            password,
            time_remaining
        },
        {headers: authHeader()}
    );
};

const deleteUsers = async (ids) => {
    return await axios({
        url: API_URL + "users",
        method: 'delete',
        data: ids,
        headers: authHeader()
    })
}


export default {
    getPublicContent,
    getUserBoard,
    getAdminBoard,
    getOrdererBoard,
    changePassword,
    updateUser,
    getUserInfo,
    updateUserByAdmin,
    deleteUsers
};