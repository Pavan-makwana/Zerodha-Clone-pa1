// dashboard/src/components/TopBar.js

import React from "react";
import Menu from "./Menu";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points" style={{ color: "#00a25b", fontWeight: 700 }}>24,180.80</p>
          <p className="percent" style={{ color: "#00a25b", fontWeight: 600, marginLeft: "4px" }}>+0.35%</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points" style={{ color: "#00a25b", fontWeight: 700 }}>79,475.20</p>
          <p className="percent" style={{ color: "#00a25b", fontWeight: 600, marginLeft: "4px" }}>+0.28%</p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
