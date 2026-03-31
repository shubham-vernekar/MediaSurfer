import { React, useState, useEffect } from "react";
import "../../../static/css/debrid/DebridAddURLBox.css";

const DebridAddURLBox = (props) => {
  const [value, setValue] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      window.location.replace("/debrid/player?url=" + value);
    }
  };

  return (
    <div className="debrid-input-container">
        <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a URL and press Enter..."
            className="debrid-url-input"
        />
    </div>
  );
};

export default DebridAddURLBox;