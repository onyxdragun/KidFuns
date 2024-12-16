import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { logoutUser } from "../store/authSlice";
import { auth } from "../firebase/firebase.js";
import HamburgerMenu from "./HamburgerMenu";
import MobileNav from "./MobileNav";

const Header = () => {
  let { family_id, family_name } = useSelector((state) => state.family);
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
    <>
      {mode && mode !== "" && (
        <div className="header__mode">{mode}</div>
      )}
      <header className="header content-container">
        <div className="header__title">
          <Link to="/">
            <h1>KidFuns</h1>
            <div className="header__subtitle">
              Allowance Tracking for Parents
            </div>
          </Link>
        </div>
        <div className="header__nav__container">
          
          {isAuthenticated && (
            <div className="header__family__container">
              <span className="header__family__link">Family: <Link to="/familydashboard">{family_name}</Link></span>
            </div>
          )}
        
        </div>
        <MobileNav />
      </header >
    </>
  )
};

export default Header;