// backend/data/indianStocks.js

/**
 * Comprehensive Master Directory of Top Indian Stocks (NSE)
 * Covering NIFTY 50, NIFTY Next 50, and popular high-volume equities.
 */
const INDIAN_STOCKS_DIRECTORY = [
  // Mega Caps & NIFTY 50
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", sector: "Energy / Telecom", baseline: 1320.00 },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd", sector: "Information Technology", baseline: 2498.50 },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking & Financials", baseline: 785.45 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Telecommunications", baseline: 2094.20 },
  { symbol: "INFY", name: "Infosys Ltd", sector: "Information Technology", baseline: 1174.00 },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking & Financials", baseline: 1260.00 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking & Financials", baseline: 810.00 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG / Cigarettes", baseline: 468.00 },
  { symbol: "LT", name: "Larsen & Toubro Ltd", sector: "Engineering & Infra", baseline: 3520.00 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", sector: "FMCG", baseline: 2380.00 },
  { symbol: "HUL", name: "Hindustan Unilever Ltd", sector: "FMCG", baseline: 2380.00 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", sector: "Financial Services", baseline: 6850.00 },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", sector: "Automotive", baseline: 11200.00 },
  { symbol: "TITAN", name: "Titan Company Ltd", sector: "Consumer Durables", baseline: 3240.00 },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", sector: "Banking & Financials", baseline: 1140.00 },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", sector: "Automotive", baseline: 785.00 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd", sector: "Healthcare & Pharma", baseline: 1780.00 },
  { symbol: "NTPC", name: "NTPC Ltd", sector: "Power Generation", baseline: 380.00 },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp Ltd", sector: "Energy & Oil", baseline: 260.00 },
  { symbol: "POWERGRID", name: "Power Grid Corp of India Ltd", sector: "Power Transmission", baseline: 315.00 },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", sector: "Metals & Mining", baseline: 148.00 },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd", sector: "Automotive", baseline: 2840.00 },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd", sector: "Conglomerate", baseline: 2950.00 },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd", sector: "Ports & Shipping", baseline: 1220.00 },
  { symbol: "COALINDIA", name: "Coal India Ltd", sector: "Mining", baseline: 435.00 },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", sector: "Financial Services", baseline: 1590.00 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", sector: "Banking", baseline: 1740.00 },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", sector: "Paints & Chemicals", baseline: 2420.00 },
  { symbol: "WIPRO", name: "Wipro Ltd", sector: "Information Technology", baseline: 545.00 },
  { symbol: "TECHM", name: "Tech Mahindra Ltd", sector: "Information Technology", baseline: 1620.00 },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd", sector: "Information Technology", baseline: 1810.00 },

  // Trending, Tech & High Volume Equities
  { symbol: "ZOMATO", name: "Zomato Ltd", sector: "Internet & Delivery", baseline: 260.00 },
  { symbol: "JIOFIN", name: "Jio Financial Services Ltd", sector: "Financial Services", baseline: 310.00 },
  { symbol: "PAYTM", name: "One97 Communications (Paytm)", sector: "Fintech", baseline: 820.00 },
  { symbol: "IRFC", name: "Indian Railway Finance Corp", sector: "Railways & Infra", baseline: 145.00 },
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd", sector: "Defense & Aerospace", baseline: 4120.00 },
  { symbol: "BEL", name: "Bharat Electronics Ltd", sector: "Defense & Aerospace", baseline: 288.00 },
  { symbol: "TATAPOWER", name: "Tata Power Company Ltd", sector: "Utilities", baseline: 395.00 },
  { symbol: "KPITTECH", name: "KPIT Technologies Ltd", sector: "IT & Auto Software", baseline: 1420.00 },
  { symbol: "QUICKHEAL", name: "Quick Heal Technologies Ltd", sector: "Cybersecurity", baseline: 540.00 },
  { symbol: "EVEREADY", name: "Eveready Industries India Ltd", sector: "Consumer Goods", baseline: 380.00 },
  { symbol: "JUBLFOOD", name: "Jubilant FoodWorks Ltd (Domino's)", sector: "QSR & Food", baseline: 580.00 },
  { symbol: "BSE", name: "BSE Limited", sector: "Stock Exchange", baseline: 4650.00 },
  { symbol: "CDSL", name: "Central Depository Services Ltd", sector: "Financial Depository", baseline: 1540.00 },
  { symbol: "VEDL", name: "Vedanta Ltd", sector: "Metals & Mining", baseline: 470.00 },
  { symbol: "PFC", name: "Power Finance Corporation Ltd", sector: "Financial Services", baseline: 460.00 },
  { symbol: "RECLTD", name: "REC Ltd", sector: "Financial Services", baseline: 510.00 },
  { symbol: "IREDA", name: "Indian Renewable Energy Dev Agency", sector: "Renewable Energy", baseline: 195.00 },
  { symbol: "SWIGGY", name: "Swiggy Ltd", sector: "Food Delivery & Quick Commerce", baseline: 480.00 },
  { symbol: "NYKAA", name: "FSN E-Commerce (Nykaa)", sector: "E-Commerce & Beauty", baseline: 175.00 },
  { symbol: "DLF", name: "DLF Ltd", sector: "Real Estate", baseline: 810.00 },
  { symbol: "INDIGO", name: "InterGlobe Aviation Ltd", sector: "Aviation", baseline: 4150.00 },
];

module.exports = { INDIAN_STOCKS_DIRECTORY };
