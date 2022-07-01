import React, { useState, useEffect } from "react";

import OrderService from "../services/order.service";
import { Link, NavLink, Switch, Route, Router } from "react-router-dom";
import OrderDetail from "./orderer/OrderDetail";
import BillDetail from "./orderer/BillDetail";
import AddOrder from "./orderer/AddOrder";
import EventBus from "../common/EventBus";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import "./orderer/orderer.css";
import Loading from "./loading";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Pagination from "@material-ui/lab/Pagination";
import "../components/profile.css";
import verifyPermissionOrderer from "./verifyPermissionOrderer";

const BoardOrderer = () => {
  const [order, setOrder] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const history = useHistory();
  const [loading, setLoading] = useState(1);
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);


  const [loadingData, setLoadingData] = useState(1);
  const LOADINGS = [
    null,
    t("order.loading_data"),
    t("order.loading_deleting_to_cart"),
  ];
  useEffect(() => {
    reloadOrderData(page, true);
  }, [page]);

  function checkStatus(status) {
    if (status === "ACTIVATED") {
      return (
        <span className="badge badge-success" style={{ fontSize: "12px" }}>
          {t("board_admin.activate")}
        </span>
      );
    } else if (status === "DONE") {
      return (
        <span className="badge badge-primary" style={{ fontSize: "12px" }}>
          {t("board_admin.done")}
        </span>
      );
    } else if (status === "UNACTIVATED"){
      return (
        <span className="badge badge-secondary" style={{ fontSize: "12px" }}>
          {t("board_admin.unactivate")}
        </span>
      );
    } else {
      return (
        <span className="badge badge-danger" style={{ fontSize: "12px" }}>
          {t("board_admin.pending")}
        </span>
      );
    }
  }

  const handleChangePage = async (event, value) => {
    setPage(value);
  };

  const reloadOrderData = async (page, init = false) => {
    try {
      if (init) {
        setLoading(1);
      }
      setLoadingData(1);
      var roles = currentUser.roles;
      let response;
      if(roles.includes("ROLE_ADMIN")){
        response = await OrderService.getAllOrderData({
          page: (page-1),
          pageSize: 10,})
      } else {
        response = await OrderService.getAllOrderData({
          page: (page-1),
          pageSize: 10,
          searchData: `created_by=${currentUser.username}`,});
      }
      if (response.data) {
        setOrder(response.data);
        setTotal(response.pagination.total);
        setLoading(0);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        EventBus.dispatch("logout");
      }
      setLoading(0);
    } finally {
      setLoadingData(0);
    }
  };

  const deleteOrder = async (order) => {
    Swal.fire({
      title: t("restaurant.delete_order"),
      showCancelButton: true,
      confirmButtonText: t("restaurant.delete"),
      cancelButtonText: t("restaurant.cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        let res = await OrderService.deleteOrder([order]);
        setLoading(2);
        if (res.data.data === 1) {
          await reloadOrderData(page);
          Swal.fire(t("restaurant.deleted"), "", "success");
        }
      }
    });
  };

  const addOrder = () => {
    localStorage.setItem("url", JSON.stringify(""));
  };

  return loading !== 0 ? (
    <Loading backdrop info={LOADINGS[loading]} />
  ) : (
    <Router history={history}>
      {loadingData !== 0 && <Loading info={LOADINGS[loading]} />}
      <div className="container-orderer pt-3">
        <div className="row">
          <div className="col-3">
            <div className="menu-restaurant__category p-2 m-0 orderer-page">
              <div className="d-flex justify-content-between">
                <h5 className="title-list-order">
                  {t("order_management.order_list")}
                </h5>
                <Link to="/restaurant-management/orders/add">
                  <div
                    className="adding-cart"
                    data-mdb-toggle="tooltip"
                    title={t("board_admin.add")}
                    onClick={addOrder}
                  >
                    <div className="btn-adding">+</div>
                  </div>
                </Link>
              </div>
              <div className="list-category mb-3">
                {order &&
                  order.length > 0 &&
                  order.map((item, index) => (
                    <div className="item-category"
                      key={index}
                      style={{
                        borderBottom: "1px solid red",
                        paddingBottom: "10px",
                        paddingTop: "10px",
                      }}
                    >
                      {item.status !== "PENDINGPAYMENT" && item.status !== "ACTIVATED" ? (
                        <div
                          className="del-order"
                          data-mdb-toggle="tooltip"
                          title={t("board_admin.delete")}
                        >
                          <span
                            className="badge p-2 badge-action"
                            onClick={(e) => deleteOrder(item.id)}
                          >
                            <i className="fa-solid fa-trash-can text-danger"></i>
                          </span>
                        </div>
                      ) : (
                        ""
                      )}
                      <NavLink
                        to={`/restaurant-management/orders/id=${item.id}`}
                        className="list-order d-flex flex-column text-decoration-none" activeClassName="choiced"
                      >
                        <div
                          data-mdb-toggle="tooltip"
                          title={item.store.name}
                          style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            width: "230px",
                          }}
                        >
                          {item.store.name}
                        </div>
                        <div className="d-flex justify-content-between">
                          <span
                            style={{
                              color: "red",
                              fontSize: "12px",
                            }}
                          >
                            {item.time_remaining}
                          </span>
                        </div>
                        <div className="justify-content-between">
                          {checkStatus(item.status)}
                        </div>
                      </NavLink>
                    </div>
                  ))}
              </div>
              {order && order.length > 0 && (
                <Pagination
                  className="my-3"
                  size="small"
                  count={Math.ceil(total / 10)}
                  page={page}
                  siblingCount={1}
                  boundaryCount={1}
                  variant="outlined"
                  shape="rounded"
                  onChange={handleChangePage}
                />
              )}
            </div>
          </div>
          <div className="col-12 col-md-9">
            <Switch>
              <Route
                exact
                path="/restaurant-management/orders/id=:id"
                component={OrderDetail}
              />
              <Route
                exact
                path="/restaurant-management/orders/billDetail/:id"
                component={BillDetail}
              />
              <Route
                exact
                path="/restaurant-management/orders/add"
                component={AddOrder}
              />
              <Route
                exact
                path="/restaurant-management/orders/clone"
                component={AddOrder}
              />
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
};
export default verifyPermissionOrderer(BoardOrderer);
