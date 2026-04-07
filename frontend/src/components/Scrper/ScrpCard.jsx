import '../../../static/css/scrper/ScrpCard.css';
import axios from "axios";
import Spinner from "../utils/Spinner";
import { React, useRef, useEffect, useState } from "react";

function ScrpCard(props) {

  const [subsResult, SetSubsResult] = useState([]);
  const [loading, SetLoading] = useState(false);

  const copyToClipboard = (movie_id) => {
      navigator.clipboard.writeText(movie_id);
    };


   const handleOnClickDone = (file_path) => {
      axios({
        method: "post",
        url: "/api/webscr",
        data: {
          file_path: file_path,
        },
      }).then((response) => {
        if (response.data.status == "success") {
          location.reload();
        }
      });
    };
  
    const handleOnClickOpenFolder = (file_path) => {
      axios({
        method: "post",
        url: "/api/webscr",
        data: {
          file_path: file_path,
          open: "true",
        },
      });
    };
  
    const openGator = (movie_id) => {
      SetLoading(true)
      axios({
          method: "get",
          url: "/api/gator",
          params: {
            "movie_id": movie_id
          },
        }).then((response) => {
          SetLoading(false)
          
          if (response.data.download_link){
            const params = new URLSearchParams({
              url: response.data.download_link
            });
  
            if (response.data.subs) {
              params.append("subs", response.data.subs);
            }
  
            if (response.data.title) {
              params.append("title", response.data.title);
            }
            window.open(`/debrid/player?${params.toString()}`, '_blank');
          }else{
            console.log(response.data);
          }
        });
    };
  
    const saveSubs = (movie_id) => {
      SetLoading(true)
      SetSubsResult([]);
      axios({
          method: "post",
          url: "/api/dl-subs",
          data: {
            "movie_id": movie_id
          },
        }).then((response) => {
          SetLoading(false)
          SetSubsResult(response.data);
        });
    };
  
  

  return (
    <div className="scrp-card">
      <div className="scrp-card-img">
        <a
          href={props.trailer}
          className="scrp-links"
          target="_blank"
        >
          <img src={props.url}></img>
        </a>
      </div>
      <div className="scrp-card-details-container">
        <div className="scrp-card-title-main">{props.title}</div>
        <div className="scrp-card-details-main">
          <div
            className="scrp-card-mov-id"
            onClick={() => copyToClipboard(props.movie_id)}
          >
            {props.movie_id}
          </div>
          {props.release_date && <div>{props.release_date}</div>}

          <div>
            <a href={props.sub} className="scrp-card-links" target="_blank">
              Subtitle
            </a>
          </div>
          <div>
            <a
              href={props.video}
              className="scrp-card-links"
              target="_blank"
            >
              Video
            </a>
          </div>
          <div>
            <a
              className="scrp-btn"
              onClick={() => handleOnClickDone(props.file_path)}
            >
              <span className="scrp-btn-span scrp-btn-span-grey">Done</span>
            </a>
          </div>
          <div className='video-player-button' onClick={() => handleOnClickOpenFolder(props.file_path)}>  
            <img src="/static/images/folder.svg" width="30px" height="30px" ></img>
          </div>
          <div className='video-player-button' onClick={() => {openGator(props.movie_id)}}>  
            <img src="/static/images/television.png"  width="30px" height="30px" ></img>
          </div>
          <div className='video-player-button' onClick={() => {saveSubs(props.movie_id)}}>  
            <img src="/static/images/diskette.png"  width="26px" height="26px" ></img>
          </div>
        </div>
      </div>

      {subsResult.length > 0 && (
        <div className="scrp-list-subs-result">
          {subsResult.map((sub, i) => (
            <div key={i} className="scrp-subs-item">
              <span className={`scrp-subs-status ${sub.status === "Success" ? "ok" : "err"}`}>
                {sub.status}
              </span>
              <span className="scrp-subs-title">{sub.title}</span>
            </div>
          ))}
        </div>
      )}

      {loading && (
              <Spinner 
                visible = {loading}
                color = "#ff0000"
              />
            )}

    </div>
  );
}

export default ScrpCard;