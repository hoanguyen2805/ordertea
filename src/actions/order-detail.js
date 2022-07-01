import {
    ADD_ORDERDETAILS,
    GETALL_ORDERDETAILS_CART,
    REMOVE_ORDERDETAILS,
    UPDATE_ORDERDETAILS
} from "./types";

export function setOrderDetailListCart(data) {
    return {
        type: GETALL_ORDERDETAILS_CART,
        payload: data,
    };
}

export function updateOrderDetail(data) {
    return {
        type: UPDATE_ORDERDETAILS,
        payload: data,
    };
}

export function addOrderDetails(data) {
    return {
        type: ADD_ORDERDETAILS,
        payload: data,
    };
}

export function removeOrderDetails(id) {
    return {
        type: REMOVE_ORDERDETAILS,
        payload: id,
    };
}

