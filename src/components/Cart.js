import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import OrderDetailService from "../services/order-details.service";
import {removeOrderDetails, setOrderDetailListCart, updateOrderDetail} from "../actions/order-detail";


function Cart() {
    let orderDetais = useSelector((state) => state.orderDetail);
    const dispatch = useDispatch();
    const user = JSON.parse(localStorage.getItem("user"));
    let orderMap = new Map();
    let listOrderDetails = [];
    orderDetais.list.forEach(item => {
        item.order = {id: item.orderDTO.id}
        listOrderDetails = orderMap.get(item.orderDTO.id);
        if (!listOrderDetails) {
            listOrderDetails = [item]
        } else {
            listOrderDetails.push(item)
        }
        orderMap.set(item.orderDTO.id, listOrderDetails)

    })






    useEffect(() => {
        getCartDB();
    }, [])

    async function getCartDB() {
        try {
            let response = await OrderDetailService.getCartByOrderId(6);
            if (response.status === 200 && response.data.data) {
                dispatch(setOrderDetailListCart(response.data.data))
            }
        } catch (e) {
            console.log(e)
        }
    }


    function TotalPrice(price, tonggia) {
        return Number(price * tonggia).toLocaleString("en-US");
    }

    async function order(list) {
        if (user !== null) {
            list = list.map(ob => {
                ob.status = "ACTIVATED";
                return ob;
            })
            let res = await OrderDetailService.updateAllOrderDetail(list);
            if (res.status === 200 && res.data.data) {
                getCartDB();
                alert("Order thành công")
            }

        } else {
            alert("Hãy đăng nhập!");
        }
    }

    const deleteOrderDetail = async (id) => {
        try {
            let res = await OrderDetailService.deleteOrderDetails([id]);
            if (res.status === 200 && res.data.data === 1) {
                dispatch(removeOrderDetails(id));
            }
        } catch (e) {
            console.log(e)
        }
    }

    const increaseQuantityOrderDetail = async (order) => {
        try {
            let res = await OrderDetailService.updateOrderDetail({
                ...order, quantity: order.quantity + 1, order: {
                    id: order.orderDTO.id
                }
            });
            if (res.status === 200) {
                dispatch(updateOrderDetail(res.data.data))
            }

        } catch (e) {
            console.log(e)
        }
    }

    const decreaseQuantityOrderDetail = async (order) => {
        if (order.quantity === 1) return;
        try {
            let res = await OrderDetailService.updateOrderDetail({
                ...order, quantity: order.quantity - 1, order: {
                    id: order.orderDTO.id
                }
            });
            if (res.status === 200) {
                dispatch(updateOrderDetail(res.data.data))
            }

        } catch (e) {
            console.log(e)
        }
    }

    return (

        <div className="container pt-3 bg-light">
            <div className={"row"}>
                {Array.from(orderMap.values()).map((value => genOrderDetailByGroup(value)))}
            </div>
            <div className={"row"}>
                {Array.from(orderMap.values()).length === 0 &&
                <div className="alert alert-info w-100" role="alert">
                    No order in cart
                </div>}
            </div>
        </div>
    );


    function genOrderDetailByGroup(list) {
        return <div key={list[0].id}>
            <h4><span className="badge bg-info"> {list[0].orderDTO.store.name}</span></h4>

            <div className="row">
                <div className="col-md-12">
                    <table className="table">
                        <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((item, key) => {
                            return (
                                <tr key={key}>
                                    <td>
                                        <i
                                            className="badge badge-danger" style={{cursor: "pointer"}}
                                            onClick={() => deleteOrderDetail(item.id)}
                                        >
                                            X
                                        </i>
                                    </td>
                                    <td>{item.product.name}</td>
                                    <td>
                                        <img
                                            src={item.product.photos[0].value}
                                            style={{width: "100px", height: "80px"}}
                                        />
                                    </td>
                                    <td>{Number(item.product.discount_price?.value || item.product.price.value).toLocaleString("en-US")} đ</td>
                                    <td>
                                            <span
                                                className="btn btn-danger"
                                                style={{margin: "2px"}}
                                                onClick={() => decreaseQuantityOrderDetail(item)}
                                            >
                                                -
                                            </span>
                                        <span className="btn btn-warning">{item.quantity}</span>
                                        <span
                                            className="btn btn-danger"
                                            style={{margin: "2px"}}
                                            onClick={() => increaseQuantityOrderDetail(item)}
                                        >
                                                +
                                            </span>
                                    </td>
                                    <td>{TotalPrice(item.product.discount_price?.value || item.product.price.value, item.quantity)} đ</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td colSpan="5">Total Carts</td>
                            <td>{Number(0).toLocaleString("en-US")} đ</td>
                        </tr>
                        <tr>
                            <td colSpan="5"></td>
                            <td>
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => order(list)}
                                >
                                    Order
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    }

}

export default Cart;
