import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import { register, login } from "../actions/auth";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const Register = (props) => {
  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const { message } = useSelector(state => state.message);
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const required = (value) => {
    if (!value) {
      return (
        <div className="alert alert-danger" role="alert">
          {t("register.error_required")}
        </div>
      );
    }
  };

  const validEmail = (value) => {
    if (!isEmail(value)) {
      return (
        <div className="alert alert-danger" role="alert">
          {t("register.error_email_valid")}
        </div>
      );
    }
  };

  const vusername = (value) => {
    if (value.length < 3 || value.length > 20) {
      return (
        <div className="alert alert-danger" role="alert">
          {t("register.error_username_length")}
        </div>
      );
    }

    var regExUsername = /^[0-9a-zA-Z_]+$/;
    if (!value.match(regExUsername)) {
      return (
        <div className="alert alert-danger" role="alert">
          {t("register.error_username_special_characters")}
        </div>
      );
    }
  };

  const vpassword = (value) => {
    if (value.length < 6 || value.length > 40) {
      return (
        <div className="alert alert-danger" role="alert">
          {t("register.error_password_length")}
        </div>
      );
    }
  };

  const vfullname = (value) => {
    if (value.length < 3 || value.length > 40) {
      return (
        <div className="alert alert-danger" role="alert">
          {t("register.error_full_name_length")}
        </div>
      );
    }
  };

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const onChangeFullName = (e) => {
    const fullName = e.target.value;
    setFullName(fullName);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    setSuccessful(false);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      dispatch(register(username, email, fullName, password))
        .then(() => {
          setSuccessful(true);
          Swal.fire(
            t("register.done"),
            t("register.register_success"),
            "success"
          ).then(async (result) => {
            if (result.isConfirmed) {
              setRedirect(true);
            }
          });
        })
        .catch(() => {
          setSuccessful(false);
        });
    }
  };

  if (redirect) {
    dispatch(login(username, password))
      .then(() => {
        props.history.push("/orders");
        window.location.reload();
      })
  }

  return (
    <div className="col-md-12 pt-5">
      <div className="card card-container mt-0">
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile-img"
          className="profile-img-card"
        />

        <Form onSubmit={handleRegister} ref={form}>
          <div>
            <div className="form-group">
              <label htmlFor="username">{t("register.username")}</label>
              <Input
                type="text"
                className="form-control"
                name="username"
                value={username}
                onChange={onChangeUsername}
                validations={[required, vusername]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t("register.email")}</label>
              <Input
                type="text"
                className="form-control"
                name="email"
                value={email}
                onChange={onChangeEmail}
                validations={[required, validEmail]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">{t("register.full_name")}</label>
              <Input
                type="text"
                className="form-control"
                name="fullName"
                value={fullName}
                onChange={onChangeFullName}
                validations={[required, vfullname]}
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
                validations={[required, vpassword]}
              />
            </div>

            <div className="form-group">
              <button className="btn btn-primary btn-block ml-0">
                {t("register.sign_up")}
              </button>
            </div>
          </div>

          {message && (
            <div className="form-group">
              <div
                className={
                  successful ? "alert alert-success" : "alert alert-danger"
                }
                role="alert"
              >
                {message}
              </div>
            </div>
          )}
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
      </div>
    </div>
  );
};

export default Register;
