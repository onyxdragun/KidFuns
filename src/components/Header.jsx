import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { logoutUser } from "../store/authSlice";
import { auth } from "../firebase/firebase.js";

const Header = () => {
  let {family_id, family_name}= useSelector((state) => state.family);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mode = import.meta.env.VITE_MODE || "";

  if (!family_name) {
    family_name = "Create a Family";
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
      navigate('/');
    } catch (error) {
      console.log("Error logging out: ", error);
    }
  };

  return (
    <header className="header content-container">
      {mode && mode !== "" && (
        <div className="header__mode">{mode}</div>
      )}
      <Link to="/">
        <h1>KidFuns - Allowances</h1>
      </Link>
      {isAuthenticated && (
        <div className="header__family__container">
          <span className="header__family__link">Family: <Link to="/familydashboard">{family_name}</Link></span>
          <span className="header__family__login">
            <button className="button button-small" onClick={handleLogout}>Logout</button>
          </span>
        </div>
      )}

    </header >
  )
};

export default Header;