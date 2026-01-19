import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("$", "").replace(",", ""));
    return sum + price;
  }, 0);

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <h1>Shopping Cart</h1>
        <p>Review your selected items before checkout.</p>
      </section>

      <section className="cart-content">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add some products from the shop to get started.</p>
            <NavLink to="/shop" className="shop-btn">
              Go to Shop
            </NavLink>
          </div>
        ) : (
          <>
            <div className="cart-items">
              <div className="cart-header">
                <h2>Cart Items ({cart.length})</h2>
                <button onClick={clearCart} className="clear-cart-btn">
                  Clear Cart
                </button>
              </div>
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="cart-item-price">{item.price}</div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>$10.00</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${(total + 10).toFixed(2)}</span>
              </div>
              <NavLink to="/checkout" className="checkout-btn">
                Proceed to Checkout
              </NavLink>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Cart;

