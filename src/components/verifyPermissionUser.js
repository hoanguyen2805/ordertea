import React from "react";
import { Redirect } from "react-router-dom";
const verifyPermissionUser = (Component) => {
    const user = JSON.parse(localStorage.getItem("user"));

    function checkIsAccessible() {
        if (user) {
            return user.roles.includes("ROLE_USER");
        } else {
            return false;
        }
    }

    function Verify() {
        const isAccessible = checkIsAccessible();
        if (!isAccessible) {
            return <Redirect to="/orders" />;
        }
        return <Component />;
    }

    return Verify;
};

export default verifyPermissionUser;
