import { React, useState, useEffect, useRef } from "react";
import "../../../static/css/pages/UpdatePage.css";
import axios from "axios";
import { getCookie } from "../utils";

function UpdatePage() {
  const [seedsData, SetSeedsData] = useState("");
  const [labelsData, SetLabelsData] = useState("");

  const directoriesTextRef = useRef(null);
  const labelsTextRef = useRef(null);
  const directoriesResultRef = useRef(null);
  const labelsResultRef = useRef(null);

  useEffect(() => {

    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 's') {
        if (document.activeElement.name == "directories" || document.activeElement.name == "labels"){
          e.preventDefault();
          saveText(document.activeElement.name)
        }
      }
    });

    axios({
      method: "get",
      url: "api/json",
    }).then((response) => {
      SetLabelsData(response.data["labels_data"]);
      SetSeedsData(response.data["seeds_data"]);
    });
  }, []);

  const saveText = (filename) => {
    let data = "";
    if (filename === "directories") {
      data = directoriesTextRef.current.value;
    } else if (filename === "labels") {
      data = labelsTextRef.current.value;
    }

    if (data) {
      axios({
        method: "post",
        url: "api/json",
        data: {
          filename: filename,
          data: data,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
      }).then((response) => {
        let textRef = "";
        let resultRef = "";
        if (filename === "directories") {
          textRef = directoriesTextRef;
          resultRef = directoriesResultRef;
        } else if (filename === "labels") {
          textRef = labelsTextRef;
          resultRef = labelsResultRef;
        }

        let status = response.data.status;
        if (status != "OK") {
          textRef.current.style.setProperty("color", "#ff7575");
          resultRef.current.style.setProperty("color", "#ff7575");
        } else {
          textRef.current.style.setProperty("color", "#d1d1d1");
          resultRef.current.style.setProperty("color", "#33cd08");
          setTimeout(
            function() {
              resultRef.current.innerText = "";
              resultRef.current.style.setProperty("color", "#d1d1d1");
            }, 10000);
        }

        resultRef.current.innerText = response.data.message;
      });
    }
  };

  return (
    <div className="update-page-container">
      <div className="directories-container">
        <div className="directories-header-container header-container">
          <div> Directories </div>
          <div className="save-button" onClick={() => saveText("directories")}>
            <svg fill="currentColor" viewBox="0 0 24 24" className="save-icon">
              <path d="M5 21h14a2 2 0 0 0 2-2V8l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zM7 5h4v2h2V5h2v4H7V5zm0 8h10v6H7v-6z" />
            </svg>
            <div className="save-text">SAVE</div>
          </div>
          <div className="save-result" ref={directoriesResultRef}></div>
        </div>
        <div className="data-container">
          <textarea
            name="directories"
            className="directories-data"
            defaultValue={seedsData}
            ref={directoriesTextRef}
          ></textarea>
        </div>
      </div>
      <div className="labels-container">
        <div className="labels-header-container header-container">
          <div> Labels </div>
          <div className="save-button" onClick={() => saveText("labels")}>
            <svg fill="currentColor" viewBox="0 0 24 24" className="save-icon">
              <path d="M5 21h14a2 2 0 0 0 2-2V8l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zM7 5h4v2h2V5h2v4H7V5zm0 8h10v6H7v-6z" />
            </svg>
            <div className="save-text">SAVE</div>
          </div>
          <div className="save-result" ref={labelsResultRef}>
            {" "}
          </div>
        </div>
        <div className="labels-container">
          <textarea
            name="labels"
            className="labels-data"
            defaultValue={labelsData}
            ref={labelsTextRef}
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default UpdatePage;
