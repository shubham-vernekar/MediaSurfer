import '../../../static/css/star/StarCard.css';
import { React, useRef, useEffect, useState } from "react";
import axios from "axios";

// ebc2ac - rose gold
// ffd700 -  gold
// f8f9fa - white

function StarCard(props) {

  const starCardRef = useRef(null);
  const [bannerImg, SetBannerImg] = useState("");
  const [liked, SetLiked] = useState(false);
  const [favourite, SetFavourite] = useState(false);

  const videoThemeDict = {
    "DEFAULT" : {
      "icon" : "",
      "theme": "#f8f9fa",
      "background": "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgb(49 47 47) 100%)",
      "glow": "#000",
      "textcolor": "#f8f9fa",
      "border": "#525252",
    },
    "LIKED" : {
      "icon" : "/static/images/fire.png",
      "theme": "#fbbf00",
      "background": "linear-gradient(0deg, rgba(255,131,0,1) 0%, rgba(255,221,0,1) 100%)",
      "glow": "#ff8e00",
      "textcolor": "#000",
      "border": "#000000",
    },
    "FAVOURITE" : {
      "icon" : "/static/images/star.svg",
      "theme": "#f20101",
      "background": "linear-gradient(to top, rgb(150 14 14) 0%, rgb(255 0 0) 100%)",
      "glow": "#e60303",
      "textcolor": "#f8f9fa",
      "border": "#000000",
    },
    "BOTH" : {
      "icon" : "/static/images/heart.png",
      "theme": "#ff00c0",
      "background": "linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #FFF800 100%)", 
      "glow": "#f71362",
      "textcolor": "#f8f9fa",
      "border": "#000000",
    }
  }

  useEffect(() => {
    SetLiked(props.liked);
    SetFavourite(props.favourite);
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
    starCardRef.current.style.boxShadow = "0px 18px 60px -33px " + videoThemeDict[key]["glow"]
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
        liked: isLiked,
      }
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
          <a href={"/search?cast=" + props.name}><img src={props.poster || "http://127.0.0.1/static/MediaSurf/media/stardata/65bNJrcmiZ/65bNJrcmiZ_poster_Fr9IXkt.jpg"} alt=""/></a>
        </div>
        <div className="star-details">
            <span className="star-title"> {props.name} </span>
            <div className="star-videos"> 
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm6.258-6.437a.5.5 0 0 1 .507.013l4 2.5a.5.5 0 0 1 0 .848l-4 2.5A.5.5 0 0 1 6 12V7a.5.5 0 0 1 .258-.437z"/>
              </svg>
              <span> {props.videos} </span>
            </div>
            <div className="star-views"> 
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
              <span> {props.views} </span>
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

              <div className="star-play">
                <div className="star-play-button" onClick={handleOnClickCastRandomButton} cast={props.name}>PLAY</div>
              </div>

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