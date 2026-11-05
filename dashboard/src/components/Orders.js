// dashboard/src/components/Orders.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "https://zerodha-clone-frontend-pa1.vercel.app";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/allorders`, {
        withCredentials: true,
      })
      .then((res) => {
        setAllOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 400)) {
          setError("Authentication failed. Redirecting to login...");
          setTimeout(() => {
            window.location.href = `${FRONTEND_URL}/login`;
          }, 2000);
        } else {
          setError("Failed to fetch orders data.");
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading orders...</div>;
  }

  if (error) {
    return <h4 style={{ color: "red", padding: "20px" }}>{error}</h4>;
  }

  return (
    <div className="orders">
      {allOrders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn btn-blue" style={{ marginTop: "10px", display: "inline-block" }}>
            Get started
          </Link>
        </div>
      ) : (
        <>
          <h3 className="title">Orders ({allOrders.length})</h3>
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Mode</th>
                  <th>Qty.</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order, index) => {
                  const modeClass = order.mode === "BUY" ? "profit" : "loss";
                  return (
                    <tr key={index}>
                      <td>{order.name}</td>
                      <td className={modeClass}><strong>{order.mode}</strong></td>
                      <td>{order.qty}</td>
                      <td>₹{(order.price || 0).toFixed(2)}</td>
                      <td><span className="profit">COMPLETE</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
