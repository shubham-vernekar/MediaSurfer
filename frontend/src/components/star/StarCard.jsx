import '../../../static/css/star/StarCard.css';
import { React, useRef, useEffect, useState } from "react";
import axios from "axios";
import { getCookie, getDurationText } from '../utils'

// ebc2ac - rose gold
// ffd700 -  gold
// f8f9fa - white

function StarCard(props) {

  const starCardRef = useRef(null);
  const [bannerImg, SetBannerImg] = useState("");
  const [liked, SetLiked] = useState(false);
  const [favourite, SetFavourite] = useState(false);
  const [watchTimeText, SetWatchTimeText] = useState("");
  const [totalTimeText, SetTotalimeText] = useState("");

  const videoThemeDict = {
    "DEFAULT" : {
      "icon" : "",
      "theme": "#00000096",
      "background": "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgb(49 47 47) 100%)",
      "glow": "#000",
      "textcolor": "#f8f9fa",
      "border": "#525252",
    },
    "LIKED" : {
      "icon" : "/static/images/fire.png",
      "theme": "#ffdc00",
      "background": "linear-gradient(0deg, rgba(255,131,0,1) 0%, rgba(255,221,0,1) 100%)",
      "glow": "#ff8e00",
      "textcolor": "#000",
      "border": "#000000",
    },
    "FAVOURITE" : {
      "icon" : "/static/images/star.svg",
      "theme": "#f90101",
      "background": "linear-gradient(to top, rgb(150 14 14) 0%, rgb(255 0 0) 100%)",
      "glow": "#e60303",
      "textcolor": "#f8f9fa",
      "border": "#000000",
    },
    "BOTH" : {
      "icon" : "/static/images/heart.png",
      "theme": "#93156a",
      "background": "linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #FFF800 100%)", 
      "glow": "#f71362",
      "textcolor": "#f8f9fa",
      "border": "#000000",
    }
  }

  useEffect(() => {    
    SetLiked(props.liked);
    SetFavourite(props.favourite);
    if (props.watchtime && parseInt(props.watchtime)>60){
      // SetWatchTimeText(getDurationText(new Date(parseInt(props.watchtime) * 1000).toISOString().slice(11, 19)));
      SetWatchTimeText(getDurationText(props.watchtime));
    }
    if (props.totaltime && parseInt(props.totaltime)>60){
      SetTotalimeText(getDurationText(props.totaltime));
    } else {
      SetTotalimeText("No Videos")
    }
  }, [props]);

  useEffect(() => {
    let key = "DEFAULT"
    if (liked && favourite) {
      key = "BOTH"
    } else if (liked) {
      key = "LIKED"
    } else if (favourite) {
      key = "FAVOURITE"
    }
    SetBannerImg(videoThemeDict[key]["icon"])
    starCardRef.current.style.setProperty("--star-card-text-color", videoThemeDict[key]["textcolor"]);
    starCardRef.current.style.setProperty("--star-card-border-color", videoThemeDict[key]["border"]);
    starCardRef.current.style.setProperty("--star-card-background", videoThemeDict[key]["background"]);
    starCardRef.current.style.setProperty("--star-card-theme", videoThemeDict[key]["theme"]);
    // starCardRef.current.style.boxShadow = "0px 1em 3em -2em " + videoThemeDict[key]["glow"]
  }, [liked, favourite]);

  const handleOnClickCastRandomButton = (e) => {
    axios({
      method: "get",
      url: "/api/videos",
      params: {
        cast: e.target.getAttribute("cast") || "empty",
        sort_by: "?",
        limit: 1
      },
    }).then((response) => {
      if (response.data.results.length > 0){
        window.open("/player/"+response.data.results[0].id, '_blank');
      }
    });
  };

  const updateStarState = (id, name, isFavourite, isLiked) => {
    axios({
      method: "put",
      url: "/api/stars/" + id + "/update",
      data: {
        id: id,
        name: name,
        favourite: isFavourite,
        liked: isLiked
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
      SetLiked(response.data.liked);
      SetFavourite(response.data.favourite);
    });
  };

  return (
    <div className="star-card" ref={starCardRef}>
        <div className="star-banner" >
            <img src={bannerImg} alt="" width="45"/>
        </div>
        <div className="star-poster">
          <a href={"/search?cast=" + props.name}><img src={props.poster} alt=""/></a>
        </div>
        <div className="star-watch-time-container">
          {watchTimeText && (<div className="star-watch-time">
            {watchTimeText}
          </div>)}
        </div>
        <div className="star-details">
            <span className="star-title"> {props.name} </span>
            <div className="star-info">
              <div className="star-videos" onClick={() => window.open("/admin/stars/star/"+ props.id +"/change/", '_blank').focus()}> 
                <div> 
                  {props.videos} <span className="star-videos-label">Videos</span> 
                </div>
                <div className="total-time-text"> {totalTimeText} </div>
              </div>
              <div className="star-views"> 
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
                <span> {props.views} </span>
              </div>
            </div>
            
            <div className="star-buttons-container">

              {!liked && (
                <div className="star-favourite-button star-button" onClick={() => {updateStarState(props.id, props.name, favourite, !liked)}}>
                  <img src="/static/images/burn-fire.svg" alt="" /> 
                </div>
              )}

              {liked && (
                <div className="star-favourite-button star-button" onClick={() => {updateStarState(props.id, props.name, favourite, !liked)}}>
                  <img src="/static/images/no-fire.svg" alt="" />
                </div>
              )}

              <div className="star-play-button" onClick={handleOnClickCastRandomButton} cast={props.name}>PLAY</div>

              {!favourite && (
                <div className="star-liked-button star-button" onClick={() => {updateStarState(props.id, props.name, !favourite, liked)}}>
                  <img src="/static/images/like-add.svg" alt="" /> 
                </div>
              )}

              {favourite && (
                <div className="star-liked-button star-button" onClick={() => {updateStarState(props.id, props.name, !favourite, liked)}}>
                  <img src="/static/images/like-remove.svg" alt="" />
                </div>
              )}
              
            </div>
        </div>
        
    </div>
  );
}

export default StarCard;