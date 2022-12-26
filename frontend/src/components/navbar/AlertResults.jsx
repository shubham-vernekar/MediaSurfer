import { React, useState, useEffect, useRef } from "react";
import "../../../static/css/navbar/AlertResults.css";
import axios from "axios";
import PacmanLoader from "react-spinners/PacmanLoader";

const AlertResults = (props) => {
  const [alertResultsData, SetAlertResultsData] = useState([]);
  const [showLoader, SetShowLoader] = useState(false);
  const [showResults, SetShowResults] = useState(false);

  useEffect(() => {
    SetShowResults(props.showAlertDetails)
    if (props.showAlertDetails){
      SetShowLoader(true)
      axios({
        method: "get",
        url: "/api/pending",
        params: {
          get_data: "true",
        },
      }).then((response) => {
        SetAlertResultsData(response.data[props.query]);
        SetShowResults(true)
        SetShowLoader(false)
      });
    }
  }, [props]);

  const openFolder = (data) => {
    axios({
      method: "post",
      url: "/api/openfolder",
      data: {
        file: data,
      }
    });
  };

  return (
    <div>
      {showResults && alertResultsData.length>0 && (<div className="alert-results-container">
        <div className="alert-results">
          {alertResultsData.map((data, i) => (
            <div key={i} className="alert-results-data" onClick={() => {openFolder(data)}}>
              <div className="alert-results-text" >{data}</div>
              <div>
                <svg className="alert-results-icon" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>)}
      {alertResultsData.length<1 && (
        <div className="alert-results-loader">
          <PacmanLoader color="#f8f9fa" loading={showLoader} size={10}/>
        </div>
      )}
    </div>
  );
};

export default AlertResults;
