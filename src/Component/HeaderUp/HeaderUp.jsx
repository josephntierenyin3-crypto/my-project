import { useEffect, useState,  } from "react";

import "./HeaderUp.css";

const HeaderUp = () => {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="topbar">
      {/* LEFT SIDE */}
      <div className="topbar-left">
        <span>Sun - Fri | 8:00 - 7:00</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="topbar-right">
        <span>📞 +00 56 98 46</span>
        <span className="line"></span>
        <span>{formattedDate}</span>

        <select>
          <option>English</option>
          <option>French</option>
          <option>Spanish</option>
        </select>
      </div>
    </div>
  );
};

export default HeaderUp;
