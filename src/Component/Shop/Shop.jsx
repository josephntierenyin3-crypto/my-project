import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import "./Shop.css";
import productImg1 from "../../assets/images1.jpg";
import productImg2 from "../../assets/images2.jpg";
import productImg3 from "../../assets/image3.jpg";
import productImg4 from "../../assets/images4.jpg";
import productImg5 from "../../assets/images5.jpg";
import productImg6 from "../../assets/images6.jpg";

const Shop = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.length);
    }
  }, []);

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.length);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    // Listen for storage changes (when cart is updated from other tabs/pages)
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const addToCart = (product) => {
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.length);
  };

  const products = [
    {
      name: "Premium Faucet Set",
      price: "$299.99",
      image: productImg1,
      description: "High-quality kitchen faucet with modern design",
    },
    {
      name: "Water Heater System",
      price: "$1,299.99",
      image: productImg2,
      description: "Energy-efficient tankless water heater",
    },
    {
      name: "Drain Cleaning Kit",
      price: "$49.99",
      image: productImg3,
      description: "Professional-grade drain cleaning tools",
    },
    {
      name: "Bathroom Fixture Set",
      price: "$449.99",
      image: productImg4,
      description: "Complete bathroom fixture package",
    },
    {
      name: "Pipe Repair Kit",
      price: "$79.99",
      image: productImg5,
      description: "Essential tools for pipe maintenance",
    },
    {
      name: "Sink Installation Kit",
      price: "$199.99",
      image: productImg6,
      description: "Everything needed for sink installation",
    },
  ];

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero-content">
          <h1>Plumbing Products & Supplies</h1>
          <p>
            Quality plumbing products and professional-grade supplies for all your
            plumbing needs. Shop our curated selection of trusted brands.
          </p>
        </div>
        <NavLink to="/cart" className="shop-cart-link">
          <FiShoppingCart className="shop-cart-icon" />
          <span className="shop-cart-count">{cartCount}</span>
        </NavLink>
      </section>

      <section className="products-grid">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Shop;
