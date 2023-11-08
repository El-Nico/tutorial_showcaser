import React from "react";
import "./Footer.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-socials">
        <div className="footer-social-icon">
          <FaGithub></FaGithub>
        </div>
        <div className="footer-social-icon">
          <FaLinkedin></FaLinkedin>
        </div>
      </div>
      <div className="footer-copy">
        <p>
          copyright &copy; 2023{" "}
          <a href="https://nicholas-eruba.com/home" target="_blank">
            Nicholas Chibuike-Eruba
          </a>
          &nbsp; All rights reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
