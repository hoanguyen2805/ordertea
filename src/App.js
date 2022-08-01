import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, NavLink, Route, Router, Switch} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Order from "./components/Order";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import BoardUser from "./components/BoardUser";
import BoardAdmin from "./components/BoardAdmin";
import BoardOrderer from "./components/BoardOrderer";
import {getUserInfo, logout} from "./actions/auth";
import {history} from "./helpers/history";
import AuthVerify from "./common/AuthVerify";
import EventBus from "./common/EventBus";
import Restaurant from "./components/Restaurant";
import {useTranslation} from "react-i18next";
import {Dropdown} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Swal from "sweetalert2";
import logo from './logo.png';
import Notification from "./components/Notification";
import PusherBrowser from "./services/pusher-notify-browser";
import PaymentManager from "./components/PaymentManager";
import OrderDetailService from "./services/order-details.service";
import {COUNT_ORDERDETAIL_PENDING} from "./actions/types";


const App = () => {
    const [showAdminBoard, setShowAdminBoard] = useState(false);
    const [showOrdererBoard, setShowOrdererBoard] = useState(false);
    const [subscribeBrowserNotify, setSubscribeBrowserNotify] = useState(null);
    const {user: currentUser} = useSelector((state) => state.auth);
    const paymentPending = useSelector((state) => state.paymentPending.count);

    const dispatch = useDispatch();
    const [isShow, setShow] = useState(true);
    const {t, i18n} = useTranslation();

    const countPaymentPending = async () => {
        let res = await OrderDetailService.countAllByPaidFalse();
        if (res.status === 200) {
            dispatch({type: COUNT_ORDERDETAIL_PENDING, payload: res.data.data})
        }
    }


    useEffect(() => {
        if (localStorage.getItem("language") === null) {
            i18n.changeLanguage("vi");
            localStorage.setItem("language", "vi");
        } else {
            i18n.changeLanguage(localStorage.getItem("language"));
        }
        if (localStorage.getItem("user")) {
            dispatch(getUserInfo());
            countPaymentPending();
        }

        navigator.serviceWorker.register('service-worker.js');

    }, []);

    const countryOptions = [
        {key: "vi", value: "vi", flag: "vn", text: ""},
        {key: "en", value: "en", flag: "uk", text: ""},
        {key: "jp", value: "jp", flag: "jp", text: ""},
    ];

    const handleClick = (e, {value}) => {
        if (value == "en") {
            i18n.changeLanguage("en");
            localStorage.setItem("language", "en");
        } else if (value == "vi") {
            i18n.changeLanguage("vi");
            localStorage.setItem("language", "vi");
        } else {
            i18n.changeLanguage("jp");
            localStorage.setItem("language", "jp");
        }
    };

    const responsive = () => {
        setShow(!isShow);
    };

    const logOut = useCallback(() => {
        PusherBrowser.unsubscribe(currentUser.username);
        dispatch(logout());
    }, [dispatch]);

    useEffect(() => {
        if (currentUser) {
            setShowAdminBoard(currentUser.roles.includes("ROLE_ADMIN"));
            setShowOrdererBoard(currentUser.roles.includes("ROLE_ORDERER"));
            setSubscribeBrowserNotify(true)
        } else {
            setShowAdminBoard(false);
            setShowOrdererBoard(false);
        }

        EventBus.on("logout", () => {
            logOut();
        });

        return () => {
            EventBus.remove("logout");
        };

    }, [currentUser, logOut]);

    useEffect(() => {
        if (!subscribeBrowserNotify && currentUser) {
            PusherBrowser.subscribe(currentUser.username);
        }
    }, [subscribeBrowserNotify])


    const clearLogin = () => {
        Swal.fire(
            'Session?',
            'Session expired,Please sign in again!',
            'question'
        ).then(async (result) => {
            localStorage.removeItem("user");
            window.location.href = "/login";
        });
    }

    return (
        <div
            data-bs-spy="scroll"
            data-bs-target="#menu-items"
            data-bs-offset="0"
            data-bs-smooth-scroll="true"
            tabIndex="0"
        >
            <Router history={history}>
                <AuthVerify logOut={clearLogin}/>
                <nav
                    className="navbar navbar-expand navbar-dark bg-dark"
                    id={"div-scrolltop"}
                >
                    <Link to={"/"} className="navbar-brand">
                        <img src={logo} alt="nitrotech asia" width="160px"/>
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={responsive}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div
                        className={
                            isShow ? `collapse navbar-collapse pr-2` : "d-flex flex-column"
                        }
                    >
                        <div className="navbar-nav mr-auto">
                            <li className="nav-item py-0 px-0 ">
                                <NavLink
                                    to={"/orders"}
                                    className="nav-link"
                                    activeClassName="active-link"
                                >
                    <span className="text-light">
                      <i className="fa-solid fa-cart-shopping"></i>&nbsp;
                        {t("menu.order")}
                    </span>
                                </NavLink>
                            </li>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {showOrdererBoard && (
                                <li className="nav-item  py-0 px-0">
                                    <NavLink
                                        to={"/restaurant-management"}
                                        className="nav-link"
                                        activeClassName="active-link"
                                    >
                      <span className="text-light">

                        <i className="fa fa-cog"></i>&nbsp;
                          {t("menu.orderer_board")}
                      </span>
                                    </NavLink>
                                </li>
                            )}
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {showAdminBoard && (
                                <li className="nav-item  py-0 px-0">
                                    <NavLink
                                        to={"/user-management"}
                                        className="nav-link"
                                        activeClassName="active-link"
                                    >
                      <span className="text-light">

                        <i className="fa fa-cog"></i>&nbsp;
                          {t("menu.admin_board")}
                      </span>
                                    </NavLink>
                                </li>
                            )}
                            <li className="nav-item py-0 px-0">
                                <NavLink
                                    to={"/payment"}
                                    className="nav-link"
                                    activeClassName="active-link"
                                >
                      <span className="text-light">

                       <i className="fa-solid fa-dollar-sign"></i>&nbsp;
                          {t("menu.payment")}
                          {paymentPending!==0 && <p className={"payment-badge"}>{paymentPending}</p>}
                      </span>
                                </NavLink>

                            </li>
                        </div>

                        {currentUser ? (
                            <div className="navbar-nav ml-auto">
                                <li className="nav-item py-0 px-0">
                                    <Notification></Notification>
                                </li>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <li className="nav-item py-0 px-0">
                                    <NavLink
                                        to={"/profile"}
                                        className="nav-link"
                                        activeClassName="active-link"
                                    >
                      <span className="text-light">
                        <i className="fa-solid fa-user"></i>&nbsp;
                          {currentUser.username}
                      </span>
                                    </NavLink>
                                </li>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <li className="nav-item py-0 px-0">
                                    <NavLink
                                        to={"/login"}
                                        className="nav-link"
                                        activeClassName="active-link"
                                        onClick={logOut}
                                    >
                      <span className="text-light">
                        <i className="fa-solid fa-right-from-bracket"></i>&nbsp;
                          {t("menu.log_out")}
                      </span>
                                    </NavLink>
                                </li>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                        ) : (
                            <div className="navbar-nav ml-auto">
                                <li className="nav-item py-0 px-0">
                                    <NavLink
                                        to={"/login"}
                                        className="nav-link"
                                        activeClassName="active-link"
                                    >
                      <span className="text-light">
                        <i className="fa-solid fa-right-to-bracket"></i>&nbsp;
                          {t("menu.log_in")}
                      </span>
                                    </NavLink>
                                </li>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <li className="nav-item py-0 px-0">
                                    <NavLink
                                        to={"/register"}
                                        className="nav-link"
                                        activeClassName="active-link"
                                    >
                      <span className="text-light">
                        <i className="fa-solid fa-user-plus"></i>&nbsp;
                          {t("menu.sign_up")}
                      </span>
                                    </NavLink>
                                </li>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                        )}
                        <Dropdown
                            placeholder="Select Language"
                            fluid
                            selection
                            defaultValue={
                                localStorage.getItem("language")
                                    ? localStorage.getItem("language")
                                    : "vi"
                            }
                            options={countryOptions}
                            style={{width: "60px"}}
                            onChange={handleClick}
                        />
                    </div>
                </nav>

                <section
                    style={{
                        backgroundColor: "#e9ecef",
                        minHeight: "calc(100vh - 115px)",
                    }}
                >
                    <Switch>
                        <Route exact path="/orders" component={Order}/>
                        <Route exact path="/orders/:id" component={Restaurant}/>
                        <Route exact path="/cart" component={Cart}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/register" component={Register}/>
                        <Route exact path="/profile" component={Profile}/>
                        <Route path="/user" component={BoardUser}/>
                        <Route path="/payment" component={PaymentManager}/>
                        <Route path="/user-management" component={BoardAdmin}/>
                        <Route path="/restaurant-management" component={BoardOrderer}/>
                        <Route path="/" component={Login}/>
                    </Switch>
                </section>
            </Router>
            <footer style={{backgroundColor: "#e9ecef"}}>
                <p className="text-center pb-3 pt-3 font-weight-bold">
                    Copyright © 2022 Nitro Tech Asia Inc
                </p>
            </footer>
        </div>
    );
};

export default App;
