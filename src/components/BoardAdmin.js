import React, { useState, useEffect, useRef } from "react";
import Pagination from "@material-ui/lab/Pagination";
import UserService from "../services/user.service";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Switch from "@material-ui/core/Switch";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import Swal from "sweetalert2";
import verifyPermissionAdmin from "./verifyPermissionAdmin";
import { useSelector } from "react-redux";
import Loading from "./loading";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfDay, endOfDay, isSameDay } from "date-fns";
import parse from "date-fns/parse";
import vi from "date-fns/locale/vi";
registerLocale("vi", vi);

const BoardAdmin = (props) => {
    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState("");
    const usersRef = useRef();
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const pageSizes = [5, 10, 15];
    const [show, setShow] = useState(false);
    const [userActive, setUserActive] = useState({});
    const { t } = useTranslation();
    const currentUser = useSelector((state) => state.auth.user);
    const handleClose = () => {
        setShow(false);
        setUserActive('');
        setStartDate(new Date());
    };
    const handleShow = () => setShow(true);
    const form = useRef();
    const checkBtn = useRef();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [checked, setChecked] = useState(false);

    usersRef.current = users;

    const LOADINGS = [
      null,
      t("board_admin.loading_users"),
      t("board_admin.deleting_user"),
      t("board_admin.updating_user"),
    ];
    const [loading, setLoading] = useState(1);

    const handleUpdate = (e) => {
        e.preventDefault();

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            setLoading(3);
            UserService.updateUserByAdmin(userActive.id, username, email, checked, checkRole(userActive.roles), fullName, password, startDate).then(
                (response) => {
                    setLoading(0);
                    Swal.fire(
                        t("register.done"),
                        t("board_admin.update_success"),
                        "success"
                    ).then(async (result) => {
                        setRefresh(true);
                    });
                },
                (error) => {
                    setLoading(0);
                    const message =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: message,
                    });
                }
            );
        }
    };

    const required = (value) => {
        if (!value) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t("register.error_required")}
                </div>
            );
        }
    };

    const validEmail = (value) => {
        if (!isEmail(value)) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t("register.error_email_valid")}
                </div>
            );
        }
    };

    const vusername = (value) => {
        if (value.length < 3 || value.length > 20) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t("register.error_username_length")}
                </div>
            );
        }

        var regExUsername = /^[0-9a-zA-Z_]+$/;
        if (!value.match(regExUsername)) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t("register.error_username_special_characters")}
                </div>
            );
        }
    };

    const vfullname = (value) => {
        if (value.length < 3 || value.length > 40) {
            return (
                <div className="alert alert-danger" role="alert">
                    {t("register.error_username_length")}
                </div>
            );
        }
    };

    const vpassword = (value) => {
        if (!value.length === 0) {
            if (value.length < 6 || value.length > 40) {
                return (
                    <div className="alert alert-danger" role="alert">
                        {t("register.error_password_length")}
                    </div>
                );
            }
        }
    };

    const onChangeUsername = (e) => {
        const username = e.target.value;
        setUsername(username);
    };

    const onChangeEmail = (e) => {
        const email = e.target.value;
        setEmail(email);
    };

    const onChangeFullName = (e) => {
        const fullName = e.target.value;
        setFullName(fullName);
    };

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };

    const handleChange = (e) => {
        setChecked(e.target.checked);
    };

    function checkRole(roles) {
        if (!Array.isArray(roles)) {
            return null;
        } else {
            var arrRole = [];
            roles.forEach((role) => {
                arrRole.push(role.name);
            });
            if (arrRole.includes("ROLE_ADMIN")) {
                return "ADMIN";
            } else if (arrRole.includes("ROLE_ORDERER")) {
                return "ORDERER";
            } else {
                return "USER";
            }
        }
    }

    useEffect(() => {
        if (refresh) {
            window.location.reload();
        }
    }, [refresh]);

    useEffect(() => {
        setUsername(userActive.username ? userActive.username : "");
        setEmail(userActive.email ? userActive.email : "");
        setFullName(userActive.fullName ? userActive.fullName : "");
        setPassword("");
        if (userActive.roles) {
            if (checkRole(userActive.roles) === "USER") {
              setChecked(false);
            } else {
              setChecked(true);
            }
        }
        if (userActive.time_remaining) {
            setStartDate(
                parse(userActive.time_remaining, "dd/MM/yyyy HH:mm:ss", new Date())
            );
        }
    }, [userActive]);

    const onChangeSearchUser = (e) => {
        const searchUser = e.target.value;
        setSearchUser(searchUser);
    };

    const retrieveUsers = () => {
        UserService.getAdminBoard(page - 1, pageSize, searchUser)
            .then((response) => {
                setUsers(response.data.users);
                setCount(response.data.totalPages);
                setLoading(0);
            })
            .catch((e) => {
                console.log(e);
                setLoading(0);
            });
    };

    useEffect(retrieveUsers, [page, pageSize]);

    const findByTitle = () => {
        setLoading(1);
        setPage(1);
        retrieveUsers();
    };

    const deleteUser = (userId) => {
        Swal.fire({
            title: t("board_admin.confirm_delete"),
            icon: "warning",
            showConfirmButton: true,
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(2);
                try {
                    let res = await UserService.deleteUsers([userId]);
                    if (res.status === 200) {
                        setLoading(0);
                        Swal.fire({
                            title: t("board_admin.delete_success"),
                            icon: "success",
                        }).then(async (result) => {
                            setRefresh(true);
                        });
                        retrieveUsers();
                    }
                } catch (e) {
                    setLoading(0)
                    Swal.fire({
                      title: t("board_admin.delete_failed"),
                      icon: "error",
                    });
                }
            }
        })
    };

    const handlePageChange = (event, value) => {
        if (value !== page) {
            setLoading(1);
            setPage(value);
        }
    };

    const handlePageSizeChange = (event) => {
        setLoading(1);
        setPageSize(event.target.value);
        setPage(1);
    };

    function showRole(roles) {
        if (!Array.isArray(roles)) {
            return <span>Không tìm thấy quyền</span>;
        } else {
            var arrRole = [];
            roles.forEach((role) => {
                arrRole.push(role.name);
            });
            if (arrRole.includes("ROLE_ADMIN")) {
                return <span>ADMIN</span>;
            } else if (arrRole.includes("ROLE_ORDERER")) {
                return <span>ORDERER</span>;
            } else {
                return <span>USER</span>;
            }
        }
    }

    return loading !== 0 ? (
        <Loading backdrop info={LOADINGS[loading]} />
    ) : (
        <div className="container pt-4">
            <div className="row flex-column bg-white">
                <div className="col-md-8 mt-4">
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder={t("user_management.search_key")}
                            style={{ maxWidth: "300px" }}
                            value={searchUser}
                            onChange={onChangeSearchUser}
                        />
                        <div className="input-group-append">
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={findByTitle}
                            >
                                {t("user_management.search")}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-12">
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
                                {t("user_management.update_user")}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleUpdate} ref={form}>
                                <div className="w-75 ml-auto mr-auto">
                                    <div className="form-group">
                                        <label htmlFor="username">{t("register.username")}</label>
                                        <Input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={username}
                                            onChange={onChangeUsername}
                                            validations={[required, vusername]}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">{t("register.email")}</label>
                                        <Input
                                            type="text"
                                            className="form-control"
                                            name="email"
                                            value={email}
                                            onChange={onChangeEmail}
                                            validations={[required, validEmail]}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="fullName">
                                            {t("register.full_name")}
                                        </label>
                                        <Input
                                            type="text"
                                            className="form-control"
                                            name="fullName"
                                            value={fullName}
                                            onChange={onChangeFullName}
                                            validations={[required, vfullname]}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="isOrderer">
                                            {t("user_management.role_orderer")}
                                        </label>
                                        {checkRole(userActive.roles) === "ADMIN" && (
                                            <Switch disabled name="isOrderer" checked={checked} />
                                        )}

                                        {checkRole(userActive.roles) === "ORDERER" && (
                                            <Switch
                                                onChange={handleChange}
                                                name="isOrderer"
                                                checked={checked}
                                            />
                                        )}

                                        {checkRole(userActive.roles) === "USER" && (
                                            <Switch
                                                onChange={handleChange}
                                                name="isOrderer"
                                                checked={checked}
                                            />
                                        )}
                                    </div>

                                    {checkRole(userActive.roles) !== "ADMIN" && checked && (
                                        <DatePicker
                                            className="setDatetime"
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            locale="vi"
                                            showTimeSelect
                                            dateFormat="dd/MM/yyyy HH:mm"
                                            timeIntervals={5}
                                            minDate={new Date()}
                                            minTime={
                                                isSameDay(new Date(), startDate)
                                                    ? new Date()
                                                    : startOfDay(startDate)
                                            }
                                            maxTime={endOfDay(startDate)}
                                        />
                                    )}
                                    <div className="form-group">
                                        <label htmlFor="password">{t("register.password")}</label>
                                        <Input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={password}
                                            onChange={onChangePassword}
                                            validations={[vpassword]}
                                        />
                                    </div>

                                    <div className="form-group mt-3">
                                        <button className="btn btn-primary btn-block ml-0">
                                            {t("restaurant.update")}
                                        </button>
                                    </div>

                                    <CheckButton style={{ display: "none" }} ref={checkBtn} />
                                </div>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => {
                                handleClose();
                            }}
                            >
                                {t("user_management.close")}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" style={{ width: "5%" }}>
                                    #
                                </th>
                                <th scope="col" style={{ width: "25%" }}>
                                    {t("register.username")}
                                </th>
                                <th scope="col" style={{ width: "25%" }}>
                                    {t("register.email")}
                                </th>
                                <th scope="col" style={{ width: "20%" }}>
                                    {t("register.full_name")}
                                </th>
                                <th scope="col" style={{ width: "12%" }}>
                                    {t("user_management.role")}
                                </th>
                                <th scope="col" style={{ width: "13%" }}>
                                    {t("user_management.action")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, key) => (
                                <tr key={key}>
                                    <th className="align-middle" scope="row">
                                        {user.id}
                                    </th>
                                    <td className="align-middle">{user.username}</td>
                                    <td className="align-middle">{user.email}</td>
                                    <td className="align-middle">{user.fullName}</td>
                                    <td className="align-middle">{showRole(user.roles)}</td>
                                    <td className="align-middle">
                                        <span
                                            onClick={() => {
                                                handleShow();
                                                setUserActive(user);
                                            }}
                                            className="text-warning mr-3"
                                            data-toggle="tooltip"
                                            data-placement="top"
                                            title={t("user_management.update_tooltip")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <i className="far fa-edit action p-2 bg-secondary"></i>
                                        </span>

                                        {user.username !== currentUser.username && (
                                            <span
                                                onClick={() => deleteUser(user.id)}
                                                className="text-danger"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                title={t("user_management.delete_tooltip")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <i className="fas fa-trash action p-2 bg-info"></i>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-3">
                        {t("user_management.item_per_page")} &nbsp;&nbsp;
                        <select
                            onChange={handlePageSizeChange}
                            value={pageSize}
                            className="custom-select d-inline-block"
                            style={{ maxWidth: "60px" }}
                        >
                            {pageSizes.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <Pagination
                            className="my-3"
                            count={count}
                            page={page}
                            siblingCount={1}
                            boundaryCount={1}
                            variant="outlined"
                            shape="rounded"
                            onChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default verifyPermissionAdmin(BoardAdmin);