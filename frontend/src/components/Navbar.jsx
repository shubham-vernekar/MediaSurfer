import "../../static/css/navbar.css";
import { React, useState, useEffect } from "react";
import axios from "axios";

function Navbar(props) {
  const [navbarData, setNavbarData] = useState([]);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/navbar",
    }).then((response) => {
      setNavbarData(response.data["results"]);
    });
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo-img" src="static/images/logo.png" alt="" />
        {navbarData.map((data, i) => (
          <a
            key={i}
            href={data["url"]}
            className="navbar-items"
            target={data["target"]}
          >
            {" "}
            {data["text"]}{" "}
          </a>
        ))}
      </div>

      <div className="navbar-right">
        <div className="navbar-search-box">
          <form action="" method="">
            <input type="search" placeholder="What are you looking for?" />
            <button>Search</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
