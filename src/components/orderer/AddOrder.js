import React, { useState, useRef, useEffect } from "react";
import OrderService from "../../services/order.service";
import "./orderer.css";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfDay, endOfDay, isSameDay } from "date-fns";
import vi from "date-fns/locale/vi";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
registerLocale("vi", vi);

const AddOrder = () => {
  var currentDate = new Date();
  const [timeRemain, setTimeRemain] = useState(currentDate.setMinutes(currentDate.getMinutes() + 30));
  const [urlStore, setUrlStore] = useState("");
  const [status, setStatus] = useState("ACTIVATED");
  const [loading, setLoading] = useState(false);
  const form = useRef();
  const checkBtn = useRef();
  const url = JSON.parse(localStorage.getItem("url"));
  const history = useHistory();
  const { user: currentUser } = useSelector((state) => state.auth);
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

  useEffect(() => {
    if(url !== null){
      setUrlStore(url);
      localStorage.removeItem("url");
    } 
    return () => {
      localStorage.removeItem("url");
    }
  }, [url]);

  const onChangeUrlStore = (e) => {
    setUrlStore(e.target.value);
  };

  const onChangeStatus = (e) => {
    setStatus(e.target.value);
  };

  const cleardata = () => {
    setUrlStore("");
  };

  const handleChangeDate = (date) => {
    setTimeRemain(date);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      OrderService.getStore(urlStore)
        .then((response) => {
          const store = {
            id: response.id,
            name: response.name,
          };
          OrderService.createOrder(status, store, timeRemain).then(
            (response) => {
              if (response.data) {
                Swal.fire("Done!", "Create order success", "success").then(
                  async (result) => {
                    history.push("/orders");
                  }
                );
              }
            }
          );
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Please enter url Store valid!",
          }).then(async (result) => {
            if (result.isConfirmed) {
              setUrlStore("");
              setLoading(false);
            }
          });
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="layout">
        <Form onSubmit={handleSubmit} ref={form}>
          <div className="profile">
            <div className="profile__picture">
              <img
                src="https://1.bp.blogspot.com/-MCwQd9pDnN4/Yef7-P9o_LI/AAAAAAAACWU/OeEZ_Okmi6kT4q7vjd_T7otd3tdnNMokwCNcBGAsYHQ/s1600/huyhoangit.jpg"
                alt="ananddavis"
              />
            </div>
            {currentUser && (
              <>
                <div className="order__header">
                  <div className="order__account">
                    <h4 className="order__username">{currentUser.username}</h4>
                  </div>
                </div>
                <div className="order-info-line">
                  <i className="order__icon fa-solid fa-envelope"></i>
                  {currentUser.email}
                </div>
              </>
            )}
            <div className="order-info-line">
              <div className="order-status">
                <i className="order__icon fa-solid fa-cart-arrow-down"></i>
                <select
                  className="custom-select select-status"
                  name="status"
                  onChange={onChangeStatus}
                >
                  <option value="ACTIVATED">ACTIVATED</option>
                  <option value="UNACTIVATED">UNACTIVATED</option>
                </select>
              </div>
              <div className="order-status order-status-left">
                <i className="order__icon fa-solid fa-stopwatch"></i>
                <DatePicker
                  className="setDatetime"
                  selected={timeRemain}
                  dateFormat="dd/MM/yyyy HH:mm"
                  onChange={handleChangeDate}
                  showTimeSelect
                  minDate={new Date()}
                  timeIntervals={15}
                  locale="vi"
                  minTime={
                    isSameDay(currentDate, timeRemain)
                      ? currentDate
                      : startOfDay(timeRemain)
                  }
                  maxTime={endOfDay(timeRemain)}
                  onKeyDown={(e) => {
                    e.preventDefault();
                  }}
                />
              </div>
            </div>
            <div className="order-info-line">
              <i className="order__icon fa-solid fas fa-store"></i>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon3">
                  https://shopeefood.vn/...
                </span>
              </div>
              <Input
                type="text"
                className="form-control url-store"
                id="urlStore"
                name="urlStore"
                value={urlStore}
                aria-describedby="basic-addon3"
                validations={[required]}
                onChange={onChangeUrlStore}
              />
            </div>
            <div className="group-button-order">
              <button className="btn btn-primary btn-order" disabled={loading}>
                {loading && (
                  <span>
                    <span className="spinner-border spinner-border-sm"></span>
                    &nbsp;&nbsp;
                  </span>
                )}
                <span>CREATE ORDER</span>
              </button>
              <button
                className="btn btn-secondary btn-order"
                type="button"
                onClick={cleardata}
              >
                <span>CLEAR</span>
              </button>
              <CheckButton style={{ display: "none" }} ref={checkBtn} />
            </div>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddOrder;
