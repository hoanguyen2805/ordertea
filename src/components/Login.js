import React, {useState, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Redirect} from 'react-router-dom';
import Swal from 'sweetalert2'
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import AuthService from './../services/auth.service';
import {login} from "../actions/auth";

import {useTranslation} from "react-i18next";

const Login = (props) => {
    const form = useRef();
    const checkBtn = useRef();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const {isLoggedIn} = useSelector(state => state.auth);
    const {message} = useSelector(state => state.message);

    const dispatch = useDispatch();

    const {t} = useTranslation();

    const required = (value) => {
        if (!value) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t("register.error_required")}
                </div>
            );
        }
    };

    const onChangeUsername = (e) => {
        const username = e.target.value;
        setUsername(username);
    };

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };

    const handleLogin = (e) => {
        e.preventDefault();

        setLoading(true);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            dispatch(login(username, password))
                .then(() => {
                    props.history.push("/orders");
                    window.location.reload();
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    };

    const forgotPassword = async () => {

        Swal.fire({
            title: t("register.forgot_password"),
            inputLabel: t("register.username"),
            input: 'text',
            inputValue: "",
            inputAttributes: {
                autocapitalize: 'off'
            },
            inputValidator: (value) => {
                if (!value) {
                    return t("register.error_username_length");
                }
                if (value.length < 3 || value.length > 20) {
                    return t("register.error_username_length");
                }
            },
            showCancelButton: true,
            confirmButtonText: 'OK',
            showLoaderOnConfirm: true,
            preConfirm: (pass) => {
                let el = document.getElementsByClassName("swal2-cancel")[0];
                el.style.display = 'none';
                return AuthService.forgotPassword(pass).then(response => {
                    return response.data
                }).catch(err => {

                    if (err.response.data.message === "User not found") {
                        Swal.showValidationMessage(
                            t("register.user_not_found")
                        )
                    } else {
                        Swal.showValidationMessage(
                            err.response.data.message
                        )
                    }
                }).finally(()=>{
                    el.style.display = 'inline-block';
                })
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: t("register.email_send") + " : " + result.value,
                    showConfirmButton: true,
                    timer: 10000
                })
            }
        })

    }


    if (isLoggedIn) {
        return <Redirect to="/orders"/>;
    }

    return (
        <div className="col-md-12 pt-5">
            <img src="https://ec9b-118-69-61-21.ap.ngrok.io/advertise"/>
            <div className="card card-container mt-0">
                <img
                    src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                    alt="profile-img"
                    className="profile-img-card"
                />

                <Form onSubmit={handleLogin} ref={form}>
                    <div className="form-group">
                        <label htmlFor="username">{t("register.username")}</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="username"
                            value={username}
                            onChange={onChangeUsername}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t("register.password")}</label>
                        <Input
                            type="password"
                            className="form-control"
                            name="password"
                            value={password}
                            onChange={onChangePassword}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <button className="btn btn-primary btn-block ml-0" disabled={loading}>
                            {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>{t("register.login")}</span>
                        </button>
                    </div>
                    <a href={"#"} onClick={forgotPassword}>{t("register.forgot_password")}</a>
                    {message && (
                        <div className="form-group">
                            <div className="alert alert-danger" role="alert">
                                {t("register.login_fail")}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{display: "none"}} ref={checkBtn}/>
                </Form>
            </div>
        </div>
    );
};

export default Login;
