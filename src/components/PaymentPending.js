import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import PaymentService from '../services/payment.service'
import OrderDetailService from './../services/order-details.service'
import Button from "react-bootstrap/Button";
import {COUNT_ORDERDETAIL_PENDING} from "../actions/types";
import {useDispatch} from "react-redux";
import Swal from "sweetalert2";
import {useTranslation} from "react-i18next";

PaymentPending.propTypes = {};

function PaymentPending(props) {
    const [paymentPending, setPaymentPending] = useState([]);
    const [focusOrder, setFocusOrder] = useState(null);
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();

    const getAllPaymentPending = async () => {
        let res = await OrderDetailService.getAllByPaidFalse();
        if (res.status === 200) {
            setPaymentPending(res.data.data)
        }
    }

    const countPaymentPending = async () => {
        let res = await OrderDetailService.countAllByPaidFalse();
        if (res.status === 200) {
            dispatch({type: COUNT_ORDERDETAIL_PENDING, payload: res.data.data})
        }
    }


    const submitPaymentRequest = async (orderDetailId) => {

        Swal.fire({
            title: `${t("payment.sendNotify")}`,
            showCancelButton: true,
            cancelButtonText: t("payment.cancel"),
            confirmButtonText: t("payment.ok"),
            icon:"info"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let res = await OrderDetailService.paymentRequest(orderDetailId);
                    getAllPaymentPending();

                    if(res.status===200){
                        Swal.fire(t("payment.notifySuccess"), t("payment.notify"), "success");
                    }

                } catch (e) {
                    Swal.fire("Update payment success!", "Updated payment!", "success");
                }
            }
        });


    }

    useEffect(() => {
        getAllPaymentPending();
        countPaymentPending();
    }, [])


    return (
        <div className={"payment-pending-container"}>

            {paymentPending.length===0?
                <div>
                    EMPTY {t("payment.paymentPending")}
                </div>
            :
                <div style={{display:"table-row"}}>
                    <h4> {t("payment.paymentPending")} : {paymentPending.length}</h4>
                    <div className={`payment-item mb-1`}>
                        <div className={"mr-2 ml-2 payment-title "} style={{width: 20}}>#</div>
                        <div className={"mr-2 payment-title"} style={{width: 150}}>{t("payment.time")}</div>
                        <div className={"mr-2 payment-title"} style={{flex:1}}>{t("payment.productName")}</div>
                        <div className={"mr-2 text-right payment-title"} style={{width: 80}}>{t("payment.price")}
                        </div>
                        <div className={"mr-2 text-right payment-title "} style={{width: 40}}>{t("payment.quantity")}</div>
                        <div className={"mr-2 text-right payment-title"} style={{width:80}}>
                            {t("payment.total")}
                        </div>
                        <div className={"mr-1 cell"} style={{width:120}}>
                        </div>
                    </div>

                    {paymentPending.map((pm, id) => (
                        <div key={id} className={`payment-item mb-1 ${focusOrder === id ? "payment-item-active" : ""}`}>
                            <div className={"mr-2 ml-2 cell"} style={{width: 20}}>{id + 1}.</div>
                            <div className={"mr-2 cell"} style={{width: 150}}>{pm.created_at}</div>
                            <div className={"mr-2 cell"} style={{flex:1}}>{pm.product.name}</div>
                            <div className={"mr-2 text-right cell"} style={{width: 80}}>{Number(
                                pm.product?.discount_price?.value ||
                                pm.product?.price?.value
                            ).toLocaleString("en-US")}
                                <div className={"currency-value"}> VNĐ</div>
                            </div>
                            <div className={"mr-2 text-right cell"} style={{width: 40}}>{pm.quantity}</div>
                            <div className={"mr-2 text-right cell"} style={{width: 80}}>
                                <div className={"text-danger"} style={{fontWeight: 600}}>{
                                    Number(
                                        pm.quantity * (pm.product?.discount_price?.value ||
                                        pm.product?.price?.value)
                                    ).toLocaleString("en-US")
                                }</div>
                                <div className={"currency-value"}> VNĐ</div>

                            </div>
                            <div className={"mr-1 cell flex flex-column justify-content-md-around"} style={{ width: 120}}>
                                <Button style={{width: 120}}
                                        className={"btn btn-sm mb-1 btn-success align-content-center"} onClick={e => {
                                    props.submitOrder(pm);
                                    setFocusOrder(id)
                                }}>{t("payment.pay")}</Button>
                                <Button style={{ width: 120}}
                                    className={`btn btn-sm ${pm.bankingHistory.length > 0 && pm.bankingHistory[0].status !== "APPROVED" && pm.bankingHistory[0].status === "PENDING" ? 'btn-secondary' : ''}`}
                                    disabled={pm.bankingHistory.length > 0 && pm.bankingHistory[0].status !== "APPROVED" && pm.bankingHistory[0].status === "PENDING"}
                                    onClick={e => {
                                        submitPaymentRequest(pm.id);
                                        setFocusOrder(id)
                                    }}>{t("payment.notify")}</Button>
                            </div>

                        </div>
                    ))}

                </div>
            }

        </div>
    );
}

export default PaymentPending;