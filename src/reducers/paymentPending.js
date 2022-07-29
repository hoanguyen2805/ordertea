import {
    COUNT_ORDERDETAIL_PENDING,
} from "../actions/types";


const initProduct = {
    count: 0
};

export default function (state = initProduct, action) {
    switch (action.type) {
        case COUNT_ORDERDETAIL_PENDING: {
            return {
                ...state,
                count: action.payload,
            };
        }
        default:
            return state;
    }
}