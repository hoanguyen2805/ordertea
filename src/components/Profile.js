import React, {useEffect, useRef, useState} from "react";
import {Redirect} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import "./profile.css";
import FormInput from "./formsy/FormInput";
import Formsy from "formsy-react";
import OrderDetailService from "../services/order-details.service";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import parse from 'date-fns/parse'
import {useTranslation} from "react-i18next";
import FileService from "../services/file.service"
import UserService from "../services/user.service"
import Loading from "./loading";
import {getUserInfo, updateUser} from "../actions/auth";
import verifyPermissionUser from "./verifyPermissionUser";
import Button from "react-bootstrap/Button";
import Payment from "./Payment";

const TYPE = {
    ALL: "ALL",
    ORDERED: "ORDERED",
    ORDERING: "ORDERING",
    // REJECT: "REJECT",
    CART: "CART",
};


const Profile = () => {
    const SERVER_FILE = process.env.REACT_APP_ENDPOINT + '/files/';
    const [countHistory, setCountHistory] = useState(null);
    const {user: currentUser} = useSelector((state) => state.auth);
    const [isEdit, setIsEdit] = useState(false);
    const [isEditFullName, setEditFullName] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const formRef = useRef();
    const [filterType, setFilterType] = useState(null);
    const [loading, setLoading] = useState(1);
    const dispatch = useDispatch();
    const [reloadPayment, setReloadPayment] = useState(1);
    const {t} = useTranslation();
    const LOADINGS = [
        null,
        t("profile.loading_data")
    ];


    useEffect(() => {
        getCountHistory();
    }, []);

    var myModalEl = document.getElementById('historyModal')
    if (myModalEl != null) {
        myModalEl.addEventListener('hidden.bs.modal', function (event) {
            getCountHistory();
        })
    }


    useEffect(() => {
        if (filterType) {
            document.getElementById("toggleModal").click();
        }
    }, [filterType]);


    const handleClickOutInputFullName = (e) => {
        if (!e.target.classList.contains("target-out")) {
            cancelEditFullname()
        }
    }

    useEffect(() => {
        let fullNameInput = document.getElementsByClassName("profile__username")[0]
        if (isEditFullName) {
            fullNameInput.focus();
            document.addEventListener("click", handleClickOutInputFullName)
        }
        return (() => {
            if (fullNameInput) {
                document.removeEventListener("click", handleClickOutInputFullName)
            }
        })

    }, [isEditFullName])

    const getCountHistory = async () => {
        try {
            const data = await OrderDetailService.countHistory();
            if (data.status === 200 && data.data.data) {
                setCountHistory(data.data.data);
                setLoading(0)
            }
        } catch (e) {
            setLoading(0)
            console.log(e);
        }
    };

    const toggleHistoryModal = (type) => {
        setFilterType(type);
    };

    if (!currentUser) {
        return <Redirect to="/login"/>;
    }

    const handleEdit = (value) => {
        setIsEdit(value);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {

            const res = await UserService.changePassword(
                formRef.current.getModel().password
            );
            if (res.status === 200 && res.data.data === 1) {
                setIsEdit(false);
                Swal.fire("Change password success!", "Updated password!", "success");
            }
        } catch (e) {
            alert("Error! Please try again");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleCloseModal = () => {
        setTimeout(() => {
            setFilterType(null);
        }, 200);
    };


    const uploadAvatar = async (e) => {
        try {
            const formData = new FormData();
            const file = e.target.files[0];
            if (!file.type.startsWith("image")) {
                Swal.fire("File is not valid", "", "error");
                return;
            }
            setIsSubmitting(true)
            formData.append("file", e.target.files[0])
            let res = await FileService.uploadAvatar(formData);
            if (res.status === 200) {
                res = await UserService.updateUser({...currentUser, roles: [], img: res.data});
                if (res.status === 200) {
                    dispatch(updateUser(res.data));
                    Swal.fire({
                        title: t("profile.change_info_success"),
                        icon: "success",
                        showConfirmButton: true
                    });
                } else {
                    Swal.fire("Cannot change avatar", "", "error");
                }
                setIsSubmitting(false)
            }
        } catch (e) {
            console.log(e)
        }

    }


    const handleEditFullName = async () => {

        if (formRef.current.getModel().fullname !== currentUser.fullName) {
            try {
                setIsSubmitting(true);
                let res = await UserService.updateUser({...currentUser, fullName: formRef.current.getModel().fullname})
                if (res.status === 200) {
                    dispatch(updateUser(res.data));
                    Swal.fire({
                        icon: 'success',
                        title: t("profile.change_info_success", "success"),
                        showConfirmButton: true
                    })

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: t("profile.change_info_error", "success"),
                        showConfirmButton: true
                    })

                }
                setIsSubmitting(false)
            } catch (e) {
                setIsSubmitting(false)
                Swal.fire({
                    icon: 'error',
                    title: t("profile.change_info_error", "success"),
                    showConfirmButton: true
                })

            }
        }
        setEditFullName(!isEditFullName);

    };

    const cancelEditFullname = () => {
        formRef.current.updateInputsWithValue({fullname: currentUser.fullName})
        setEditFullName(false);
    };

    return loading !== 0 && countHistory == null ?
        <Loading info={LOADINGS[loading]}/> :
        <div className="layout">
            {loading !== 0 && <Loading info={LOADINGS[loading]}/>}
            {isSubmitting && <div className="loader"></div>}
            <Formsy
                ref={formRef}
                onInvalid={(e) => setCanSubmit(false)}
                onValid={(e) => setCanSubmit(true)}
            >
                <input type={"file"} accept="image/*" onChange={uploadAvatar} hidden id={"select-avatar"}/>
                <div className={`profile ${isEdit ? "height" : ""}`}>

                    <div className={`profile__picture `} data-bs-toggle="tooltip"
                         data-bs-placement="top"
                         title="Click to change avatar"
                         onClick={e => document.getElementById("select-avatar").click()}>
                        <img
                            src={!currentUser.img || currentUser.img === "" ? "https://1.bp.blogspot.com/-MCwQd9pDnN4/Yef7-P9o_LI/AAAAAAAACWU/OeEZ_Okmi6kT4q7vjd_T7otd3tdnNMokwCNcBGAsYHQ/s1600/huyhoangit.jpg" : SERVER_FILE + currentUser.img}
                            alt="ananddavis"
                        />
                        <div id={"change-avatar-animation"}>
                            <i className="fa-solid fa-camera"></i>
                        </div>
                    </div>

                    <div className="profile__header">
                        <div className="profile__account">
                            <FormInput name={"fullname"} className="target-out profile__username"
                                       readOnly={!isEditFullName}
                                       type={"text"}
                                       validations="minLength:3,isExisty,isRequired,maxLength:100"
                                       validationErrors={{
                                           minLength: t("profile.fullname_invalid"),
                                           maxLength: t("profile.fullname_invalid"),
                                           isRequired: t("profile.fullname_required"),
                                       }}
                                       value={currentUser.fullName && currentUser.fullName.length > 0 ? currentUser.fullName : currentUser.username}/>
                            <di
                                className={"profile-button  target-out"}
                                style={{
                                    marginLeft: 5,
                                    cursor: canSubmit ? "pointer" : "not-allowed",
                                }}
                                onClick={(e) => canSubmit ? handleEditFullName() : null}
                            >
                                {isEditFullName ?
                                    <i className={`target-out fa-regular fa-circle-check ${canSubmit ? 'text-success' : 'text-secondary'}`}></i> :
                                    <i className="target-out fa-regular fa-pen-to-square"></i>}
                            </di>
                            {isEditFullName && <div
                                className={"target-out profile-button"}
                                style={{
                                    marginLeft: 5
                                }}
                                onClick={(e) => cancelEditFullname()}
                            >
                                <i className="target-out fa-solid fa-xmark text-danger"></i>
                            </div>}
                        </div>
                    </div>

                    <div className="profile__stats">
                        <div
                            className="profile__stat"
                            onClick={() => toggleHistoryModal(TYPE.CART)}
                        >
                            <div className="profile__icon profile__icon--green">
                                <i className="fa-solid fa-cart-arrow-down"></i>
                            </div>
                            <div className="profile__value">
                                {countHistory?.cart || 0}
                                <div className="profile__key">Cart</div>
                            </div>
                        </div>
                        <div
                            className="profile__stat"
                            onClick={() => toggleHistoryModal(TYPE.ORDERED)}
                        >
                            <div className="profile__icon profile__icon--blue">
                                <i className="fas fa-signal"></i>
                            </div>
                            <div className="profile__value">
                                {countHistory?.ordered || 0}
                                <div className="profile__key">Ordered</div>
                            </div>
                        </div>
                        <div
                            className="profile__stat"
                            onClick={() => toggleHistoryModal(TYPE.ORDERING)}
                        >
                            <div className="profile__icon profile__icon--gold">
                                <i className="fa-solid fa-martini-glass-citrus"></i>
                            </div>
                            <div className="profile__value">
                                {countHistory?.ordering || 0}
                                <div className="profile__key">Ordering</div>
                            </div>
                        </div>
                        {/*<div*/}
                        {/*    className="profile__stat"*/}
                        {/*    onClick={() => toggleHistoryModal(TYPE.REJECT)}*/}
                        {/*>*/}
                        {/*    <div className="profile__icon profile__icon--pink">*/}
                        {/*        <i className="fa-solid fa-arrow-rotate-left"></i>*/}
                        {/*    </div>*/}
                        {/*    <div className="profile__value">*/}
                        {/*        {countHistory.reject || 0}*/}
                        {/*        <div className="profile__key">Reject</div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                    <div className={"profile-email"}>
                        <i className="profile__icon fa-solid fa-user"></i>
                        {currentUser.username}
                    </div>
                    <div className={"profile-email"}>
                        <i className="profile__icon fa-solid fa-envelope"></i>
                        {currentUser.email}
                    </div>

                    {isEdit ? (
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <div className={"profile-email mb-2"}>
                                <i className="profile__icon fa-solid fa-unlock"></i>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <FormInput
                                        className="form-control"
                                        name="password"
                                        autoFocus
                                        validations="minLength:6,isExisty,isRequired,maxLength:40"
                                        isPassword
                                        validationErrors={{
                                            minLength: t("profile.password_min_length"),
                                            maxLength: t("profile.password_max_length"),
                                            isRequired: t("profile.password_required"),
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={"profile-email"}>
                                <i className=" profile__icon fa-solid fa-unlock-keyhole"></i>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <FormInput
                                        className="form-control"
                                        name="confirmPassword"
                                        isPassword
                                        validations="minLength:6,isExisty,isRequired,isConfirm:password,maxLength:40"
                                        validationErrors={{
                                            minLength: t("profile.password_min_length"),
                                            maxLength: t("profile.password_max_length"),
                                            isRequired: t("profile.password_required"),
                                            isConfirm: t("profile.password_confirm"),
                                        }}
                                    />
                                </div>
                                <div
                                    className={"profile-button"}
                                    style={{
                                        marginLeft: 5,
                                        cursor: canSubmit ? "pointer" : "not-allowed",
                                    }}
                                    onClick={(e) => (canSubmit ? handleSubmit() : null)}
                                >
                                    <i
                                        className="fa-regular fa-circle-check"
                                        style={{color: canSubmit ? "green" : "grey", margin: 5}}
                                    ></i>
                                </div>
                                <div
                                    className={"profile-button"}
                                    style={{marginLeft: 5}}
                                    onClick={(e) => handleEdit(!isEdit)}
                                >
                                    <i
                                        className="fa-solid fa-xmark "
                                        style={{color: "red", margin: 5}}
                                    ></i>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={"profile-email"}>
                            <i className="profile__icon fa-solid fa-lock"></i>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                {"**********"}
                            </div>
                            <div
                                className={"profile-button"}
                                style={{marginLeft: 15}}
                                onClick={(e) =>
                                    !isEdit ? handleEdit(!isEdit) : handleSubmit()
                                }
                            >
                                {!isEdit ? (
                                    <i className="fa-solid fa-repeat"></i>
                                ) : (
                                    <i
                                        className="fa-regular fa-circle-check"
                                        style={{color: "green"}}
                                    ></i>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={"profile-email banking-payment-info"}>
                        <i className="profile__icon fa-solid fa-wallet"></i>
                        {t("profile.banking_payment")} : {currentUser.bankingPaymentInfoList?.length}
                        <Button className={"btn btn-sm ml-2"}
                                onClick={e => document.getElementById("toggleModalPayment").click()}>{t("profile.manager")}</Button>
                    </div>
                </div>

            </Formsy>

            {filterType && (
                <HistoryComponent
                    type={filterType}
                    submitNullType={handleCloseModal}
                />
            )}
            <div
                data-bs-toggle="modal"
                data-bs-target="#historyModal"
                id={"toggleModal"}
            ></div>

            <div
                data-bs-toggle="modal"
                data-bs-target="#paymentModal"
                id={"toggleModalPayment"}
            ></div>
            {reloadPayment &&
            <ModalPayment />}
        </div>
};


function ModalPayment(props) {
    const dispatch = useDispatch();
    const {t} = useTranslation();

     const confirmBeforeClose = async () => {
        dispatch(getUserInfo());
        document.getElementById("close-from-banking-button") && document.getElementById("close-from-banking-button").click()
        document.getElementById("close-modal").click()
    }

    return (<div
        className="modal hide fade "
        id="paymentModal"
        data-bs-backdrop="static"
        tabIndex="-1"
        data-keyboard="false"
        aria-labelledby="exampleModalLabel2"
        aria-hidden="true"
    >
        <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{minHeight: '50vh'}}>
                <div className="modal-header">
                    <h6
                        className="modal-title"
                        id="exampleModalLabel"
                        style={{
                            color: "#4b7ae3",
                            fontSize: 20,
                            flex: 1,
                            justifyItems: "flex-start",
                        }}
                    >
                        {t("profile.banking_payment")}
                    </h6>
                    <div
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        style={{margin: 5}}
                        aria-label="Close"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </div>
                </div>
                <div className="modal-body">
                    <Payment />
                </div>
                <div className="modal-footer">
                    <button type="button" style={{width: "100px"}}
                            className="btn btn-secondary" onClick={confirmBeforeClose}>{t("profile.close")}</button>
                    <button
                        hidden
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                        style={{width: "100px"}}
                        id={"close-modal"}
                    >
                        {t("profile.close")}
                    </button>
                </div>
            </div>
        </div>
    </div>)
}

function HistoryComponent(props) {
    const {t} = useTranslation();
    const LOADINGS = [
        null,
        t("profile.loading_data")
    ];

    const [loading, setLoading] = useState(1);
    const [orderDetails, setOrderDetails] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        pageSize: 5,
        total: 0,
        search: {
            status: props.type || "ALL",
            is_deleted: false,
        },
    });

    useEffect(() => {
        if (props.type != null) {
            getOrderDetails(pagination);
        }
    }, [props.type]);

    const handleChangePage = (page) => {
        getOrderDetails({...pagination, page: page.selected});
    };

    const handleChangePageSize = (e) => {
        const maxPage = Math.ceil(pagination.total / e.target.value);

        getOrderDetails({
            ...pagination,
            pageSize: e.target.value,
            page: Math.min(pagination.page, maxPage - 1),
        });
    };

    const getOrderDetails = async (pagination) => {
        try {
            setLoading(1)
            const resData = await OrderDetailService.getOrderDetails({
                page: pagination.page,
                pageSize: pagination.pageSize,
                searchData: convertSearchObjectToSearchData(pagination.search),
            });
            if (resData.status === 200 && resData.data) {
                setOrderDetails(resData.data.data);
                setPagination(resData.data.pagination);
                setLoading(0)
            }
        } catch (e) {
            setLoading(0)
            console.log(e);
        }
    };

    const changeFilterType = (value) => {
        const search = {...pagination.search, status: value};
        getOrderDetails({...pagination, search: search});
    };

    const confirmDelete = async (order) => {
        Swal.fire({
            title: `${t("profile.delete_order")} ${order.created_at} ?`,

            showCancelButton: true,
            cancelButtonText: t("profile.cancel"),
            confirmButtonText: t("profile.delete"),
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(5);
                try {
                    let res = await OrderDetailService.deleteOrderDetails([order.id]);
                    if (res.status === 200 && res.data.data === 1) {

                        await getOrderDetails(pagination);
                        Swal.fire("Saved!", "", "success");
                    }
                } catch (e) {
                    Swal.fire("Changes are not saved", "", "info");
                }
            }
        });
    };

    const updateQuantityOrderDetails = async (order) => {

        if (parse(order.time_remaining, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime() <= new Date().getTime()) {
            Swal.fire("Order is closed", "", "info");
            let res = await OrderDetailService.getOrderDetails(pagination);
            if (res.status === 200 && res.data.data) {
                setOrderDetails(res.data.data);
            }
            return;
        }

        const quantity = order.quantity;
        Swal.fire({
            title:
                '<label style="font-size: 25px; margin-top: 0">Update OrderDetail</label>',
            html: `
                <div className="edit-orderdetails-container">
                    <div>
                        <img style="border: solid 1px" src="${order.product.photos[0].value}"/> 
                    </div> 
                    <div className="info-container">
                        <label className="product-name">${order.product.name}</label>
                        <label className="price">
                            ${Number(order.product?.discount_price?.value || order.product?.price.value).toLocaleString("en-US")}
                            <span style="font-weight: 400; position: relative; top: -9px; font-size: 10px; right: 0px;">
                                đ
                            </span>
                        </label>
                        <div class="d-flex justify-content-center">
                            <span class="input-group-prepend">
                                <button onclick="
                                    javascript:{const el = document.getElementById('quantity-value');
                                    el.value = parseInt(el.value) - 1>1?parseInt(el.value)-1:1;
                                    }"
                                    class="btn btn-danger"
                                >
                                    <i class="fa fa-minus"></i>
                                </button>
                            </span>
                            <input id="quantity-value" class="form-control input-number d-inline-block text-center" style="width: 45px" value="${quantity}" type="text"/>
                            <span class="input-group-prepend">
                                <button onclick="javascript:{
                                    const el = document.getElementById('quantity-value');
                                    el.value = parseInt(el.value) + 1<=20?parseInt(el.value)+1:20;
                                    }"
                                    class="btn btn-success"
                                >
                                    <i class="fa fa-plus"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Update",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const value = document.getElementById("quantity-value").value;
                try {
                    setLoading(3);
                    let res = await OrderDetailService.updateOrderDetail({
                        ...order,
                        quantity: parseInt(value),
                        order: {
                            ...order.orderDTO,
                        },
                    });
                    if (res.status === 200) {
                        await getOrderDetails(pagination);
                        Swal.fire("Saved!", "", "success");
                    }
                } catch (e) {
                    Swal.fire("Changes are not saved", "", "info");
                }
            }
        });
    };

    return (
        <>
            {loading !== 0 && <Loading info={LOADINGS[loading]}/>}
            <div
                className="modal hide fade "
                id="historyModal"
                data-bs-backdrop="static"
                tabIndex="-1"
                data-keyboard="false"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content" style={{minHeight: '50vh'}}>
                        <div className="modal-header">
                            <h6
                                className="modal-title"
                                id="exampleModalLabel"
                                style={{
                                    color: "#4b7ae3",
                                    fontSize: 20,
                                    flex: 1,
                                    justifyItems: "flex-start",
                                }}
                            >
                                {t(`profile.list_${pagination.search.status.toLowerCase()}`)}
                            </h6>
                            <div
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                style={{margin: 5}}
                                onClick={(e) => props.submitNullType(null)}
                                aria-label="Close"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className={"header-search"}>
                                <select
                                    onChange={(e) => changeFilterType(e.target.value)}
                                    value={pagination.search.status}
                                    className="custom-select"
                                    style={{width: "15%"}}
                                >
                                    {[TYPE.ALL, TYPE.CART, TYPE.ORDERED, TYPE.ORDERING].map(
                                        (type, index) => (
                                            <option key={index} value={type}>
                                                {t(`profile.status_${type.toLowerCase()}`)}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col" style={{width: "5%"}}>
                                        #
                                    </th>
                                    <th scope="col" style={{width: "15%"}}>
                                        {t("profile.ordered_time")}
                                    </th>
                                    <th scope="col">{t("profile.product_name")}</th>
                                    <th scope="col" style={{width: "8%"}}>
                                        {t("profile.quantity")}
                                    </th>
                                    <th scope="col " style={{width: "5%"}}>
                                        {t("profile.price")}
                                    </th>
                                    <th scope="col" style={{width: "9%"}}>
                                        {t("profile.status")}
                                    </th>
                                    <th scope="col" style={{width: "12%"}}>
                                        {t("profile.order")}
                                    </th>
                                    <th scope="col" style={{width: "5%"}}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {orderDetails.map((order, index) => (
                                    <tr key={index}>
                                        <th className="align-middle" scope="row">
                                            {index + 1}
                                        </th>
                                        <td className="align-middle">
                                            {order.created_at.substr(
                                                0,
                                                order.created_at.length - 2
                                            )}
                                            00
                                        </td>
                                        <td className="align-middle">{order.product.name}                                        </td>
                                        <td className="align-middle text-center">{order.quantity}</td>
                                        <td className="align-middle">
                                            {Number(
                                                order.product?.discount_price?.value ||
                                                order.product?.price?.value
                                            ).toLocaleString("en-US")}
                                            <span style={{
                                                fontWeight: '400',
                                                position: 'relative',
                                                top: '-9px',
                                                fontSize: '10px',
                                                right: '0px'
                                            }}>
                                                    đ
                                                </span>
                                        </td>
                                        <td className="align-middle">
                                            {genBadgeStatus(order.status, order.orderDTO.status)}
                                        </td>
                                        <td className="align-middle text-center">
                                            {genBadgeOrderStatus(order.orderDTO.status)}
                                        </td>
                                        <td className="align-middle">
                                            <div className={"action-group"}>

                                                {parse(order.time_remaining, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime() > new Date().getTime() && order.orderDTO.status === "ACTIVATED" && (
                                                    <div
                                                        data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        title="edit"
                                                        className={"button-icon"}
                                                        onClick={(e) =>
                                                            updateQuantityOrderDetails(order)
                                                        }
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-info"></i>
                                                    </div>
                                                )}

                                                <div
                                                    data-bs-toggle="tooltip"
                                                    data-bs-placement="top"
                                                    title="remove"
                                                    onClick={(e) => confirmDelete(order)}
                                                    className={"button-icon"}
                                                >
                                                    <i className="fa-solid fa-trash-can text-danger"></i>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {orderDetails.length === 0 && loading === 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-around",
                                        textAlign: "center",
                                    }}
                                >
                                    <label>{t("profile.empty")}</label>
                                </div>
                            )}
                            {orderDetails.length > 0 && (
                                <div className={"pagination-main-container"}>
                                    <label>{t("profile.item_per_page")} &nbsp;&nbsp; </label>
                                    <select
                                        value={pagination.pageSize}
                                        className="custom-select"
                                        style={{width: "7%"}}
                                        onChange={handleChangePageSize}
                                    >
                                        {[5, 10, 20].map((size, index) => (
                                            <option key={index} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>

                                    <ReactPaginate
                                        containerClassName={"pagination-container"}
                                        pageClassName={"pagination-page"}
                                        pageLinkClassName={"pagination-pagelink"}
                                        activeClassName={"pagination-active"}
                                        previousLinkClassName={"pagination-pagelink"}
                                        nextLinkClassName={"pagination-pagelink"}
                                        breakLabel="..."
                                        nextLabel=">"
                                        disabledClassName={"pagination-disabled"}
                                        onPageChange={handleChangePage}
                                        pageRangeDisplayed={5}
                                        pageCount={Math.ceil(
                                            pagination.total / pagination.pageSize
                                        )}
                                        previousLabel="<"
                                        renderOnZeroPageCount={null}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                style={{width: "100px"}}
                                id={"close-modal"}
                                onClick={(e) => props.submitNullType(null)}
                            >
                                {t("profile.close")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function genBadgeStatus(status, orderStatus) {
    switch (status) {
        case "REJECT": {
            return (
                <span
                    className="badge rounded-pill "
                    style={{backgroundColor: "#ff86af", padding: "5px 10px"}}
                >
                    {status}
                </span>
            );
        }
        case "ACTIVATED": {
            return (
                <span
                    className="badge rounded-pill "
                    style={{
                        backgroundColor:
                            orderStatus === "DONE" ? "#86d9ff" : "rgb(227 226 36)",
                        padding: "5px 10px",
                    }}
                >
                    {orderStatus === "DONE" ? "ORDERED" : "ORDERING"}
                </span>
            );
        }
        case "UNACTIVATED": {
            return <span
                className="badge rounded-pill "
                style={{
                    backgroundColor: "#89d237",
                    padding: "5px 10px",
                }}
            >
                   IN CART
                </span>
        }
    }
}

function genBadgeOrderStatus(status) {
    switch (status) {
        case "DONE": {
            return (
                <span
                    className="badge rounded-pill "
                    style={{backgroundColor: "#ff86af", padding: "5px 10px"}}
                >
                    {"DONE"}
                </span>
            );
        }
        case "ACTIVATED": {
            return (
                <span
                    className="badge rounded-pill "
                    style={{backgroundColor: "#86d9ff", padding: "5px 10px"}}
                >
                    {"IN TIME"}
                </span>
            );
        }
        case "PENDINGPAYMENT": {
            return (
                <span
                    className="badge rounded-pill "
                    style={{backgroundColor: "rgb(255 117 136)", padding: "5px 10px"}}
                >
                    {"PENDING"}
                </span>
            );
        }
    }
}

function convertSearchObjectToSearchData(obj) {
    let search = "";
    Object.keys(obj).forEach((key) => {
        search += `${key}=${obj[key]},`;
    });
    return search;
}

export default verifyPermissionUser(Profile);
