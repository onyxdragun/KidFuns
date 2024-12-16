import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { logoutUser } from "../store/authSlice";
import { auth } from "../firebase/firebase.js";

const HamburgerMenu = () => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id, family_name } = useSelector((state) => state.family);

  const handleToggleMenu = () => setIsOpen(!isOpen);
  const handleCloseMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleCloseMenu();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      handleCloseMenu();
      await signOut(auth);
      dispatch(logoutUser());
      navigate('/');
    } catch (error) {
      console.log("Error logging out: ", error);
    }
  };

  return (
    <nav className="hamburgermenu__container">
      <button
        className={`hamburgermenu__button ${isOpen ? "hamburgermenu__button--open" : ""}`}
        onClick={handleToggleMenu}
        ref={menuRef}
      >
        <span className="hamburgermenu__bar"></span>
        <span className="hamburgermenu__bar"></span>
        <span className="hamburgermenu__bar"></span>
      </button>
      <ul
        className={`hamburgermenu__list ${isOpen ? "hamburgermenu__list--visible" : ""}`}
      >
        <li className="hamburgermenu__item">
          <Link to="/" onClick={handleCloseMenu}>Home</Link>
        </li>
        {isAuthenticated && family_id && (
          <li className="hamburgermenu__item">
            <Link to="/familydashboard">Family Dashboard</Link>
          </li>
        )}
        <li className="hamburgermenu__item">
          <Link to="/faq" onClick={handleCloseMenu}>F.A.Q</Link>
        </li>
        <li className="hamburgermenu__item">
          <Link to="/contact" onClick={handleCloseMenu}>Contact</Link>
        </li>
        {isAuthenticated && (
          <li className="hamburgermenu__item">
            <button className="button-link hamburgermenu__item__btn" onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default HamburgerMenu;