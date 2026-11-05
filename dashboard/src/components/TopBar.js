import React from "react";
import Menu from "./Menu";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">24,180.80</p>
          <p className="percent" style={{ color: "#4caf50", fontWeight: 500, marginLeft: "6px" }}>+0.35%</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">79,475.20</p>
          <p className="percent" style={{ color: "#4caf50", fontWeight: 500, marginLeft: "6px" }}>+0.28%</p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
