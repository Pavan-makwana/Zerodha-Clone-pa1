import React from "react";

const appsList = [
  {
    name: "Smallcase",
    desc: "Thematic investing platform that helps you invest in diversified baskets of stocks and ETFs.",
    category: "Investments",
    url: "https://smallcase.com",
  },
  {
    name: "Streak",
    desc: "Systematic trading platform that allows you to create, backtest, and deploy strategies without coding.",
    category: "Algorithmic Trading",
    url: "https://streak.tech",
  },
  {
    name: "Sensibull",
    desc: "Options trading platform for building custom strategies, analyzing payoff graphs, and scanning IV.",
    category: "Derivatives",
    url: "https://sensibull.com",
  },
  {
    name: "Coin by Zerodha",
    desc: "Zero-commission direct mutual funds delivered straight into your Demat account.",
    category: "Mutual Funds",
    url: "https://coin.zerodha.com",
  },
  {
    name: "Ditto",
    desc: "Modern insurance advisory service offering spam-free and honest advice on term life and health insurance.",
    category: "Insurance",
    url: "https://joinditto.in",
  },
  {
    name: "GoldenPi",
    desc: "Online platform for individual investors to discover, invest, and trade in bonds and debentures.",
    category: "Fixed Income",
    url: "https://goldenpi.com",
  },
];

const Apps = () => {
  return (
    <div style={{ padding: "20px 30px" }}>
      <h3 className="title" style={{ marginBottom: "8px" }}>Apps & Partner Ecosystem</h3>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "25px" }}>
        Connect your Kite account to seamless third-party tools to augment your trading and investing experience.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {appsList.map((app, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              padding: "20px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#4184f3",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {app.category}
              </span>
              <h4 style={{ margin: "6px 0 10px 0", fontSize: "18px", color: "#333" }}>
                {app.name}
              </h4>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                {app.desc}
              </p>
            </div>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-blue"
              style={{
                alignSelf: "flex-start",
                marginTop: "15px",
                padding: "6px 14px",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              Launch App →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Apps;
