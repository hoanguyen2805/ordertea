import React, {useEffect, useState} from 'react';
import './payment.css'
import Payment from "./Payment";
import PaymentPending from "./PaymentPending";
import PaymentService from "../services/payment.service";
import Loading from "./loading";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";


PaymentManager.propTypes = {};

function PaymentManager(props) {
    const [orderDetail, setOrderDetail] = useState(null);
    const [orderPayments, setOrderPayment] = useState(null);
    const [loading, setLoading] = useState(0);
    const [activeOrderDetail, setActiveOrderDetail] = useState(null);
    const {t} = useTranslation();
    const [loadingQR, setLoadingQR] = useState(false);
    const [qrCode, setQrcode] = useState(null);
    const LOADINGS = [
        null,
        t("profile.loading_data"),
    ];
    const paymentPending = useSelector((state) => state.paymentPending.count);
    const getAllPaymentsByOrderId = async (id) => {
        setLoading(1)
        try {
            let res = await PaymentService.getAllPaymentByOrderId(id);
            if (res.status === 200) {
                setOrderPayment(res.data.data)
                createQrcode(res.data.data[0]);
                setActiveOrderDetail(res.data.data[0].id)
            }
        } catch (e) {
        }
        setLoading(0)
    }

    const createQrcode = async (pm) => {
        if (orderDetail) {
            setLoading(1);
            let total = orderDetail.quantity * (orderDetail.product?.discount_price?.value || orderDetail.product?.price?.value);
            try {
                let res = await PaymentService.createQrcode({
                    bin: pm.bin,
                    accountNo: pm.accountNo,
                    accountName: pm.accountName
                }, total, `${orderDetail.created_by} pay`)
                if (res.status === 200) {
                    setQrcode(res.data.data.qrDataURL)
                }
            } catch (e) {

            }
            setLoading(0)
        }

    }
    const submitOrder = (value) => {
        setOrderDetail(value);
    }


    useEffect(() => {
        if (orderDetail) {
            getAllPaymentsByOrderId(orderDetail.orderDTO.id);
        }
    }, [orderDetail])

    useEffect(() => {
        if (orderDetail) {
            getAllPaymentsByOrderId(orderDetail.orderDTO.id);
        }
    }, [setActiveOrderDetail])

    return (
        <div className={"container-fluid pt-4"}>

            <div className={"row"}>
                {loading !== 0 && <Loading info={LOADINGS[loading]}/>}
                {paymentPending === 0 && <div className={"col-md-12"}>
                    <div className={"text-center"} style={{textAlign: "center", marginTop: '20%'}}>
                        <h6>{t("payment.noOrder")}</h6></div>

                </div>}

                <div className={"col-md-7 offset-1"}>
                    <PaymentPending submitOrder={submitOrder}/>
                </div>
                {orderDetail && orderPayments &&
                <div className={"col-md-3"}>
                    <h5> {t("payment.bankingPayment")}: {orderPayments?.length > 0 ? orderPayments?.length : t("payment.noPayment")}</h5>
                    <div>
                        {orderPayments &&
                        <div className={"banking-manager-container"}>
                            {orderPayments?.map((pm, id) => (
                                <div className={`banking-item  ${pm?.id === activeOrderDetail ? "payment-active" : ""}`}
                                     key={id}
                                     onClick={e => {
                                         setActiveOrderDetail(pm.id);
                                         createQrcode(pm)
                                     }}>
                                    <img src={pm.logo} height={40}/>
                                </div>
                            ))}
                        </div>}
                    </div>
                    <div className={"mt-3"}>
                        {loadingQR ? <div>LOADING</div> : <img width={"100%"} style={{margin: "0%"}}
                                                               src={qrCode}/>}
                    </div>
                </div>}

            </div>
        </div>
    );
}


export default PaymentManager;