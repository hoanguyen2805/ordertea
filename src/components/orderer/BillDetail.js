import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { NavLink } from "react-router-dom";
import OrderService from "../../services/order.service";
import "./orderer.css";
import EventBus from "../../common/EventBus";
import Button from "react-bootstrap/Button";
import Loading from "../loading";
import verifyPermissionOrderer from "../verifyPermissionOrderer";
import { useTranslation } from "react-i18next";
const LOADINGS = [
  null,
  "ĐANG TẢI DỮ LIỆU",
  "ĐANG THÊM VÀO GIỎ HÀNG",
  "ĐANG CẬP NHẬT ĐƠN HÀNG",
  "ĐANG SAO CHÉP ĐƠN HÀNG",
  "ĐANG XÓA ĐƠN HÀNG",
  "ĐANG ĐẶT",
];
const BillDetail = () => {
  const [billdetail, setBillDetail] = useState({});
  const { id } = useParams();
  const [loading, setLoading] = useState(1);
  const { t } = useTranslation();
  useEffect(() => {
    OrderService.getBillDetail(id).then(
      (response) => {
        setBillDetail(response.data);
        setLoading(0);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
        setBillDetail(_content);
        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
        setLoading(0);
      }
    );
    //
  }, [id]);

  function checkStatus(status) {
    if (status === "ACTIVATED") {
      return (
        <span
          className="badge badge-success ml-1 mt-1 change-status"
          style={{ fontSize: "12px" }}
        >
          {t("board_admin.activate")}
        </span>
      );
    } else if (status === "DONE") {
      return (
        <span
          className="badge badge-primary ml-1 mt-1 change-status"
          style={{ fontSize: "12px" }}
        >
          {t("board_admin.done")}
        </span>
      );
    } else if (status === "UNACTIVATED") {
      return (
        <span
          className="badge badge-secondary ml-1 mt-1 change-status"
          style={{ fontSize: "12px" }}
        >
          {t("board_admin.unactivate")}
        </span>
      );
    } else {
      return (
        <span
          className="badge badge-danger ml-1 mt-1 change-status"
          style={{ fontSize: "12px" }}
        >
          {t("board_admin.pending")}
        </span>
      );
    }
  }

  return loading !== 0 ? (
    <Loading backdrop info={LOADINGS[loading]} />
  ) : (
    <div className="orderer-content">
      {billdetail && (
        <>
          <div className="row justify-content-between">
            <div className="title-content">
              <h3>{billdetail?.store}</h3>
              <p><b>{t("board_admin.address")} :</b> {billdetail?.address}</p>
              <p><b>{t("board_admin.create_at")} :</b> {billdetail?.createdAt}</p>
              <p><b>{t("board_admin.create_by")} :</b> {billdetail?.createdBy}</p>
              <div className="header-line align-items-baseline">
                <p><b>{t("profile.status")} :</b> </p>
                {checkStatus(billdetail?.status)}
              </div>
            </div>
            <div className="head-control text-right mr-2">
              <NavLink to={`/restaurant-management/orders/id=${billdetail.id}`}>
                <Button className="btn btn-primary">
                  <i className="fa-solid fa-hand-point-left"></i>{t("board_admin.back")}
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="row mt-3">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="image-pro"></th>
                  <th className="name-pro"></th>
                  <th className="des">{t("restaurant.note_order")}</th>
                  <th className="quantity-bill">{t("profile.quantity")}</th>
                  <th className="total">{t("board_admin.total")}</th>
                </tr>
              </thead>
              <tbody>
                {billdetail.totalProduct?.length > 0 &&
                  billdetail.totalProduct.map(
                    (orderProduct, index) =>
                      orderProduct.product && (
                        <tr key={index}>
                          <th className="image-pro align-middle">
                            <img src={orderProduct.photo} alt="" />
                          </th>
                          <td className="name-pro align-middle">
                            {orderProduct.product}
                          </td>
                          <td className="note align-middle">
                            {displayDescription(orderProduct.description)}
                          </td>
                          <td className="quantity-bill align-middle">
                            {orderProduct.quantity}
                          </td>
                          <td className="total-value align-middle">
                            {Number(orderProduct.total).toLocaleString("en-US")}
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
                          </td>
                        </tr>
                      )
                  )}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="row">
        <div className="total-all ml-0 justify-content-between">
          <p className="ml-3">{t("board_admin.total")}:</p>
          <p className="mr-3">
            {billdetail.totalAll
              ? Number(billdetail.totalAll).toLocaleString("en-US")
              : 0}
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
          </p>
        </div>
      </div>
    </div>
  );
};

let displayDescription = (value) => {
  let text = value
    .trim()
    .split(";")
    .map(
      (str, index) =>
        !str.trim().endsWith("-") && (
          <p key={index}>
            {index + 1}. {str}
          </p>
        )
    );

  return text;
};

export default verifyPermissionOrderer(BillDetail);
