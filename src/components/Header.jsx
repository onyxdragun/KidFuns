import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { logoutUser } from "../store/authSlice";
import { auth } from "../firebase/firebase.js";

const Header = () => {
  let familyName = useSelector((state) => state.allowance.familyName);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!familyName) {
    familyName = "Create a Family";
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
      <Link to="/">
        <h1>KidFuns - Allowances</h1>
      </Link>
      {isAuthenticated && (
        <div className="header__family__container">
          <span className="header__family__link">Family: <Link to="/familydashboard">{familyName}</Link></span>
          <span className="header__family__login">
            <button className="button button-small" onClick={handleLogout}>Logout</button>
          </span>
        </div>
      )}

    </header >
  )
};

export default Header;