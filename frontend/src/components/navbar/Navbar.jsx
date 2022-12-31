import "../../../static/css/navbar/Navbar.css";
import SearchRecommendations from "./SearchRecommendations";
import AlertResults from "./AlertResults";
import LogsPanel from "./LogsPanel";
import { React, useState, useEffect, useRef } from "react";
import axios from "axios";
import HashLoader from "react-spinners/HashLoader";
import { getCookie } from "../utils";

function Navbar(props) {
  const [navbarData, SetNavbarData] = useState([]);
  const [searchText, SetSearchText] = useState("");
  const [alertMsg, SetAlertMsg] = useState(false);
  const [scanMsg, SetScanMsg] = useState(false);
  const [showAlertMsg, SetShowAlertMsg] = useState(false);
  const [showAlertDetails, SetShowAlertDetails] = useState(false);
  const [isScanning, SetIsScanning] = useState(false);

  const [showScanMsg, SetShowScanMsg] = useState(false);
  const [showLogs, SetShowLogs] = useState(false);

  const searchInputRef = useRef(null);
  const alertMsgTextRef = useRef(null);
  const scanMsgTextRef = useRef(null);
  const populateButtonRef = useRef(null);

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/navbar",
    }).then((response) => {
      SetNavbarData(response.data["results"]);
    });

    getPending();

    const interval = setInterval(() => {
      getPending();
    }, 10000);
    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    if (alertMsgTextRef.current){
      if (showAlertMsg) {
        alertMsgTextRef.current.style.maxWidth = "600px"
      }else{
        if (!showAlertDetails){
          alertMsgTextRef.current.style.maxWidth = "0px"
        }
      }
    }
  }, [showAlertMsg]);

  useEffect(() => {
    if (scanMsgTextRef.current){
      if (showScanMsg) {
          scanMsgTextRef.current.style.maxWidth = "600px"
      }else{
        if (!showLogs){
          scanMsgTextRef.current.style.maxWidth = "0px"
        }
      }
    }
  }, [showScanMsg]);


  useEffect(() => {
    if (isScanning){
      SetScanMsg("Scanning")
    }
  }, [isScanning]);

  const closeAlertResultsCallback = () => {
    alertMsgTextRef.current.style.maxWidth = "0px"
    SetShowAlertDetails(false)
  };

  const closeLogResultsCallback = () => {
    scanMsgTextRef.current.style.maxWidth = "0px"
    SetShowLogs(false)
  };

  const getPending = () => {
    populateButtonRef.current.style.color = "inherit"
    axios({
      method: "get",
      url: "/api/pending",
    }).then((response) => {
      if (parseInt(response.data.pending_count)>0){
        SetScanMsg(response.data.pending)
        scanMsgTextRef.current.classList.add("alert-text-color")
      }else if (parseInt(response.data.pending_count)===0){
        SetScanMsg("No videos pending")
        scanMsgTextRef.current.classList.remove("alert-text-color")
      }
      if (parseInt(response.data.unsupported_count)>0){
        SetAlertMsg(response.data.unsupported)
      }
      SetIsScanning(response.data.scanning)
    });
  };

  const onSearchTextChange = (e) => {
    SetSearchText(e.currentTarget.value);
  };

  const searchSubmit = (e) => {
    e.preventDefault()
    if (searchInputRef.current.value){
      window.location.href = "/search?query=" + searchInputRef.current.value
    }
  };

  const scanLocalVideos = (e) => {
    SetIsScanning(true)
    scanMsgTextRef.current.classList.add("alert-text-color")
    axios({
      method: "post",
      url: "/api/scan",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
      if(response.data.Status == "Scanning Complete"){
        SetIsScanning(false)
      }
      SetScanMsg(response.data.Status);
      scanMsgTextRef.current.classList.remove("alert-text-color")
    }).catch((error) => {
      populateButtonRef.current.style.color = "red"
      SetScanMsg(error.response.data.detail);
    });
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo-img" src="static/images/logo.svg" alt="" onClick={() => window.location.href="/" } />
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
          <div className="navbar-populate" ref={populateButtonRef} onMouseEnter={() => {SetShowScanMsg(true)}} onMouseLeave={() => {SetShowScanMsg(false)}}>
            {!isScanning && (<svg fill="currentColor" viewBox="0 0 16 16" onClick={scanLocalVideos}>
              <path d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
              <path d="M13.5 10a.5.5 0 0 1 .5.5V12h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V13h-1.5a.5.5 0 0 1 0-1H13v-1.5a.5.5 0 0 1 .5-.5z"/>
            </svg>)}

            {isScanning && (<div className="scan-results-loader">
              <HashLoader color="#f8f9fa" loading={isScanning} size={20}/>
            </div>)}

            <div className="scan-alert-container">
              {!isScanning && scanMsg && scanMsg!= "No videos pending" && scanMsg!= "Scanning Complete" && (
                <div className="scan-alert-icon"></div>
              )}
              <div className="scan-msg-text alert-text-color" ref={scanMsgTextRef} onClick={() => {SetShowLogs(!showLogs)}}>
                {scanMsg}
              </div>
            </div>
            
          </div>
          {showLogs && (<LogsPanel
            showLogs = {showLogs}
            closeLogResultsCallback = {closeLogResultsCallback}
          />)}

          {alertMsg && (
          <div className="alert-msg-box-container">
            <div className="alert-msg-box" onMouseEnter={() => {SetShowAlertMsg(true)}} onMouseLeave={() => {SetShowAlertMsg(false)}} onClick={() => {SetShowAlertDetails(!showAlertDetails)}} >
              <img className="alert-msg-icon" src="/static/images/alert.svg" alt="" />
              <div className="alert-msg-text alert-text-color" ref={alertMsgTextRef}>
                {alertMsg}
              </div>
            </div>
            <AlertResults
                query = {"unsupported_videos"}
                showAlertDetails = {showAlertDetails}
                closeAlertResultsCallback = {closeAlertResultsCallback}
              />
          </div>
          )}
          <a href="/update" target="_blank" className="navbar-update-btn">
            <img src="/static/images/update.svg" alt="" />
          </a>
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
