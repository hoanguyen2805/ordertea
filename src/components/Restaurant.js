import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import RestaurantService from "../services/restaurant.service";
import "./Restaurant.css";
import OrderDetailService from '../services/order-details.service'
import Swal from "sweetalert2";
import parse from 'date-fns/parse'
import {useTranslation} from "react-i18next";
import Loading from "./loading";
import {subscribeChannel, unsubscribeChannel} from "../services/pusher.service";

const Restaurant = () => {
    const [pusherChannel, setPusherChannel] = useState(null);
    const [content, setContent] = useState({});
    const [isLoading, setIsLoading] = useState(1);
    const [order, setOrder] = useState(null);
    const [menu, setMenu] = useState([]);
    const [followCategoryId, setFollowCategoryId] = useState(menu.length > 0 ? menu[0].dish_type_id : 0);
    const {id} = useParams();
    let countDownInterval = null;
    const user = JSON.parse(localStorage.getItem("user"));
    const [canOrder, setCanOrder] = useState(false);
    const {t} = useTranslation();
    const LOADINGS = [
        null,
        t("restaurant.loading_data"),
        t("restaurant.loading_adding_to_cart"),
        t("restaurant.loading_editing_to_cart"),
        t("restaurant.loading_copying_to_cart"),
        t("restaurant.loading_deleting_to_cart"),
        t("restaurant.loading_ordering"),
    ]

    let orderedList = [];
    let orderingList = [];
    let mycarts = [];
    let sec, min, hour, day;


    if (order && order.orderDetailList) {
        orderedList = order?.orderDetailList.filter(ob => ob.status === "ACTIVATED");
        if (user !== null) {
            orderingList = order?.orderDetailList.filter(ob => ob.status === "UNACTIVATED" && ob.user.id !== user.id);
            mycarts = order?.orderDetailList.filter(ob => ob.status === "UNACTIVATED" && ob.created_by === user.username);
        } else {
            orderingList = order?.orderDetailList.filter(ob => ob.status === "UNACTIVATED");
            mycarts = [];
        }
    }

    orderedList.sort((o1, o2) => o1.created_by.localeCompare(o2.created_by))
    orderingList.sort((o1, o2) => o1.created_by.localeCompare(o2.created_by))
    mycarts.sort((o1, o2) => o1.product.name.localeCompare(o2.product.name))

    function inOrderList(product, list) {
        if (user !== null) {
            return list.find(
                (ob) => ob.created_by === user.username && product.id === ob.product.id
            );
        } else {
            return false;
        }
    }

    const refreshData = (data) => {
        const od = JSON.parse(data.msg);
        if (!order) return;
        switch (data.eventName) {
            case 'ADD_ORDER': {
                let list = order.orderDetailList;
                list.push(od);
                setOrder({...order, orderDetailList: list})
                break;
            }
            case 'EDIT_ORDER': {
                let list = order.orderDetailList;
                list = list.map(ob => {
                    if (ob.id === od.id) {
                        ob = {...od}
                    }
                    return ob
                })
                setOrder({...order, orderDetailList: list})
                break;
            }
            case 'EDIT_ORDERS': {
                let list = order.orderDetailList;
                list = list.map(ob => {
                    let temp = od.find(o1=>o1.id===ob.id);
                    if(temp){
                        return temp;
                    }else{
                        return ob;
                    }
                })
                setOrder({...order, orderDetailList: list})
                break;
            }
            case 'REMOVE_ORDER': {

                let list = order.orderDetailList;
                list = list.filter(ob =>!od.includes(ob.id));
                setOrder({...order, orderDetailList: list})
                break;
            }
        }

    }


    useEffect(() => {
        const channel = subscribeChannel();
        setPusherChannel(channel);

        return (() => {
            unsubscribeChannel()
        })
    }, [])


    useEffect(() => {
        if (pusherChannel && pusherChannel.bind) {
            pusherChannel.unbind("ORDERS/" + id);
            pusherChannel.bind("ORDERS/" + id, (data) => {
                if (user) {
                    if (data.username !== user.username) {
                        refreshData(data);
                    }
                } else {
                    refreshData(data);
                }
            });
        }
    }, [pusherChannel, order]);


    useEffect(() => {

        RestaurantService.getRestaurant(id).then(
            (response) => {
                setContent(response.data.data.store);
                setMenu(response.data.data.store.menu_infos);
                setOrder(response.data.data);
                // setTimeCountDown();
                setIsLoading(0)
                countDownInterval = countDownTime(parse(response.data.data.time_remaining, 'dd/MM/yyyy HH:mm:ss', new Date()));
            },
            (error) => {

                setIsLoading(0)
                const _content =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString();
                setContent(_content);
            }
        );

        return (() => {
                clearInterval(countDownInterval)
                // unsubscribeChannel();
            }
        )
    }, [])


    useEffect(() => {
        if (order) {
            const remainingTime = parse(order.time_remaining, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime();
            if (new Date().getTime() > remainingTime) {
                setCanOrder(false)
            } else {
                setCanOrder(order.status === "ACTIVATED");
            }
        }

    }, [order])


    async function reloadOrderData() {
        try {
            let res = await RestaurantService.getRestaurant(id);
            if (res.status === 200 && res.data.data) {
                setOrder(res.data.data);
                setMenu(res.data.data.store.menu_infos);
                setIsLoading(0);

            }
        } catch (e) {
            setIsLoading(0);
        }

    }


    async function ordered(mycarts) {
        mycarts = mycarts.map(ob => ({...ob, order: ob.orderDTO, status: 'ACTIVATED'}));
        try {
            setIsLoading(6)
            let res = await OrderDetailService.updateAllOrderDetail(mycarts);
            if (res.status === 200 && res.data.data) {
                Swal.fire(t("restaurant.ordered"), '', 'success');
                await reloadOrderData();
            } else {
                setIsLoading(0)
            }
        } catch (e) {
            setIsLoading(0)
            Swal.fire('Ordered!', '', 'error');
        }
    }


    function countDownTime(date) {
        try {
            const secEl = document.getElementById("sec");
            const minEl = document.getElementById("min");
            const hourEl = document.getElementById("hour");
            const dayEl = document.getElementById("day");
            // Update the count down every 1 second
            const x = setInterval(() => {
                let countDownDate = date.getTime();
                // Get today's date and time
                // let now = new Date().getTime();
                let now = new Date().getTime();

                // Find the distance between now and the count down date
                let distance = countDownDate - now;

                // Time calculations for days, hours, minutes and seconds
                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                secEl.innerText = (seconds.toString().length === 1 ? `0${seconds}` : seconds);
                minEl.innerText = (minutes.toString().length === 1 ? `0${minutes}` : minutes);
                hourEl.innerText = (hours.toString().length === 1 ? `0${hours}` : hours);
                dayEl.innerText = (days.toString().length === 1 ? `0${days}` : days);

                // Output the result in an element with id="demo"
                if (distance < 0) {
                    secEl.innerText = "00";
                    minEl.innerText = "00";
                    hourEl.innerText = "00";
                    dayEl.innerText = "00";
                    Swal.fire(t("restaurant.order_expired"), "", "info");
                    if (order && order.status === "ACTIVATED") {
                        //request change status
                    }
                    setCanOrder(false)
                    clearInterval(x);
                }

            }, 1000);

            return x;
        } catch (e) {

        }

    }


    async function addCart(product) {

        const user = JSON.parse(localStorage.getItem("user"));
        if (user !== null) {
            setIsLoading(2);
            let orderDetail = {
                user: {
                    id: user.id
                },
                product: product
                ,
                order: {
                    id: parseInt(id)
                },
                quantity: 1,
                status: "UNACTIVATED"
            }

            try {

                let res = await OrderDetailService.addSingleOrderDetail(orderDetail);
                if (res.status === 200 && res.data.data) {
                    Swal.fire(t("restaurant.add_success"), '', 'success')
                    await reloadOrderData();
                }
            } catch (e) {
                setIsLoading(0);
            }

        } else {
            Swal.fire(t("restaurant.login"), '', 'error')
        }

    }

    const deleteOrderDetail = async (order) => {

        Swal.fire({
            title: t("restaurant.delete_order"),
            showCancelButton: true,
            confirmButtonText: t("restaurant.delete"),
            cancelButtonText: t("restaurant.cancel"),
        }).then(async (result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                setIsLoading(5);
                try {
                    let res = await OrderDetailService.deleteOrderDetails([order])
                    if (res.status === 200 && res.data.data === 1) {
                        Swal.fire(t("restaurant.deleted"), '', 'success');
                        await reloadOrderData();
                    }
                } catch (e) {
                    setIsLoading(0)
                }

            }

        })

    }


    function scrollToLink(id) {
        try {
            document.querySelector(`#${id}`).scrollIntoView({
                behavior: 'smooth'
            });
            setFollowCategoryId(id);
        } catch (e) {

        }

    }

    const scrollTop = () => {
        try {
            document.querySelector(`#div-scrolltop`).scrollIntoView({
                behavior: 'smooth'
            });
        } catch (e) {

        }
    }

    const items = [];
    const menus = [];
    for (const category of menu) {
        items.push(
            <div key={items.length} className="menu-group">
                <div
                    className={`title-menu `}
                    id={`link-${category.dish_type_id}`}>{category.dish_type_name}</div>
            </div>
        );
        menus.push(
            <div className="item" key={menus.length}>
                <a
                    href={`#link-${category.dish_type_id}`}
                    className={`nav-link item-link ${followCategoryId === 'link-' + category.dish_type_id ? 'follow-category' : ''}`}
                    style={{
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        display: 'block'
                    }}>{category.dish_type_name}</a>
            </div>
        );
        for (const product of category.dishes) {
            //
            if (product.is_available) {
                for (const photo of product.photos) {
                    items.push(
                        <div key={items.length} className="product-restaurant-row"
                             style={{background: inOrderList(product, orderedList) ? 'lightyellow' : 'none'}}>
                            <div className="row">
                                <div className="product-restaurant__img">
                                    <img src={photo.value} alt="" width="60" height="60"/>
                                </div>
                                <div className="product-restaurant__info">
                                    <h2 className="product-restaurant-name">
                                        {product.name}
                                        <br/>
                                        {product.total_like != "0" &&
                                        <span className="badge badge-primary">{product.total_like} like</span>
                                        }
                                    </h2>
                                    {inOrderList(product, orderedList) &&
                                    <span className={"badge badge-danger"}
                                          style={{fontSize: "12px"}}>{t("restaurant.ordered")}</span>}
                                    <div className="product-restaurant-desc">
                                        {product.description}
                                    </div>
                                </div>
                                <div className="product-restaurant__more">
                                    <div className="row">
                                        <div className="product-price">
                                            <div
                                                className={
                                                    product.discount_price != null
                                                        ? "old-price"
                                                        : "current-price"
                                                }
                                            >
                                                {Number(product.price.value).toLocaleString("en-US")}
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
                                            </div>

                                            {product.discount_price != null && (
                                                <div className="current-price">
                                                    {Number(product.discount_price.value).toLocaleString(
                                                        "en-US"
                                                    )}
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
                                                </div>
                                            )}
                                        </div>
                                        {order && canOrder && <div className="adding-cart">

                                            {!inOrderList(product, orderedList) ?
                                                <div className="btn-adding" data-toggle="tooltip" data-placement="right"
                                                     title={t("restaurant.add_to_cart")}
                                                     onClick={() => addCart(product)}> + </div> :
                                                <div className="btn-adding bg-secondary"
                                                     onClick={() => Swal.fire('', t("restaurant.use_edit_function_msg"), 'warning')}
                                                >
                                                    +
                                                </div>}

                                        </div>}

                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                    break;
                }
            }

            //
            //
        }
    }


    const cloneOrderDetail = async (order) => {
        if (inOrderList(order.product, orderedList)) {
            Swal.fire('', t("restaurant.use_edit_function_msg"), 'warning')
        } else {
            if (user !== null) {
                try {
                    const quantity = order.quantity;
                    Swal.fire({
                        title:
                            `<label style="font-size: 25px; margin-top: 0">${t("restaurant.copy_order")}</label>`,
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
                            <span class="input-group-prepend mr-0">
                                <button onclick="
                                    javascript:{const el = document.getElementById('quantity-value');
                                    el.innerText = parseInt(el.innerText) - 1>1?parseInt(el.innerText)-1:1;
                                    }"
                                    class="ml-0 btn btn-danger rounded-0"
                                >
                                    <i class="fa fa-minus"></i>
                                </button>
                            </span>
                            <span id="quantity-value" class="rounded-0 form-control input-number d-inline-block text-center hide-arrow" style="width: 45px">${quantity}</span>
                            <span class="input-group-prepend">
                                <button onclick="javascript:{
                                    const el = document.getElementById('quantity-value');
                                    el.innerText = parseInt(el.innerText) + 1<=20?parseInt(el.innerText)+1:20;
                                    }"
                                    class="btn btn-success rounded-0"
                                >
                                    <i class="fa fa-plus"></i>
                                </button>
                            </span>
                        </div>
                        </div>
                        <div className="description-container" style="margin-top: 15px">
                            <textarea class="form-control" id="description-value" rows="3" placeholder="${t("restaurant.note_order")}" type="text">${order.description || ""}</textarea>     
                        </div>  
                    </div>
                </div>
            `,
                        showCancelButton: true,
                        cancelButtonText: t("restaurant.cancel"),
                        confirmButtonText: "OK",
                    }).then(async (result) => {

                        if (result.isConfirmed) {
                            setIsLoading(4);
                            const value = document.getElementById("quantity-value").innerText;
                            const description =
                                document.getElementById("description-value").value;
                            try {
                                let res = await OrderDetailService.addSingleOrderDetail({
                                    ...order,
                                    quantity: value,
                                    description: description,
                                    order: {...order.orderDTO},
                                    user: {id: user.id},
                                    id: 0,
                                    status: "UNACTIVATED",
                                });

                                if (res.status === 200 && res.data.data) {
                                    await reloadOrderData();
                                    Swal.fire(t("restaurant.copy"), "", "success");

                                } else {
                                    setIsLoading(0)
                                }
                            } catch (e) {
                                setIsLoading(0)
                                Swal.fire(t("restaurant.error_save"), "", "info");
                            }

                        }
                    });

                } catch (e) {
                    setIsLoading(0)
                    console.log(e);
                }
            } else {
                Swal.fire(t("restaurant.login"), "", "error");
            }
        }
    }


    const updateOrderDetails = async (order) => {

        const quantity = order.quantity;
        Swal.fire({
            title:
                `<label style="font-size: 25px; margin-top: 0">${t("restaurant.update_info_order")}</label>`,
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
                            <span class="input-group-prepend mr-0">
                                <button onclick="
                                    javascript:{const el = document.getElementById('quantity-value');
                                    el.innerText = parseInt(el.innerText) - 1>1?parseInt(el.innerText)-1:1;
                                    }"
                                    class="btn btn-danger rounded-0"
                                >
                                    <i class="fa fa-minus"></i>
                                </button>
                            </span>
                            <span id="quantity-value" class="rounded-0 form-control input-number d-inline-block text-center hide-arrow" style="width: 45px">${quantity}</span>
                            <span class="input-group-prepend">
                                <button onclick="javascript:{
                                    const el = document.getElementById('quantity-value');
                                    el.innerText = parseInt(el.innerText) + 1<=20?parseInt(el.innerText)+1:20;
                                    }"
                                    class="ml-0 btn btn-success rounded-0"
                                >
                                    <i class="fa fa-plus"></i>
                                </button>
                            </span>
                        </div>
                        </div>
                        <div className="description-container" style="margin-top: 15px">
                            <textarea class="form-control" id="description-value" rows="3" placeholder="${t("restaurant.note_order")}" type="text">${order.description || ""}</textarea>     
                        </div>  
                    </div>
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: t("restaurant.cancel"),
            confirmButtonText: t("restaurant.update"),
        }).then(async (result) => {

            if (result.isConfirmed) {
                setIsLoading(3)
                const value = document.getElementById("quantity-value").innerText;
                const description =
                    document.getElementById("description-value").value;
                try {
                    let res = await OrderDetailService.updateOrderDetail({
                        ...order,
                        quantity: parseInt(value),
                        description,
                        order: {
                            ...order.orderDTO,
                        },
                    });
                    if (res.status === 200) {
                        await reloadOrderData();
                        Swal.fire(t("restaurant.saved"), "", "success");

                    }
                } catch (e) {
                    setIsLoading(0)
                    Swal.fire(t("restaurant.error_save"), "", "info");
                }

            }
        });

    }


    function renderOrderDetailList(order) {

        return <div>
            <div className={"ordered-list"}>
                <div className={"my-cart"}>
                    <h5>
                        <button className="btn btn-success btn-sm" disabled>{t("restaurant.my_cart")}</button>
                    </h5>
                    {mycarts.length === 0 && <div>{t("restaurant.empty")}</div>}
                    {mycarts.map((ob, index) => (
                        <div className={"order-info"} key={index}>
                            <span className="order-info-id d-inline-block">{index + 1}.</span>
                            <span className="order-info-username d-inline-block" data-toggle="tooltip" data-placement="top" title={ob.user.fullName? ob.user.fullName : ob.user.username}>
                                {ob.user.fullName || ob.user.username}
                            </span>
                            <span className={"badge badge-success mr-1 order-info-quantity"}>{ob.quantity}</span>
                            <span className="order-info-product-name">{ob.product.name}</span>

                            {canOrder && <div className={"action-order"}>
                                {user.username === ob.created_by && order?.status === 'ACTIVATED' ?
                                    <div className={"action-order"}>
                                        <span className={"badge badge-light p-2 m-1 badge-action"} data-toggle="tooltip"
                                              data-placement="top" title={t("restaurant.edit_order")}
                                              onClick={e => updateOrderDetails(ob)}> <i
                                            className="fa-regular fa-pen-to-square"></i></span>
                                        <span className={"badge badge-light p-2 m-1 badge-action"} data-toggle="tooltip"
                                              data-placement="top" title={t("restaurant.delete")}
                                              onClick={e => deleteOrderDetail(ob.id)}><i
                                            className="fa-solid fa-xmark text-danger"></i></span>
                                    </div>
                                    : <span className={"badge badge-light  p-2 m-1 badge-action"}>
                                        <i className="fa-solid fa-copy"></i>
                                    </span>}

                            </div>}


                        </div>
                    ))}

                    {canOrder && mycarts.length > 0 &&
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}
                    >
                        <button className={"btn btn-success mr-2 mt-2"}
                                onClick={e => ordered(mycarts)}>{t("restaurant.done")}</button>
                    </div>}
                </div>

                <div className={"mr-2 my-4"} style={{border: 'solid 1px black', height: 2}}></div>
                <button className="btn btn-info btn-sm" disabled>{t("restaurant.ordered")}</button>
                {orderedList.length === 0 && <div className="mt-2">{t("restaurant.empty")}</div>}
                {orderedList.map((ob, index) => (
                    <div className={"order-info"} key={index}
                         style={{background: user && user.username === ob.created_by ? 'lightyellow' : 'none'}}>
                        <span className="order-info-id d-inline-block">{index + 1}.</span>
                        <span className="order-info-username d-inline-block" data-toggle="tooltip" data-placement="top" title={ob.user.fullName? ob.user.fullName : ob.user.username}>
                            {ob.user.fullName || ob.user.username}
                        </span>
                        <span className={"badge badge-info mr-1 order-info-quantity"} style={{
                            color: "red",
                            fontSize: "20px",
                            backgroundColor: "lightcyan"
                        }}>{ob.quantity}</span>
                        <span className="order-info-product-name">
                            {ob.product.name}
                            {ob.description ?
                                <span style={{fontSize: "85%", lineHeight: "1"}}><br/><span className="rounded" style={{
                                    color: "#212529",
                                    backgroundColor: "#ffc107",
                                    padding: "0.25em 0.4em"
                                }}>{t("restaurant.note_order")}</span> {ob.description}</span>
                                : ""
                            }
                        </span>
                        {canOrder && <div className={"action-order"}>
                            {user && user.username === ob.created_by ?
                                <div className={"action-order"}>
                                    <span className={"badge badge-light p-2 m-1 badge-action"} data-toggle="tooltip"
                                          data-placement="top" title={t("restaurant.edit_order")}
                                          onClick={e => updateOrderDetails(ob)}> <i
                                        className="fa-regular fa-pen-to-square"></i></span>
                                    <span className={"badge badge-light p-2 m-1 badge-action"} data-toggle="tooltip"
                                          data-placement="top" title={t("restaurant.delete")}
                                          onClick={e => deleteOrderDetail(ob.id)}><i
                                        className="fa-solid fa-xmark text-danger"></i></span>
                                </div>
                                : <span className={"badge badge-light  p-2 m-1 badge-action"} data-toggle="tooltip"
                                        data-placement="top" title={t("restaurant.copy_order")}
                                        onClick={e => cloneOrderDetail(ob)}>
                                    <i className="fa-solid fa-copy"></i>
                                </span>}
                        </div>}


                    </div>
                ))}
            </div>
            <div className={"mr-2 my-4"} style={{border: 'solid 1px black', height: 2}}></div>
            <div className={"ordering-list"}>
                <button className="btn btn-sm btn-danger" disabled>{t("restaurant.ordering")}</button>
                {orderingList.length === 0 && <div className="mt-2">{t("restaurant.empty")}</div>}
                {orderingList.map((ob, index) => (
                    <div key={index} className={"order-info"} style={{minHeight: 35}}>
                        <span className="order-info-id d-inline-block">{index + 1}.</span>
                        <span className="order-info-username d-inline-block" data-toggle="tooltip" data-placement="top" title={ob.user.fullName? ob.user.fullName : ob.user.username}>
                            {ob.user.fullName || ob.user.username}
                        </span>
                        <span className={"badge badge-danger mr-1 order-info-quantity"}>{ob.quantity}</span>
                        <span className="order-info-product-name">{ob.product.name}</span>
                    </div>
                ))}
            </div>
        </div>


    }

    return (
        isLoading !== 0 && order === null ? <Loading info={LOADINGS[isLoading]}/> :
            order != null ? <div className="container-custom pt-3 ">
                {isLoading !== 0 && <Loading backdrop info={LOADINGS[isLoading]}/>}
                <div className="text-center" id={"div-scrolltop"}>
                    <h3 className="mb-1">{content.name}</h3>
                    <h3 className="mt-0 mb-3">{content.address}</h3>
                </div>


                <div className="row align-items-start">
                    <div className="col-menu sticky">
                        <nav className="menu-restaurant__category m-0" id={"menu-items"}>
                            <div className="list-category">{menus}</div>
                        </nav>
                    </div>
                    <div className="col-product">
                        <div className="menu-restaurant__product">
                            <div className="list-product">{items}</div>
                        </div>
                    </div>
                    <div className="col-time">
                        <div className={"d-flex flex-column "}>
                            <ul className="best-coaching__countdown--time m-0">
                                <li>
                                    <span id="day">{day}</span> {t("restaurant.day")}
                                </li>
                                <li>
                                    <span id="hour">{hour}</span> {t("restaurant.hour")}
                                </li>
                                <li>
                                    <span id="min">{min}</span> {t("restaurant.min")}
                                </li>
                                <li>
                                    <span id="sec">{sec}</span> {t("restaurant.sec")}
                                </li>
                            </ul>
                            <div className={"orderdetails-list m-0 mt-2"}>
                                {renderOrderDetailList(order)}
                            </div>
                        </div>

                    </div>
                    <div className={"scroll-top"} onClick={scrollTop} data-toggle="tooltip" data-placement="right"
                         title={t("restaurant.scroll-top")}>
                        <i className="fa-solid fa-arrow-up"></i>
                    </div>
                </div>
            </div> : <div className={"none-order-container"}>
                <img style={{marginTop: '30vh'}} src={"../no-items.png"}/>
                <span style={{position: "relative", marginTop: -15}}>{t("restaurant.no-items")}</span>
            </div>

    );
};

export default Restaurant;
