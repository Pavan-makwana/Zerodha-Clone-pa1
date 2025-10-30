// dashboard/src/components/BuyActionWindow.js

import React, { useState, useContext } from "react"; 
import { Link } from "react-router-dom";
import axios from "axios";
import  GeneralContext  from "./GeneralContext"; 

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [isBuying, setIsBuying] = useState(false); 
  const [error, setError] = useState(""); 

  const { closeBuyWindow } = useContext(GeneralContext);

  const handleBuyClick = async () => { 
    if (isBuying) return; 
    
    setIsBuying(true);
    setError("");

    try {
      await axios.post(
        "https://zerodha-clone-pa1.onrender.com/newOrder",
        {
          name: uid,
          qty: stockQuantity,
          price: stockPrice,
          mode: "BUY",
        },
        {
          withCredentials: true, 
        }
      );

      alert("Order placed successfully!");
      setIsBuying(false);
      closeBuyWindow(); 

    } catch (err) {
      console.error("Order failed:", err);
      let errorMsg = "Order failed. Please try again.";
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        errorMsg = "Authentication failed. Please login again.";
      }
      setError(errorMsg);
      alert(errorMsg); 
      setIsBuying(false);
    }
  };

  const handleCancelClick = () => {
    if (isBuying) return; 
    closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(Number(e.target.value))} 
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(Number(e.target.value))} 
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        <div>
          <Link
            className="btn btn-blue"
            onClick={handleBuyClick}
            disabled={isBuying} 
          >
            {isBuying ? "Buying..." : "Buy"}
          </Link>
          <Link
            to=""
            className="btn btn-grey"
            onClick={handleCancelClick}
            disabled={isBuying}
          >
            Cancel
          </Link>
        </div>
      </div>
      {error && <p style={{ color: "red", textAlign: "center", fontSize: "12px", marginTop: "5px" }}>{error}</p>}
    </div>
  );
}; 

export default BuyActionWindow;