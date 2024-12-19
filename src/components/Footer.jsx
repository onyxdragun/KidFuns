import React from "react";
import { Link } from "react-router-dom";

import ChangeLog from "./ChangeLog";

const Footer = () => {

  return (
    <footer className="footer content-container">
      <div className="footer__link">
        <Link to="/changelog">Version {__APP_VERSION__}</Link>
      </div>
    </footer >
  )

};

export default Footer;