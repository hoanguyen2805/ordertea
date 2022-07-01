import React, { useState, useRef, useEffect } from "react";
import Form from "react-validation/build/form";
import OrderService from "../../services/order.service.js";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CheckButton from "react-validation/build/button";

import { startOfDay, endOfDay, isSameDay } from "date-fns";
import parse from "date-fns/parse";
import { useTranslation } from "react-i18next";

import vi from "date-fns/locale/vi";
registerLocale("vi", vi);

const Modal = ({ hide, stt, id, order, time_remaining }) => {
  const currentDate = new Date();
  const [status, setStatus] = useState(stt);
  const [timeRemain, setTimeRemain] = useState(
    parse(time_remaining, "dd/MM/yyyy HH:mm:ss", new Date())
  );
  const form = useRef();
  const checkBtn = useRef();
  const [loading, setLoading] = useState(false);
  const [checkPay, setCheckPay] = useState(true);
  const { t } = useTranslation();
  const onChangeStatus = (e) => {
    setStatus(e.target.value);
  };

  const handleChangeDate = (date) => {
    setTimeRemain(date);
  };
  const handleSubmit = (e) => {
    setLoading(true);
    if (checkBtn.current.context._errors.length === 0) {
      e.preventDefault();
      OrderService.updOrder(id, status, timeRemain, order).then(() => {
        window.location.reload();
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    setCheckPay(checkPaymentAll(order));
  }, []);

  const checkPaymentAll = (order) => {
    var checkPay = true;
    order.orderDetailList.map((element) => {
      if (!element.paid) {
        checkPay = false;
        return;
      }
    });
    return checkPay;
  };

  return (
    <Form onSubmit={handleSubmit} ref={form}>
      <div className="modal-overlay" />
      <div
        className="modal-wrapper change-status-time"
        aria-modal
        aria-hidden
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal modal-ordererboard ">
          <div className="modal-header">
            <div
              className="modal-title"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                fontSize: "20px",
                color: "#465bc5",
              }}
            >
              {t("restaurant.edit_order")}
            </div>
            <button
              type="button"
              className="modal-close-button"
              data-dismiss="modal"
              aria-label="Close"
              onClick={hide}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-status-content modal-body">
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
            &nbsp;&nbsp;
            <i className="order__icon fa-solid fa-arrows-rotate"></i>
            {checkPay === false ? (
              <select
                className="custom-select"
                name="status"
                value={status}
                onChange={onChangeStatus}
              >
                <option value="ACTIVATED">{t("board_admin.activate")}</option>
                <option value="UNACTIVATED">{t("board_admin.unactivate")}</option>
                <option value="PENDINGPAYMENT">{t("board_admin.pending")}</option>
                <option value="DONE">{t("board_admin.done")}</option>
              </select>
            ) : (
              <select
                className="custom-select"
                name="status"
                value={status}
                onChange={onChangeStatus}
              >
                <option value="ACTIVATED">{t("board_admin.activate")}</option>
                <option value="UNACTIVATED">{t("board_admin.unactivate")}</option>
                <option value="DONE">{t("board_admin.done")}</option>
              </select>
            )}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-success btn-change-status"
              disabled={loading}
              type="submit"
            >
              {loading && (
                <span>
                  <span className="spinner-border spinner-border-sm"></span>
                  &nbsp;&nbsp;
                </span>
              )}
              <span>{t("board_admin.save")}</span>
            </button>
            <CheckButton style={{ display: "none" }} ref={checkBtn} />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default Modal;
