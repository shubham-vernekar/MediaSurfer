import { React, useState, useEffect } from "react";
import "../../../static/css/debrid/DebridCard.css";
import { secondsToHHMMSS, getSize, secondsToTimestamp } from '../utils'
import axios from "axios";

const DebridCard = (props) => {
  const [favorite, SetFavorite] = useState(props.favorite);

  const HandleFavorite = (id, url, title, is_favourite) => {
    axios({
      method: "put",
      url: "/api/videos/debrid/" + id + "/update",
      data: {
        id: id,
        title: title,
        url: url,
        favourite: is_favourite,
      }
    }).then((response) => {
      let favStatus = Boolean(response.data.favourite)
      SetFavorite(favStatus)
    });
  };

  const HandleDelete = (id) => {
    axios({
      method: "delete",
      url: "/api/videos/debrid/" + id + "/delete",
    }).then((response) => {
      if (props.onDelete) {
        props.onDelete(id);
      }
    });
  };

  const OpenLocalPlayer = (debrid_link, videoID) => {
    axios({
        method: "get",
        url: "/api/debrid-files/open",
        params: {
          debrid_link: debrid_link,
          player: "pot"
        }
      });

    axios({
        method: "post",
        url: "/api/videos/debrid/" + videoID + "/viewincr",
        });
  };

  
  return (
    <div className={`debrid-card animate-background  ${favorite ? "debrid-card-favorite" : ""}`}>
      <div className="debrid-card-poster-container">
        <a href={"/debrid/player?id=" + props.vidid} target="_blank">
          <img src={props.poster} alt="Poster Image"/>
          {/* <img src={"https://img.freepik.com/premium-photo/watercolor-white-paper-texture_87555-17727.jpg?semt=ais_rp_progressive&w=740&q=80"} alt="Online Image"/>  */}
        </a>
      </div>
      {props.watchTime > 1 && (<div className="image-tag-container">
          {/* <div className="duration-tag debrid-duration-tag">{secondsToTimestamp(props.duration)}</div> */}
          <div className="duration-tag debrid-duration-tag">{secondsToHHMMSS(props.watchTime)}</div>
      </div>)}
      <div className="debrid-card-details-container">
        <div className="debrid-details-heading">
          {/* <div style={{"cursor": "pointer"}} onClick={() => window.open("/admin/videos/video/debrid/"+ props.vidid +"/change/", '_blank').focus()} >{Math.floor(props.duration / 60)} Mins</div> */}
          <div className='advert-views-box'> 
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V5z"/>
              <path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666c.92 0 1.667-.746 1.667-1.667v-.383a2.5 2.5 0 0 0 2-2.45V8h.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H14v-.5a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.254 0 10.333 0H5.667C4.747 0 4 .746 4 1.667zM4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3z"/>
            </svg>
            {/* {secondsToHHMMSS(props.watchTime)}  */}
            {secondsToTimestamp(props.duration)}
          </div>
          {props.badge && (<div>{props.badge}</div>)}
          {props.extention && (<div style={{"cursor": "pointer"}} onClick={() => OpenLocalPlayer(props.debrid_link, props.vidid)}>{props.extention.toUpperCase()}</div>)}
          <div className='advert-views-box'> 
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.5 0H5.914a1.5 1.5 0 0 0-1.06.44L2.439 2.853A1.5 1.5 0 0 0 2 3.914V14.5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0Zm-7 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2.75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Zm1.25-.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
            </svg>
            {getSize(props.size)} 
          </div>
          <div className='video-advert-button' onClick={() => {HandleFavorite(props.vidid, props.url, props.title, !favorite)}}> 
            {favorite && (<svg width="14" height="14" fill="currentColor" className='video-advert-button-text-svg' viewBox="0 0 16 16">
            <path d="M8.931.586 7 3l1.5 4-2 3L8 15C22.534 5.396 13.757-2.21 8.931.586ZM7.358.77 5.5 3 7 7l-1.5 3 1.815 4.537C-6.533 4.96 2.685-2.467 7.358.77Z"/>
            </svg>)}
            {!favorite && (<svg width="14" height="14" fill="currentColor" className='video-advert-button-text-svg' viewBox="0 0 16 16">
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
            </svg>)}
          </div>

          <div className='video-advert-button' onClick={() => {HandleDelete(props.vidid)}}> 
              <svg className='video-advert-button-text-svg' width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
              </svg>
          </div>

        </div>
        <div className="advert-details-title debrid-details-title">
          <span>{props.title}</span>
        </div>
      </div>
    </div>
  );
};

export default DebridCard;