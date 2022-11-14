import React, {useState, useEffect} from "react";
import {useParams} from "react-router";
import {NavLink, Link} from "react-router-dom";
import OrderService from "../../services/order.service.js";
import "./orderer.css";
import EventBus from "../../common/EventBus";
import OrderDetailService from "../../services/order-details.service";
import Modal from "./Modal";
import useModal from "./useModal";
import Button from "react-bootstrap/Button";
import Loading from "../loading";
import ReactExport from "react-data-export";
import verifyPermissionOrderer from "../verifyPermissionOrderer.js";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import {format} from "date-fns";
import {updateOrderDetail} from "../../actions/order-detail";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const LOADINGS = [
    null,
    "ĐANG TẢI DỮ LIỆU",
    "ĐANG THÊM VÀO GIỎ HÀNG",
    "ĐANG CẬP NHẬT ĐƠN HÀNG",
    "ĐANG SAO CHÉP ĐƠN HÀNG",
    "ĐANG XÓA ĐƠN HÀNG",
    "ĐANG ĐẶT",
];

const multiDataSetG = [
    {
        columns: [
            {
                title: "#",
                width: {wpx: 30},
                style: {
                    fill: {patternType: "solid", fgColor: {rgb: "FF2056fc"}},
                    font: {color: {rgb: "FFf7f7f7"}, bold: true},
                    alignment: {horizontal: "center"},
                },
            },
            {
                title: "Người đặt",
                width: {wpx: 180},
                style: {
                    fill: {patternType: "solid", fgColor: {rgb: "FF2056fc"}},
                    font: {color: {rgb: "FFf7f7f7"}, bold: true},
                },
            },
            {
                title: "Tên sản phẩm",
                width: {wpx: 250},
                style: {
                    fill: {patternType: "solid", fgColor: {rgb: "FF2056fc"}},
                    font: {color: {rgb: "FFf7f7f7"}, bold: true},
                },
            },
            {
                title: "Ghi chú",
                width: {wpx: 200},
                style: {
                    fill: {patternType: "solid", fgColor: {rgb: "FF2056fc"}},
                    font: {color: {rgb: "FFf7f7f7"}, bold: true},
                },
            },
            {
                title: "Đã trả tiền",
                width: { wpx: 120 },
                style: {
                    fill: { patternType: "solid", fgColor: { rgb: "FF2056fc" } },
                    font: { color: { rgb: "FFf7f7f7" }, bold: true },
                    alignment: { horizontal: "center" },
                },
            },
            {
                title: "Số lượng",
                width: {wpx: 60},
                style: {
                    fill: {patternType: "solid", fgColor: {rgb: "FF2056fc"}},
                    font: {color: {rgb: "FFf7f7f7"}, bold: true},
                    alignment: {horizontal: "center"},
                },
            },
            {
                title: "Giá",
                width: {wpx: 100},
                style: {
                    fill: {patternType: "solid", fgColor: {rgb: "FF2056fc"}},
                    font: {color: {rgb: "FFf7f7f7"}, bold: true},
                    alignment: {horizontal: "center"},
                },
            },
            
        ],
        data: null,
    },
];

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [orderDetailList, setOrderDetailList] = useState([]);
    const {isShowing, toggle} = useModal();
    const {id} = useParams();
    const [loading, setLoading] = useState(1);
    const {t} = useTranslation();
    const [filtered, setFiltered] = useState(null);
    const [searchUser, setSearchUser] = useState("");
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        reloadOrderData(id);
    }, [id]);

    const changePayment = async (e, item) => {
        let value = e.target.checked;
        try {
            setLoading(1);
            let res = await OrderDetailService.updateOrderDetail({
                ...item,
                paid: value,
                order: {
                    ...item.orderDTO,
                },
            });
            if (res.status === 200) {
                reloadOrderData(id);
            }
        } catch (e) {
            setLoading(0);
        }
    };

    const reloadOrderData = async (id) => {
        try {
            let res = await OrderService.getOrderById(id);
            if (res.data) {
                setOrder(res.data);
                setOrderDetailList(res.data.orderDetailList);
                setFiltered(res.data.orderDetailList);
                // START EXPORT EXCEL
                var data = [];
                res.data.orderDetailList.map((item, index) => {
                    if (item.status === "ACTIVATED") {
                        data.push([
                            {
                                value: index + 1,
                                style: {
                                    alignment: {horizontal: "center"},
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000" } },
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                            {
                                value: item.user.fullName
                                    ? item.user.fullName
                                    : item.user.username,
                                style: {
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000" } },
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                            {
                                value: item.product.name,
                                style: {
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000" } },
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                            {
                                value: item.description ? item.description : "",
                                style: {
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000" } },
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                            {
                                value: item.paid
                                    ? "✓"
                                    : "✗",
                                style: {
                                    font: { color: { rgb: item.paid ? "FF00d66b" : "FFf23c4b" }, bold: true },
                                    alignment: { horizontal: "center" },
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000"}},
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                            {
                                value: item.quantity,
                                style: {
                                    alignment: {horizontal: "center"},
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000" } },
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                            {
                                value: item.product.discount_price
                                    ? item.product.discount_price.value * item.quantity
                                    : item.product.price.value * item.quantity,
                                style: {
                                    alignment: {horizontal: "center"},
                                    fill: { patternType: "solid", fgColor: { rgb: item.paid ? "FFffffff" : "FFfff896" } },
                                    border: {
                                        top: { style: "thin", color: { rgb: "FF000000" } },
                                        right: { style: "thin", color: { rgb: "FF000000" } },
                                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                                        left: { style: "thin", color: { rgb: "FF000000" } },
                                    }
                                },
                            },
                        ]);
                    }
                });

                data.sort((a, b) =>
                    a[2].value > b[2].value ? 1 : b[2].value > a[2].value ? -1 : 0
                );

                var i = 1;
                var totalPrice = 0;
                var totalQuantity = 0;
                data.map((item) => {
                    item[0].value = i;
                    totalPrice = totalPrice + item[6].value;
                    totalQuantity = totalQuantity + item[5].value;
                    item[6].value = item[6].value.toLocaleString("en-US") + "đ";
                    i++;
                    return item;
                });

                data.push([
                    {
                        value: "",
                        style: {fill: { patternType: "solid", fgColor: { rgb: "FF044263" } }},    
                    },
                    {
                        value: "",
                        style: { fill: { patternType: "solid", fgColor: { rgb: "FF044263" } } },
                    },
                    {
                        value: "",
                        style: { fill: { patternType: "solid", fgColor: { rgb: "FF044263" } } },
                    },
                    {
                        value: "",
                        style: { fill: { patternType: "solid", fgColor: { rgb: "FF044263" } } },
                    },
                    {
                        value: "",
                        style: { fill: { patternType: "solid", fgColor: { rgb: "FF044263" } } },
                    },
                    {
                        value: totalQuantity,
                        style: {
                            alignment: {horizontal: "center"},
                            fill: {patternType: "solid", fgColor: {rgb: "FF044263"}},
                            font: {color: {rgb: "FFf7f7f7"}, bold: true, sz: "14"},
                        },
                    },
                    {
                        value: totalPrice.toLocaleString("en-US") + "đ",
                        style: {
                            alignment: {horizontal: "center"},
                            fill: {patternType: "solid", fgColor: {rgb: "FF044263"}},
                            font: {color: {rgb: "FFf7f7f7"}, bold: true, sz: "14"},
                        },
                    },
                ]);

                multiDataSetG[0].data = data;
                // END EXPORT EXCEL
            }
            setLoading(0);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                EventBus.dispatch("logout");
            }
            setLoading(0);
        }
    };

    const cloneOrder = (url) => {
        localStorage.setItem("url", JSON.stringify(url));
    };

    function checkStatus(status) {
        if (status === "ACTIVATED") {
            return (
                <span
                    className="badge badge-success ml-1 mt-1 change-status"
                    style={{fontSize: "12px"}}
                >
          {t("board_admin.activate")}
        </span>
            );
        } else if (status === "DONE") {
            return (
                <span
                    className="badge badge-primary ml-1 mt-1 change-status"
                    style={{fontSize: "12px"}}
                >
          {t("board_admin.done")}
        </span>
            );
        } else if (status === "UNACTIVATED") {
            return (
                <span
                    className="badge badge-secondary ml-1 mt-1 change-status"
                    style={{fontSize: "12px"}}
                >
          {t("board_admin.unactivate")}
        </span>
            );
        } else {
            return (
                <span
                    className="badge badge-danger ml-1 mt-1 change-status"
                    style={{fontSize: "12px"}}
                >
          {t("board_admin.pending")}
        </span>
            );
        }
    }

    const onChangeSearchUser = (e) => {
        const searchUser = e.target.value;
        setSearchUser(searchUser);
        const filtered = orderDetailList.filter((item) =>
            item.user.username.toLowerCase().includes(searchUser.toLowerCase())
        );
        setFiltered(filtered);
    };

    const approvePaymentOrderDetail = async (item, approve) => {
        try{
            let res = await OrderDetailService.paymentApprove(item.id,approve)
            if (res.status === 200) {
                reloadOrderData(id)
            }
        }catch (e){
            console.log(e)
        }
    }


    return loading !== 0 ? (
        <Loading backdrop info={LOADINGS[loading]}/>
    ) : (
        <>
            {order && (
                <div className="orderer-content">
                    <div className="row">
                        <div className="title-content">
                            <div className="header-line align-items-baseline">
                                <h3>{order.store?.name}</h3>
                                <Link to="/restaurant-management/orders/clone">
                                    <i
                                        className="fa-solid fa-clone ml-2 btn-copy-order"
                                        data-mdb-toggle="tooltip"
                                        title={t("board_admin.re_order")}
                                        onClick={cloneOrder(order.store.url)}
                                    ></i>
                                </Link>
                            </div>

                            <p><b>{t("board_admin.address")} :</b> {order.store?.address}</p>
                            <p><b>{t("board_admin.create_at")} :</b> {order.store?.created_at}</p>
                            <p><b>{t("board_admin.create_by")} :</b> {order.store?.created_by}</p>
                            <p><b>{t("board_admin.link_shop")} :</b> {order.store?.url}</p>
                            <div className="header-line mt-1">
                                <b><i className="fa-solid fa-stopwatch mr-2 mt-1 text-secondary align-center"></i></b>
                                <div>{order.time_remaining}</div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-2">
                        <div className="order-detail-control flex-column">
                            <div className="order-detail-left">
                                <p className="m-1"><b>{t("profile.status")} :</b></p>
                                {checkStatus(order.status)}
                                <button
                                    type="button"
                                    className="btn btn-info ml-2 p-1"
                                    onClick={toggle}
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>{t("board_admin.change")}
                                </button>
                            </div>

                            {isShowing && (
                                <Modal
                                    hide={toggle}
                                    stt={order.status}
                                    id={order.id}
                                    order={order}
                                    time_remaining={order.time_remaining}
                                />
                            )}
                            {orderDetailList?.length > 0 && (
                                <div className="group-button-orderer-right">
                                    <NavLink
                                        to={`/restaurant-management/orders/billDetail/${order.id}`}
                                    >
                                        <Button className="p-1 mr-3">
                                            <i className="fa-solid fa-calculator mr-2"></i>{t("board_admin.bill_detail")}
                                        </Button>
                                    </NavLink>
                                    <ExcelFile
                                        element={
                                            <button className="btn btn-danger p-1">
                                                <i className="fa fa-file-excel mr-2" aria-hidden="true"></i>
                                                {t("board_admin.export_excel")}
                                            </button>
                                        }
                                        filename={"OrderDetail_" + id}
                                    >
                                        <ExcelSheet dataSet={multiDataSetG} name="Bill"/>
                                    </ExcelFile>
                                    <br/>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row search-user-order">
                        <div className="input-group mb-3">
                            <label>
                                <i className="fa-solid fa-filter"></i>
                            </label>
                            <input
                                type="search"
                                className="form-control ml-2"
                                placeholder={t("user_management.filter_key")}
                                value={searchUser}
                                onChange={(e) => onChangeSearchUser(e)}
                            />
                        </div>
                    </div>
                    <div class="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th className="image-pro"></th>
                            <th className="productName"></th>
                            <th className="quantity">{t("profile.quantity")}</th>
                            <th className="userOrder">{t("board_admin.user_name")}</th>
                            <th>{t("restaurant.note_order")}</th>
                            <th className="status">{t("profile.status")}</th>
                            <th className="payment">{t("board_admin.payment")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered?.length > 0 &&
                        filtered.map((item, index) => (
                            <tr
                                key={index}
                                className={item.paid === true ? "paided" : ""}
                            >
                                <td className="image-pro align-middle">
                                    <img src={item.product.photos[0].value} alt=""/>
                                </td>
                                <td className="productName align-middle">
                                    {item.product.name}
                                </td>
                                <td className="quantity align-middle">{item.quantity}</td>
                                <td className="userOrder align-middle">
                                    {item.user?.username}
                                </td>
                                <td className="note align-middle">{item.description}</td>
                                <td className={`align-middle status-order-${item.status}`}>
                                    {item.status === "ACTIVATED" ? `${t("restaurant.ordered")}` : `${t("restaurant.ordering")}`}
                                </td>
                                <td className="payment align-middle">
                                    <div className="d-flex">
                                        <label className="payment-text">
                                            {Number(
                                                item.product.discount_price?.value
                                                    ? item.product.discount_price.value *
                                                    item.quantity
                                                    : item.product.price.value * item.quantity
                                            ).toLocaleString("en-US")}
                                            <span
                                                style={{
                                                    fontWeight: "400",
                                                    position: "relative",
                                                    top: "-9px",
                                                    fontSize: "10px",
                                                    right: "0",
                                                }}
                                            >
                            đ
                          </span>
                                        </label>
                                        <div className="paymented" style={{
                                            width: 100,
                                            display: "flex",
                                            flexDirection: "row"
                                        }}>
                                            {order.created_by === currentUser.username ? (
                                                <>
                                                    {item.bankingHistory.length>0 && item.bankingHistory[0].status==='PENDING' ? <div>
                                                            <button className={"btn btn-sm btn-success mb-1"}
                                                                    style={{minWidth: 90}}
                                                                    onClick={e => approvePaymentOrderDetail(item, true)}>{t("orderDetail.approve")}
                                                            </button>
                                                            <button className={"btn btn-sm btn-danger"}
                                                                    onClick={e => approvePaymentOrderDetail(item, false)}
                                                                    style={{minWidth: 90}}>{t("orderDetail.disapprove")}
                                                            </button>
                                                        </div> :
                                                        <div>
                                                            <input
                                                                type="checkbox"
                                                                id={item.id}
                                                                checked={item.paid}
                                                                disabled={
                                                                    item.status !== "ACTIVATED" ||
                                                                    order.status === "DONE"
                                                                        ? "disabled"
                                                                        : ""
                                                                }
                                                                onChange={(e) => changePayment(e, item)}
                                                            />
                                                            <label htmlFor={item.id}></label>
                                                        </div>
                                                    }

                                                </>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default verifyPermissionOrderer(OrderDetail);
