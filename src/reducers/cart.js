import {
  INCREASE_QUANTITY,
  DECREASE_QUANTITY,
  GET_ALL_PRODUCT,
  GET_NUMBER_CART,
  ADD_CART,
  DELETE_CART,
  DELETE_ALL_CART
} from "../actions/types";

const initProduct = {
  numberCart: 0,
  Carts: [],
  _products: [],
};

export default function (state = initProduct, action) {
  switch (action.type) {
    case GET_ALL_PRODUCT:
      return {
        ...state,
        _products: action.payload,
      };
    case GET_NUMBER_CART:
      return {
        ...state,
      };
    case ADD_CART:
      if (state.numberCart === 0) {
        let cart = {
          id_product: action.payload.id_product,
          id_order: action.payload.id_order,
          quantity: 1,
          name: action.payload.name,
          image: action.payload.image,
          price: action.payload.price,
        };
        state.Carts.push(cart);
      } else {
        let check = false;
        state.Carts.map((item, key) => {
          if (item.id_product === action.payload.id_product) {
            state.Carts[key].quantity++;
            check = true;
          }
        });
        if (!check) {
          let _cart = {
            id_product: action.payload.id_product,
            id_order: action.payload.id_order,
            quantity: 1,
            name: action.payload.name,
            image: action.payload.image,
            price: action.payload.price,
          };
          state.Carts.push(_cart);
        }
      }
      return {
        ...state,
        numberCart: state.numberCart + 1,
      };
    case INCREASE_QUANTITY:
      state.numberCart++;
      state.Carts[action.payload].quantity++;

      return {
        ...state,
      };
    case DECREASE_QUANTITY:
      let quantity = state.Carts[action.payload].quantity;
      if (quantity > 1) {
        state.numberCart--;
        state.Carts[action.payload].quantity--;
      }

      return {
        ...state,
      };
    case DELETE_CART:
      let quantity_ = state.Carts[action.payload].quantity;
      return {
        ...state,
        numberCart: state.numberCart - quantity_,
        Carts: state.Carts.filter((item) => {
          return item.id_product !== state.Carts[action.payload].id_product;
        }),
      };
    case DELETE_ALL_CART:
      return {
        ...state,
        numberCart: 0,
        Carts: [],
      };
    default:
      return state;
  }
}