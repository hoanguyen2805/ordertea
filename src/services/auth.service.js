import axios from "axios";

require('dotenv').config();
const API_URL = process.env.REACT_APP_ENDPOINT + '/auth/';

const register = (username, email, fullName, password) => {
    return axios.post(API_URL + "signup", {
        username,
        email,
        fullName,
        password,
    });
};

const login = (username, password) => {
    return axios
        .post(API_URL + "signin", {
            username,
            password,
        })
        .then((response) => {
            if (response.data.accessToken) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }

            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const forgotPassword = async (username) => {
    return await axios.get(API_URL + "forgot-password", {
        params: {username:username}
    });
}

export default {
    register,
    login,
    logout,
    forgotPassword
};
