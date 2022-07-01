import {
    ADD_ORDERDETAILS,
    REMOVE_ORDERDETAILS,
    GETALL_ORDERDETAILS_CART,
    UPDATE_ORDERDETAILS
} from "../actions/types";


const initProduct = {
    list: []
};

export default function (state = initProduct, action) {

    switch (action.type) {
        case ADD_ORDERDETAILS: {
            let ls = state.list;
            let ob = ls.find(ob => ob.id === action.payload.id);
            if (ob) {
                ob = action.payload;
            } else {
                ls.push(action.payload);
            }
            return {
                ...state,
                list: ls,
            };
        }
        case UPDATE_ORDERDETAILS: {
            let ls = state.list;
            ls = ls.map(ob => {
                if (ob.id === action.payload.id) {
                    ob = action.payload
                }
                return ob;
            })
            return {
                ...state,
                list: ls,
            };
        }
        case REMOVE_ORDERDETAILS:
            let ls = state.list;
            ls.splice(ls.indexOf(ls.find(ob => ob.id === action.payload)), 1)
            return {
                ...state,
                list: ls
            };
        case GETALL_ORDERDETAILS_CART:
            return {
                ...state,
                list: action.payload,
            };
        default:
            return state;
    }
}