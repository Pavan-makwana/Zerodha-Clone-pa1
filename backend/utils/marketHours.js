// backend/utils/marketHours.js

/**
 * Indian Stock Market (NSE & BSE) Trading Hours Utility
 *
 * Trading Days: Monday through Friday (excluding exchange holidays)
 * Regular Trading Hours: 09:15 AM to 03:30 PM IST (Asia/Kolkata, UTC+5:30)
 * Pre-market Session: 09:00 AM to 09:08 AM IST
 */

function getIndianMarketStatus(customDate = null) {
  const now = customDate ? new Date(customDate) : new Date();

  // Convert current time to Indian Standard Time (IST / Asia/Kolkata)
  const istDateString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const ist = new Date(istDateString);

  const dayOfWeek = ist.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const preMarketOpen = 9 * 60;        // 09:00 AM IST
  const regularOpen = 9 * 60 + 15;     // 09:15 AM IST
  const regularClose = 15 * 60 + 30;   // 03:30 PM IST

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isRegularSession = isWeekday && currentMinutes >= regularOpen && currentMinutes < regularClose;
  const isPreMarket = isWeekday && currentMinutes >= preMarketOpen && currentMinutes < regularOpen;
  const isOpen = isRegularSession;

  let session = "CLOSED";
  let statusText = "Market Closed";
  let badgeText = "NSE CLOSED";
  let nextOpenMessage = "";

  if (isRegularSession) {
    session = "REGULAR";
    statusText = "Market Open";
    badgeText = "NSE LIVE";
    const minsLeft = regularClose - currentMinutes;
    const hrs = Math.floor(minsLeft / 60);
    const mins = minsLeft % 60;
    nextOpenMessage = `Closes in ${hrs > 0 ? `${hrs}h ` : ""}${mins}m (at 03:30 PM IST)`;
  } else if (isPreMarket) {
    session = "PRE_MARKET";
    statusText = "Pre-Market Session";
    badgeText = "NSE PRE-OPEN";
    nextOpenMessage = "Regular trading starts at 09:15 AM IST";
  } else {
    session = "CLOSED";
    statusText = "Market Closed";
    badgeText = "NSE CLOSED";

    if (dayOfWeek === 5 && currentMinutes >= regularClose) {
      nextOpenMessage = "Opens Monday at 09:15 AM IST";
    } else if (dayOfWeek === 6) {
      nextOpenMessage = "Opens Monday at 09:15 AM IST";
    } else if (dayOfWeek === 0) {
      nextOpenMessage = "Opens Tomorrow at 09:15 AM IST";
    } else if (isWeekday && currentMinutes < regularOpen) {
      nextOpenMessage = "Opens Today at 09:15 AM IST";
    } else {
      nextOpenMessage = "Opens Tomorrow at 09:15 AM IST";
    }
  }

  const istFormatted = ist.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return {
    isOpen,
    session,
    statusText,
    badgeText,
    nextOpenMessage,
    dayName: dayNames[dayOfWeek],
    isWeekday,
    istTime: `${istFormatted} IST`,
    marketHours: "Monday - Friday: 09:15 AM to 03:30 PM IST",
  };
}

module.exports = { getIndianMarketStatus };
