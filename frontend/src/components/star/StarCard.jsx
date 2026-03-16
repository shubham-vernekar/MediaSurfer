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

  // Cool Mint - background: linear-gradient(135deg, #e0c3fc, #8ec5fc);
  // Light Lavender - background: linear-gradient(135deg, #e0c3fc, #8ec5fc);
  // Mint Sky Blue - background: linear-gradient(135deg, #b2fefa, #a1c4fd);
  // Light Lavender Soft Blue - background: linear-gradient(135deg, #d4b5ff, #8fd3f4);

  // background-image: linear-gradient(to bottom right, #38A2D7, #561139);
  // background-image: linear-gradient(to bottom right, #121C84, #8278DA);
  // background-image: linear-gradient(to bottom right, #5761B2, #1FC5A8);
  // background-image: linear-gradient(to right, #0f0c29, #302b63, #24243e);
  // background-image: linear-gradient(to right, #141e30, #243b55);
  // background: linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%);
  // background: linear-gradient(90deg, hsla(213, 77%, 14%, 1) 0%, hsla(202, 27%, 45%, 1) 100%);
  // background: linear-gradient(90deg, hsla(205, 46%, 30%, 1) 0%, hsla(260, 29%, 36%, 1) 100%);
  // background: linear-gradient(90deg, hsla(208, 33%, 21%, 1) 0%, hsla(211, 36%, 46%, 1) 100%);
  // ** background: linear-gradient(90deg, hsla(205, 46%, 10%, 1) 0%, hsla(191, 28%, 23%, 1) 50%, hsla(207, 41%, 27%, 1) 100%);


  // background-image: linear-gradient(100deg, rgb(255, 255, 255) 10%, rgb(0, 6, 47) 100%), linear-gradient(120deg, rgb(255, 65, 65) 30%, rgb(0, 28, 100) 110%), radial-gradient(100% 220% at 100% 0%, rgb(128, 0, 255) 0%, rgb(255, 255, 255) 30%, rgb(0, 160, 255) 100%), linear-gradient(60deg, rgb(34, 0, 242) 0%, rgb(83, 0, 0) 100%), linear-gradient(190deg, rgb(185, 0, 255) 0%, rgb(0, 136, 123) 90%), linear-gradient(180deg, rgb(252, 0, 0) 0%, rgba(0, 50, 255, 1) 75%), linear-gradient(220deg, rgba(255, 0, 250, 1) 0%, rgb(255, 223, 0) 70%), radial-gradient(80% 110% at 50% 0%, rgb(2, 1, 1) 0%, rgb(0, 52, 187) 100%);
  // background-blend-mode: overlay, overlay, color-burn, screen, color-burn, difference, color-dodge, normal;

  // background-image: linear-gradient(120deg, #FF0000 0%, #2400FF 100%), linear-gradient(120deg, #FA00FF 0%, #208200 100%), linear-gradient(130deg, #00F0FF 0%, #000000 100%), radial-gradient(110% 140% at 15% 90%, #ffffff 0%, #1700A4 100%), radial-gradient(100% 100% at 50% 0%, #AD00FF 0%, #00FFE0 100%), radial-gradient(100% 100% at 50% 0%, #00FFE0 0%, #7300A9 80%), linear-gradient(30deg, #7ca304 0%, #2200AA 100%);
  // background-blend-mode: overlay, color, overlay, difference, color-dodge, difference, normal;
  // https://csspro.com/css-gradients/

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