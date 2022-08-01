import React, {useEffect, useRef, useState} from 'react';
import PaymentService from '../services/payment.service'
import Select from "react-dropdown-select";
import './payment.css'
import {Button} from "react-bootstrap";
import FileStoreService from './../services/file.service'
import Loading from "./loading";
import {useTranslation} from "react-i18next";
import Formsy from "formsy-react";
import FormInput from "./formsy/FormInput";
import Swal from "sweetalert2";
import OrderDetailService from "../services/order-details.service";

Payment.propTypes = {};

function Payment(props) {
    const [paymentList, setPaymentList] = useState([]);
    const [selectedPaymentDropdown, setSelectedPaymentDropdown] = useState([]);
    const [myPayment, setMyPayments] = useState([]);
    const [payment, setPayment] = useState(null);
    const [qrCode, setQrcode] = useState(null);
    const [mode, setMode] = useState(null);
    const [canSubmit, setCanSubmit] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);
    const formRef = useRef();
    const {t} = useTranslation();
    const LOADINGS = [
        null,
        t("profile.loading_data"),
    ];
    const [loading, setLoading] = useState(1);

    const getAllPaymentSupport = async () => {
        let res = await PaymentService.getAll();
        if (res.status === 200) {
            setLoading(0)
            setPaymentList(res.data.data);

        }
    }

    const createQrcode = async () => {

        setLoading(1)
        try {
            if (selectedPaymentDropdown.length > 0 && formRef?.current?.getModel().accountName != null && formRef?.current?.getModel().accountNo != null) {
                let res = await PaymentService.createQrcode({
                    bin: selectedPaymentDropdown[0].bin,
                    accountNo: formRef.current.getModel().accountNo || payment.accountNo,
                    accountName: formRef.current.getModel().accountName || payment.accountName
                }, null, null)
                if (res.status === 200) {
                    setQrcode(res.data.data.qrDataURL)
                }
            }
        } catch (e) {

        }
        setLoading(0)
    }

    const getAllMyPayments = async () => {
        let res = await PaymentService.getAllPaymentInfo();
        if (res.status === 200) {
            setMyPayments(res.data.data);
            setLoading(0)
        }
    }


    useEffect(() => {
        getAllPaymentSupport();
        getAllMyPayments();
    }, [])


    const closeFormBankingPayment = () => {
        setPayment(null);
        setMode(null);
    }

    useEffect(() => {
        if (payment) {
            setSelectedPaymentDropdown([payment])
            createQrcode();
        }
    }, [payment])

    const setDataForBankingPayment = (value) => {
        setSelectedPaymentDropdown(value)
        setPayment({...value[0], id: payment?.id, accountName: payment?.accountName, accountNo: payment?.accountNo});
        if(formRef.current && formRef.current.state.isValid){
            setCanSubmit(true)
        }
    }


    const renderBank = ({item, itemIndex, props, state, methods}) => (
        <div key={item[props.valueField]}>
            <div style={{margin: "10px"}} onClick={() => methods.addItem(item)}>
                <img style={{height: 50}} src={item.logo}/>
                <span>{item.name}</span>
            </div>
        </div>
    );


    const setEditPayment = (pm) => {
        setPayment(pm);
        setMode(1);
    }

    const setCreatePayment = () => {
        setPayment(null);
        if (formRef.current) {
            formRef.current.updateInputsWithValue({
                accountNo: "",
                accountName: "",
            });
        }
        setSelectedPaymentDropdown([paymentList[0]]);
        setQrcode(null);
        setMode(0);
    }

    const removePayment = async () => {
        Swal.fire({
            title: `${t("payment.delete_payment")}?`,
            showCancelButton: true,
            cancelButtonText: t("payment.cancel"),
            confirmButtonText: t("payment.remove"),
            icon:"warning"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(1)
                try {
                    if (payment) {
                        const res = await PaymentService.deletes([payment.id]);
                        if (res.status === 200) {
                            Swal.fire(t("payment.delete_success"), t("payment.delete_payment"), "success");
                            setMode(null);
                            setPayment(null);
                            getAllMyPayments();
                        }
                    }
                } catch (e) {
                    Swal.fire("Update payment success!", "Updated payment!", "success");
                }
                setLoading(0)
            }
        });
    }

    const submitForm = async () => {
        let res;
        setLoading(1)
        try {
            if (mode === 0) {
                res = await PaymentService.addBankingPaymentInfo({
                    ...payment,
                    accountNo: formRef.current.getModel().accountNo,
                    accountName: formRef.current.getModel().accountName,
                    bin: selectedPaymentDropdown[0].bin,
                    code:selectedPaymentDropdown[0].code,
                    name: selectedPaymentDropdown[0].name,
                    logo: selectedPaymentDropdown[0].logo,
                    shortName: selectedPaymentDropdown[0].shortName,

                });
            } else {
                res = await PaymentService.updatePayment({
                    ...payment,
                    accountNo: formRef.current.getModel().accountNo,
                    accountName: formRef.current.getModel().accountName,
                    bin: selectedPaymentDropdown[0].bin,
                    code:selectedPaymentDropdown[0].code,
                    name: selectedPaymentDropdown[0].name,
                    logo: selectedPaymentDropdown[0].logo,
                    shortName: selectedPaymentDropdown[0].shortName,
                });

            }
            if (res.status === 200) {
                Swal.fire(mode===0?t("payment.payment_create"):t("payment.payment_update"), mode===0?t("payment.payment_create_success"):t("payment.payment_update_success"), "success");
            }
        } catch (e) {
            Swal.fire("Update payment success!", "Updated payment!", "error");
        }

        setMode(null);
        setPayment(null);
        getAllMyPayments();
        setLoading(0)
    }

    const handleCreateQrcode = () => {
        console.log("valid")
        if (formRef.current.state.isValid) {
            createQrcode();
        }
    }


    const renderBankingPaymentInfoComponent = () =>
        (mode !== null && <div>
            <Formsy ref={formRef}
                    onValid={e => {
                        if (selectedPaymentDropdown.length > 0) {
                            setCanSubmit(true)
                        }
                    }}
                    onInvalid={e => {
                        setCanSubmit(false);
                    }
                    }
            >
                <Select
                    className={"mb-2"}
                    placeholder={"Select bank"}
                    multi={false}
                    options={paymentList}
                    valueField={"bin"}
                    labelField={"name"}
                    onChange={value => setDataForBankingPayment(value)}
                    values={selectedPaymentDropdown}
                    itemRenderer={renderBank}
                    searchBy={"name"}
                />
                <div className={"form-group form-qrcode"}>
                    <label className={""}>{t("payment.accountNo")} : </label>
                    <FormInput className={"form-control float-left"}
                               value={payment?.accountNo || null}
                               name={"accountNo"}
                               type={"number"}
                               validations="minLength:4,isExisty,isRequired,maxLength:30"
                               validationErrors={{
                                   minLength: t("payment.validation.accountNoIsNotValid"),
                                   maxLength: t("payment.validation.accountNoIsNotValid"),
                                   isRequired: t("payment.validation.accountNoRequired"),
                               }}
                               onBlur={e => handleCreateQrcode()}
                    />
                </div>
                <div className={"form-group form-qrcode"}>
                    <label className={""}>{t("payment.accountName")} : </label>
                    <FormInput className={"form-control float-left"}
                               value={payment?.accountName || null}
                               name={"accountName"}
                               type={"text"}
                               validations="minLength:4,isExisty,isRequired,maxLength:30"
                               validationErrors={{
                                   minLength: t("payment.validation.accountNameIsNotValid"),
                                   maxLength: t("payment.validation.accountNameIsNotValid"),
                                   isRequired: t("payment.validation.accountNameRequired"),
                               }}
                               onBlur={e => handleCreateQrcode()}
                    />
                </div>

                <div className={"banking-form-action mt-5"}>
                    {mode === 1 && <Button onClick={e => removePayment()} className={"btn btn-warning"}>{t("payment.remove")}</Button>}
                    <Button onClick={submitForm} className={"btn btn-primary"} disabled={!canSubmit}>{t("payment.ok")}</Button>
                    <Button className={"btn btn-danger"} id={"close-from-banking-button"}
                            onClick={closeFormBankingPayment}>{t("payment.cancel")}</Button>
                </div>
            </Formsy>
        </div>)
    return (
        <div className={"row"}>
            {loading !== 0 && <Loading info={LOADINGS[loading]}/>}
            <div className={"col-md-7"}>
                {myPayment &&
                <div className={"banking-manager-container"}>
                    {myPayment?.map((pm, id) => (
                        <div className={`banking-item  ${payment?.id === pm.id ? "payment-active" : ""}`} key={id}
                             onClick={e => setEditPayment(pm)}>
                            <img src={pm.logo} height={40}/>
                        </div>
                    ))}
                    <div className={"banking-item add-item"} onClick={e => setCreatePayment()}>
                        <i className="fa-solid fa-plus mx-2 text-success"></i>
                        <i className={"mr-2"}>{t("payment.clickToAdd")}</i>

                    </div>
                </div>}
                <div className={"banking-form mt-3"}>
                    {mode != null && renderBankingPaymentInfoComponent()}
                </div>
            </div>
            <div className={"col-md-5"}>
                {loadingQR ? <div>LOADING</div> : <img width={"100%"} style={{margin: "0%"}}
                                                       src={qrCode}/>}
            </div>


        </div>
    );
}


export default Payment;