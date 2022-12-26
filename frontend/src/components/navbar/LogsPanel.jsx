import { React, useState, useEffect, useRef } from "react";
import "../../../static/css/navbar/LogsPanel.css";
import axios from "axios";

const LogsPanel = (props) => {
  const [logsData, SetLogsData] = useState("");
  const [showLogs, SetShowLogs] = useState(false);

  const logsTextAreaRef = useRef(null);

  useEffect(() => {
    SetShowLogs(props.showLogs)

    getLogs();
    const interval = setInterval(() => {
      getLogs();
    }, 5000);
    return () => clearInterval(interval);

  }, [props]);

  useEffect(() => {
    getLogs();
  }, [showLogs]);

  useEffect(() => {
    if (logsTextAreaRef.current){
      if ((logsTextAreaRef.current.scrollHeight - logsTextAreaRef.current.scrollTop) < 900 || logsTextAreaRef.current.scrollTop==0){
        logsTextAreaRef.current.scrollTop = logsTextAreaRef.current.scrollHeight;
      }
    }
  }, [logsData]);

  const getLogs = () => {
    if (showLogs) {
      axios({
        method: "get",
        url: "/api/scan/logs",
        params: {
          lines: 1000,
        },
      }).then((response) => {
        SetLogsData(response.data.data);
      });
    }
  };

  const closeLogResults = () => {
    SetShowLogs(false)
    props.closeLogResultsCallback()
  };


  return (
    <div className="logs-results-box">
      {showLogs && (
      <div className="logs-results-container">
        <div className="logs-results">
          <textarea
            name="logs"
            className="logs-results-data"
            value={logsData}
            readOnly
            ref={logsTextAreaRef}
          ></textarea>
        </div>
        <img src="/static/images/close.svg" alt="" className="scan-logs-close" onClick={closeLogResults}/> 
      </div>
      )}
    </div>
  );
};

export default LogsPanel;
