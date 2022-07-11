import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import store from "./store";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import i18n from "./translation/i18n";
import {I18nextProvider} from "react-i18next";
import Swal from "sweetalert2";
import axios from 'axios'

axios.interceptors.response.use((response) => {
        return response;
    }, async function (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && originalRequest.url.indexOf('/api/v1/auth/signup') === -1
            && originalRequest.url.indexOf('/api/v1/auth/signin') === -1) {
            Swal.fire(
                'Session?',
                'Session expired,Please sign in again!',
                'question'
            ).then(async (result) => {
                localStorage.removeItem("user");
                window.location.href = "/login";
            });

        }
        return Promise.reject(error)
    }
)

ReactDOM.render(
    <Provider store={store}>
        <I18nextProvider i18n={i18n}>
            <App/>
        </I18nextProvider>
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can chađinge
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
