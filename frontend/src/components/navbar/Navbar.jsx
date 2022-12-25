import "../../../static/css/navbar/Navbar.css";
import SearchRecommendations from "./SearchRecommendations";
import { React, useState, useEffect, useRef } from "react";
import axios from "axios";

function Navbar(props) {
  const [navbarData, setNavbarData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [alertMsg, setAlertMsg] = useState(false);
  const [scanMsg, setScanMsg] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/navbar",
    }).then((response) => {
      setNavbarData(response.data["results"]);
    });

    getPending();

    const interval = setInterval(() => {
      getPending();
    }, 10000);
    return () => clearInterval(interval);

  }, []);

  const getPending = () => {
    axios({
      method: "get",
      url: "/api/pending",
    }).then((response) => {
      if (parseInt(response.data.pending)>0){
        setScanMsg(response.data.pending + " new videos");
      }
      if (parseInt(response.data.unsupported)>0){
        setAlertMsg(response.data.unsupported + " unsupported videos");
      }
    });
  };

  const onSearchTextChange = (e) => {
    setSearchText(e.currentTarget.value);
  };

  const searchSubmit = (e) => {
    e.preventDefault()
    if (searchInputRef.current.value){
      window.location.href = "/search?query=" + searchInputRef.current.value
    }
  };

  const scanLocalVideos = (e) => {
    axios({
      method: "post",
      url: "/api/scan"
    });
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo-img" src="/static/images/logo.png" alt="" />
        {navbarData.map((data, i) => (
          <a
            key={i}
            href={data["url"]}
            className="navbar-items"
            target={data["target"]}
          >
            {data["text"]}
          </a>
        ))}
      </div>

      <div className="navbar-right">
        <div className="scanner-container">

          <div className="navbar-populate" onClick={scanLocalVideos}>
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
              <path d="M13.5 10a.5.5 0 0 1 .5.5V12h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V13h-1.5a.5.5 0 0 1 0-1H13v-1.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
            {scanMsg && (<div>
              <div className="scan-alert-icon"></div>
              <div className="scan-msg-text">
                {scanMsg}
              </div>
            </div>)}
          </div>

          {alertMsg && (<div className="alert-msg-box">
            <img className="alert-msg-icon" src="/static/images/alert.svg" alt="" />
            <div className="alert-msg-text">
              {alertMsg}
            </div>
          </div>)}

        </div>

        <div className="navbar-search-box">
          <form onSubmit={searchSubmit}>
            <input
              type="search"
              placeholder="What are you looking for?"
              onChange={onSearchTextChange}
              ref={searchInputRef}
            />
            <button>Search</button>
          </form>
        </div>
        <SearchRecommendations
          searchText = {searchText}
        />
      </div>
    </div>
  );
}

export default Navbar;
