import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { faCog, faEnvelope, faHomeAlt, faQuestion, faSignOutAlt, faUserAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "firebase/auth";

import { logoutUser } from "../store/authSlice";
import { auth } from "../firebase/firebase.js";



const MobileNav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const family_id = useSelector((state) => state.family.family_id);
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
      navigate('/');
    } catch (error) {
      console.log("Error logging out: ", error);
    }
  };

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const navTop = navRef.current?.getBoundingClientRect().top || 0;
  
      if (currentScrollY > lastScrollY && navTop <= 0) {
        // Scrolling down and navbar hits the top
        setIsSticky(true);
      } else if (currentScrollY < lastScrollY && currentScrollY <= navHeight) {
        // Scrolling up and reaching original position
        setIsSticky(false);
      }
  
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [navHeight]);

  return (
    <>
      <div style={{ height: isSticky ? `${navHeight}px` : "0px" }} />
      <div
        ref={navRef}
        className={`mobilenav ${isSticky ? "mobilenav--sticky" : ""}`}
      >
        <Link to="/" title="Dashboard"><FontAwesomeIcon icon={faHomeAlt} className="mobilenav__fa" /></Link>
        {user && isAuthenticated && family_id && (
          <>
            <Link to="/familydashboard" title="Family Dashboard"><FontAwesomeIcon icon={faUsers} className="mobilenav__fa" /></Link>
          </>
        )}
        <Link to="/" title="Contact"><FontAwesomeIcon icon={faEnvelope} className="mobilenav__fa" /></Link>
        <Link to="/faq" title="Frequently Asked Questions"><FontAwesomeIcon icon={faQuestion} className="mobilenav__fa" /></Link>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            title="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mobilenav__fa" />
          </button>
        )}
      </div>
    </>
  )
};

export default MobileNav;