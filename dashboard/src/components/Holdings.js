import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext";
import { BarChartOutlined } from "@mui/icons-material";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://zerodha-clone-pa1.onrender.com";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/allholdings`, { withCredentials: true })
      .then((res) => {
        setAllHoldings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
        setError("Failed to fetch holdings data.");
        setLoading(false);
      });
  }, []);

  const totalInvestment = allHoldings.reduce(
    (acc, stock) => acc + (stock.avg || 0) * (stock.qty || 0),
    0
  );
  const currentValue = allHoldings.reduce(
    (acc, stock) => acc + (stock.price || 0) * (stock.qty || 0),
    0
  );
  const totalPL = currentValue - totalInvestment;
  const plPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;
  const isOverallProfit = totalPL >= 0;

  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading holdings...</div>;
  }

  if (error) {
    return <h4 style={{ color: "red", padding: "20px" }}>{error}</h4>;
  }

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const isProfit = curValue - stock.avg * stock.qty >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td><strong>{stock.name}</strong></td>
                  <td>{stock.qty}</td>
                  <td>₹{(stock.avg || 0).toFixed(2)}</td>
                  <td>₹{(stock.price || 0).toFixed(2)}</td>
                  <td>₹{curValue.toFixed(2)}</td>
                  <td className={profClass}>
                    ₹{(curValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={profClass}>{stock.net || "+0.00%"}</td>
                  <td className={dayClass}>{stock.day || "+0.00%"}</td>
                  <td>
                    <button
                      className="btn btn-blue"
                      style={{ padding: "3px 8px", fontSize: "11px", margin: 0 }}
                      onClick={() => generalContext.openBuyWindow(stock.name)}
                    >
                      Buy
                    </button>
                    <button
                      className="btn btn-orange"
                      style={{ padding: "3px 8px", fontSize: "11px", marginLeft: "4px" }}
                      onClick={() => generalContext.openSellWindow(stock.name)}
                    >
                      Sell
                    </button>
                    <button
                      title="View Candlestick Chart"
                      style={{
                        padding: "3px 6px",
                        fontSize: "11px",
                        marginLeft: "4px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "3px",
                        cursor: "pointer",
                        color: "#475569",
                        display: "inline-flex",
                        alignItems: "center",
                        verticalAlign: "middle",
                      }}
                      onClick={() => generalContext.openChartWindow(stock.name)}
                    >
                      <BarChartOutlined style={{ fontSize: "14px" }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            ₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={isOverallProfit ? "profit" : "loss"}>
            ₹{totalPL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {isOverallProfit ? "+" : ""}
            {plPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      {allHoldings.length > 0 && <VerticalGraph data={data} />}
    </>
  );
};

export default Holdings;
