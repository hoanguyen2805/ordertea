import {
  INCREASE_QUANTITY,
  DECREASE_QUANTITY,
  GET_NUMBER_CART,
  ADD_CART,
  UPDATE_CART,
  DELETE_CART,
  DELETE_ALL_CART
} from "./types";

export function AddCart(product) {
  return {
    type: ADD_CART,
    payload: product,
  };
}

/*GET NUMBER CART*/
export function GetNumberCart(){
    return{
        type: GET_NUMBER_CART
    }
}

export function UpdateCart(payload){
    return {
        type: UPDATE_CART,
        payload
    }
}
export function DeleteCart(payload){
    return{
        type: DELETE_CART,
        payload
    }
}

// export function IncreaseQuantity(payload){
//     return{
//         type: INCREASE_QUANTITY,
//         payload
//     }
// }
export function DecreaseQuantity(payload){
    return{
        type: DECREASE_QUANTITY,
        payload
    }
}

export function DeleteAllCart() {
  return {
    type: DELETE_ALL_CART
  };
}