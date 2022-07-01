import React, { useEffect, useState } from "react";
import "./Notification.css";
import { useSelector } from "react-redux";
import {
  subscribeChannel,
  unsubscribeChannel,
  getNotificationsByUser,
  updateIsRead,
  deleteNotificationUser,
} from "../services/pusherNotification.service";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Loading from "./loading";
import {done_order} from '../done-order.png';
const Notification = () => {
  const [pusherChannel, setPusherChannel] = useState(null);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [countIsRead, setCountIsRead] = useState(0);
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(0);

  const LOADINGS = [
    null,
    t("board_admin.loading_users"),
    "Đang xóa thông báo!",
    t("board_admin.updating_user"),
  ];

  const handleClose = () => {
    notifications.forEach((element) => {
      element.is_read = true;
    });

    setCountIsRead(0);

    setShow(false);

    updateIsRead(notifications)
      .then((response) => {})
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    const channel = subscribeChannel();
    setPusherChannel(channel);

    return () => {
      unsubscribeChannel();
    };
  }, []);

  useEffect(() => {
    getNotificationsByUser()
      .then((response) => {
        setNotifications(response.data);
        let count = 0;
        response.data.forEach((element) => {
          if (!element.is_read) {
            count++;
          }
        });
        setCountIsRead(count);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {}, [countIsRead]);

  useEffect(() => {
    if (pusherChannel && pusherChannel.bind) {
      pusherChannel.unbind("NEW_NOTIFICATION");
      pusherChannel.bind("NEW_NOTIFICATION", (data) => {
        setNotifications((prevState) => [data, ...prevState]);
        let count = countIsRead;
        if (!data.is_read) {
          count++;
        }
        setCountIsRead((num) => num + count);
      });
    }
  }, [pusherChannel, notifications]);

  const deleteNotification = (notification) => {
    setLoading(2);
    deleteNotificationUser(notification).then((res) => {
      if (res.status === 200) {
        setLoading(0);
        Swal.fire({
          title: "Xóa thông báo thành công!",
          icon: "success",
        }).then(async (result) => {
          setNotifications((prevState) => {
            let now = prevState.filter((element) => {
              if (
                element.notification_user_id ===
                notification.notification_user_id
              ) {
                return false;
              }
              return true;
            });
            return now;
          });
        });
      }
    });
  };

  function displayMessage(notification) {
    if (notification.message === "DONE") {
      return (
        <>
          <img src={notification.photo} alt="" />
          <div className="notify-text">
            <span>
              {t("notification.the_order")} <b>{notification.product_name}</b>&nbsp; {t("notification.is_closed")}
            </span>
            <p className="mt-1 time-notify">
              {displayDateTime(notification.created_at)}
            </p>
          </div>
        </>
      );
    } else if (notification.message === "WARNING") {
      return (
        <>
          <img src={notification.photo} alt="" />
          <div className="notify-text">
            <span>
              {t("notification.the_order")} <b>{notification.product_name}</b>&nbsp; {t("notification.order_confirm")}
            </span>
            <p className="mt-1 time-notify">
              {displayDateTime(notification.created_at)}
            </p>
          </div>
        </>
      );
    } else {
      return (
        <>
          <img src={done_order} alt="" />
          <div className="notify-text">
            <span>
              {t("notification.order_store")} <b>{notification.store_name}</b>&nbsp; {t("notification.order_payment")}&nbsp;
              <b>
                {notification.total
                  ? Number(notification.total).toLocaleString("en-US")
                  : 0}
              </b>
                <span
                  style={{
                    fontWeight: "400",
                    position: "relative",
                    top: "-9px",
                    fontSize: "10px",
                    right: "0",
                  }}
                >
                  <b>đ</b>
                </span>
              
            </span>
            <p className="mt-1 time-notify">
              {displayDateTime(notification.created_at)}
            </p>
          </div>
        </>
      );
    }
  }

  let displayDateTime = (value) => {
    let text = value.trim().split("T");
    let time = text[1].split(".");
    return text[0] + " " + time[0];
  };

  return loading !== 0 ? (
    <Loading backdrop info={LOADINGS[loading]} />
  ) : (
    <div>
      <div
        className="bell-icon"
        tabIndex="0"
        variant="primary"
        onClick={() => setShow(true)}
        style={{ cursor: "pointer" }}
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="50px"
          height="30px"
          viewBox="0 0 50 30"
          enableBackground="new 0 0 50 30"
        >
          <g
            className={
              (countIsRead > 0 ? "bell-icon__group_animation " : "") +
              "bell-icon__group"
            }
          >
            <path
              className={
                (countIsRead > 0 ? "bell-icon__ball_animation " : "") +
                "bell-icon__ball"
              }
              id="ball"
              fillRule="evenodd"
              strokeWidth="1.5"
              clipRule="evenodd"
              fill="none"
              stroke="#currentColor"
              strokeMiterlimit="10"
              d="M28.7,25 c0,1.9-1.7,3.5-3.7,3.5s-3.7-1.6-3.7-3.5s1.7-3.5,3.7-3.5S28.7,23,28.7,25z"
            />
            <path
              className="bell-icon__shell"
              id="shell"
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#FFFFFF"
              stroke="#currentColor"
              strokeWidth="2"
              strokeMiterlimit="10"
              d="M35.9,21.8c-1.2-0.7-4.1-3-3.4-8.7c0.1-1,0.1-2.1,0-3.1h0c-0.3-4.1-3.9-7.2-8.1-6.9c-3.7,0.3-6.6,3.2-6.9,6.9h0 c-0.1,1-0.1,2.1,0,3.1c0.6,5.7-2.2,8-3.4,8.7c-0.4,0.2-0.6,0.6-0.6,1v1.8c0,0.2,0.2,0.4,0.4,0.4h22.2c0.2,0,0.4-0.2,0.4-0.4v-1.8 C36.5,22.4,36.3,22,35.9,21.8L35.9,21.8z"
            />
          </g>
        </svg>
        <div
          className="notification-amount"
          style={countIsRead == 0 ? { opacity: "0" } : {}}
        >
          <span>{countIsRead > 0 ? countIsRead : ""}</span>
        </div>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        animation={true}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <h3>Thông báo</h3>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {notifications.length > 0 &&
              notifications.map((notification) => {
                return (
                  <li
                    className="list-group-item d-flex justify-content-between align-items-baseline"
                    key={notification.notification_user_id}
                    style={
                      notification.is_read
                        ? { background: "lightblue" }
                        : { background: "bisque" }
                    }
                  >
                    <div className="notification" style={{ maxWidth: "700px" }}>
                      <div className="notify">
                        {displayMessage(notification)}
                      </div>
                    </div>

                    <i
                      className={
                        "fa fa-trash text-danger align-self-center"
                      }
                      aria-hidden="true"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        deleteNotification(notification);
                      }}
                    ></i>
                  </li>
                );
              })}

            {notifications.length == 0 && <h5>Bạn không có thông báo!</h5>}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              handleClose();
            }}
          >
            {t("user_management.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notification;
