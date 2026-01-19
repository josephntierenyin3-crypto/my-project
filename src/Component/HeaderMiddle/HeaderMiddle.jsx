import React from "react";
import { NavLink } from "react-router-dom";
import "./HeaderMiddle.css";
import image from "../../assets/images.png";

const HeaderMiddle = () => {
  return (
    <div className="header-middle">
      <NavLink to="/">
        <img src={image} alt="Logo" className="logo" />
      </NavLink>

      <ul className="nav-menu">
        <li className="menu-item has-submenu">
          <div className="menu-title menu-title--dropdown" role="button" tabIndex={0}>
            Home
          </div>
          <ul className="submenu">
            <li>
              <NavLink to="/home/style-1">Home Style 1</NavLink>
            </li>
            <li>
              <NavLink to="/home/style-2">Home Style 2</NavLink>
            </li>
            <li>
              <NavLink to="/home/style-3">Home Style 3</NavLink>
            </li>
          </ul>
        </li>

        <li className="menu-item">
          <div className="menu-title">
            <NavLink to="/about">About</NavLink>
          </div>
        </li>

        <li className="menu-item has-submenu">
          <div className="menu-title menu-title--dropdown" role="button" tabIndex={0}>
            Service
          </div>
          <ul className="submenu">
            <li>
              <NavLink to="/service/style-1">Service</NavLink>
            </li>
            <li>
              <NavLink to="/service/style-2">Service Style 2</NavLink>
            </li>
            <li>
              <NavLink to="/service/single">Service Single</NavLink>
            </li>
          </ul>
        </li>

        <li className="menu-item has-submenu">
          <div className="menu-title menu-title--dropdown" role="button" tabIndex={0}>
            Shop
          </div>
          <ul className="submenu">
            <li>
              <NavLink to="/shop">Shop Page</NavLink>
            </li>
            <li>
              <NavLink to="/shop/single">Shop Single</NavLink>
            </li>
            <li>
              <NavLink to="/cart">Cart</NavLink>
            </li>
            <li>
              <NavLink to="/checkout">Checkout</NavLink>
            </li>
          </ul>
        </li>

        <li className="menu-item has-submenu">
          <div className="menu-title menu-title--dropdown" role="button" tabIndex={0}>
            Pages
          </div>
          <ul className="submenu">
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/service/style-1">Services</NavLink>
            </li>
            <li>
              <NavLink to="/shop">Shop</NavLink>
            </li>
            <li>
              <NavLink to="/blog/right-sidebar">Blog</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
          </ul>
        </li>

        <li className="menu-item has-submenu">
          <div className="menu-title menu-title--dropdown" role="button" tabIndex={0}>
            Blog
          </div>
          <ul className="submenu">
            <li>
              <NavLink to="/blog/right-sidebar">Blog Right Sidebar</NavLink>
            </li>
            <li>
              <NavLink to="/blog/left-sidebar">Blog Left Sidebar</NavLink>
            </li>
            <li>
              <NavLink to="/blog/fullwidth">Blog Fullwidth</NavLink>
            </li>
            <li>
              <NavLink to="/blog/details">Blog Details</NavLink>
            </li>
            <li>
              <NavLink to="/blog/details/right-sidebar">Blog Details Right Sidebar</NavLink>
            </li>
            <li>
              <NavLink to="/blog/details/left-sidebar">Blog Details Left Sidebar</NavLink>
            </li>
            <li>
              <NavLink to="/blog/details/fullwidth">Blog Details Fullwidth</NavLink>
            </li>
          </ul>
        </li>

        <li className="menu-item">
          <div className="menu-title">
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </li>
      </ul>

      <div className="header-actions">
        <NavLink to="/contact" className="quote-btn">
          Get Free Quote
        </NavLink>
      </div>
    </div>
  );
};

export default HeaderMiddle;
