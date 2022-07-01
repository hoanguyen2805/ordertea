import React, {useEffect, useState} from "react";
import {useRouteMatch, Link} from "react-router-dom";
import OrderService from "../services/order.service";
import Loading from "./loading";
import './order.css'
import {useTranslation} from "react-i18next";

const Order = () => {
    const [loading, setLoading] = useState(1);
    const {url} = useRouteMatch();
    const [orders, setOrders] = useState(null);
    const [active, setActive] = useState({id: 0,status: true});
    const {t} = useTranslation();
    const LOADINGS = [
        null,
        t("order.loading_data"),
    ]
    useEffect(() => {
        OrderService.getOrderActivated().then(
            (response) => {
                setOrders(response.data.data);
                setLoading(0)
            },
            (error) => {
                console.log(error);
                setLoading(0)
            }
        );
    }, []);

    const shareLink = (id) => {
        setActive(
            {id: id,
            status: true})
        setTimeout(function () {
                setActive({id: 0,
                    status: false})
        }, 2500);
        if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard api method'
            return navigator.clipboard.writeText(window.location.href + "/" + id);
        } else {
            // text area method
            let textArea = document.createElement("textarea");
            textArea.value = window.location.href + "/" + id;
            // make the textarea out of viewport
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((res, rej) => {
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        }

        
        
    }


    return (
        loading !== 0 ? <Loading type={2} backdrop info={LOADINGS[loading]}/> :
            orders && orders.length > 0 ? <div className="container pt-3">
                    <div className="row">
                        <div className="col-10 offset-1 col-md-8 offset-md-2">
                            <ul className="list-group">
                                {orders.map((order, index) => (
                                    <li key={index} className="list-group-item mb-2">
                                        <div
                                        className={`copy-text ${active.status === true && active.id === order.id  ? "active" : ''}`}
                                        data-mdb-toggle="tooltip"
                                        title={t("board_admin.copy")}
                                        >
                                        <span
                                            className="badge p-2 badge-action"
                                            onClick={(e) => shareLink(order.id)}
                                        >
                                            <button><i className="fa fa-clone"></i></button>
                                        </span>
                                        </div>
                                        <Link to={`${url}/${order.id}`} className="text-decoration-none d-flex align-items-center">
                                            <img src={order.store.img} alt="" width="40%"/>
                                            <div>
                                            <p className="ml-3 font-weight-bold text-danger" style={{ fontSize: "16px" }}>{order.store.name}</p>
                                            <hr className="ml-3" />
                                            <p className="ml-3 text-primary" style={{ fontSize: "14px" }}>{order.store.address}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div> :
                <div className={"none-order-container"}>
                    <img src={"no-order.png"}/>
                    <span>{t("order.empty_order")}</span>
                </div>
    );
};

export default Order;
