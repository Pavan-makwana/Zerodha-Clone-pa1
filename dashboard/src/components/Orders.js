// dashboard/src/components/Orders.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("https://zerodha-clone-pa1.onrender.com/allorders", {
      withCredentials: true
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
            window.location.href = 'https://zerodha-clone-frontend-pa1.vercel.app//login';
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
    return <h3 style={{ color: "red", padding: "20px" }}>{error}</h3>;
  }

  return (
    <div className="orders">
      {allOrders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
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
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order, index) => {
                  const modeClass = order.mode === "BUY" ? "profit" : "loss";
                  return (
                    <tr key={index}>
                      <td>{order.name}</td>
                      <td className={modeClass}>{order.mode}</td>
                      <td>{order.qty}</td>
                      <td>{order.price.toFixed(2)}</td>
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