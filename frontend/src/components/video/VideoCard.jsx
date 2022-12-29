import '../../../static/css/video/VideoCard.css';
import { React, useEffect, useRef, useState } from "react";
import { dateToTimestamp, secondsToHHMMSS, getSize } from '../utils'
import axios from "axios";

function VideoCard(props) {

  const [theme, SetTheme] = useState("");
  const [imageTag, SetImageTag] = useState("");
  const [glow, SetGlow] = useState(false);
  const [durationText, SetDurationText] = useState("");
  const [categories, SetCategories] = useState([]);
  const [cast, SetCast] = useState([]);
  const [progress, SetProgress] = useState(0);
  const [favorite, SetFavorite] = useState(props.favorite);
  const [progressText, SetProgressText] = useState("");
  
  const videoCardRef = useRef(null);
  const videoRef = useRef(null);
  const videoSourceRef = useRef(null);
  const progressBarRef = useRef(null);

  const videoThemeDict = {
    "DEFAULT" : {
      "icon" : "",
      "text": "#fff",
      "border": "#fff",
      "theme": "#fff",
      "glow": false,
      "background": "radial-gradient(circle, rgba(48,48,48,1) 0%, rgba(0,0,0,1) 100%)",
      "animate": true,
    },
    "WATCHED" : {
      "icon" : "/static/images/Watched.png",
      "text": "#fff",
      "border": "#fff",
      "theme": "#fff",
      "glow": false,
      // "background": "radial-gradient(circle, #2e89b5 0%, #071217 100%)",
      "background": "radial-gradient(circle, #247196 0%, #0e2129 100%)",
      "animate": true,
    },
    "NEW" : {
      "icon" : "/static/images/new_video.png",
      "text": "#fff",
      "border": "#fff",
      "theme": "#fff",
      "glow": false,
      "background": "radial-gradient(circle, rgba(236,20,20,1) 0%, rgba(65,12,12,1) 100%)",
      // "background": "linear-gradient(90deg, rgba(58,134,255,1) 0%, rgba(255,0,110,1) 35%, rgba(255,190,11,1) 100%)",
      "animate": true,
    },
    "FAVOURITE" : {
      "icon" : "/static/images/Favorite Icon.png",
      "text": "#fff",
      "border": "#fff",
      "theme": "#c5b8f8",
      "glow": "#bb3eff",
      "background": "linear-gradient(-225deg, #FF3CAC 0%, #562B7C 52%, #2B86C5 100%)",
      "animate": true,
    },
    "RECOMMENDED" : {
      "icon" : "/static/images/Recommended.png",
      "text": "#fff",
      "border": "#fff",
      "theme": "#fff",
      "glow": "#594ae5",
      "background": "linear-gradient(to right, #0f0c29, #302b63, #24243e)",
      "animate": true,
    }
  }

  const created = new Date(props.created);

  useEffect(() => {
    let videoTheme = videoThemeDict[props.specialTag] || videoThemeDict["DEFAULT"];
    if (videoTheme) {
      SetImageTag(videoTheme["icon"])
      SetTheme(videoTheme)
      if (props.specialTag!=="WATCHED") {
        SetGlow(true)
      }
    }

    let duration = props.duration.split(":");
    let h = parseInt(duration[0]);
    let m = parseInt(duration[1]);
    let s = parseInt(duration[2]);

    if (h > 0) {
      SetDurationText(h + " hrs " + m + " mins");
    } else {
      SetDurationText(m + " mins");
    }
  
    let durationInSeconds = h * 3600 + m * 60 + s;
    SetProgress(parseInt(props.progress) / durationInSeconds);

    if (props.progress){
      if (props.progress>durationInSeconds){
        SetProgress(1)
        SetProgressText("Watched");
      }else{
        SetProgressText(parseInt(parseInt(props.progress)/60) + " of " + parseInt(parseInt(durationInSeconds)/60) + "m");
      }
    }

    if (props.categories){
      SetCategories(props.categories.split(",").filter(Boolean).slice(0, 4));
    }
    
    if (props.cast){
      SetCast(props.cast.split(",").filter(Boolean).slice(0, 4));
    }

  }, [props]);

  useEffect(() => {
    if (progressBarRef.current){
      progressBarRef.current.style.setProperty("width", progress * 100 + "%")
    }
  }, [progress]);

  useEffect(() => {
    videoCardRef.current.style.setProperty(
      "--video-card-text-color",
      theme["text"]
    );
    videoCardRef.current.style.setProperty(
      "--video-card-border-color",
      theme["border"]
    );
    videoCardRef.current.style.setProperty(
      "--video-card-theme",
      theme["theme"]
    );
    videoCardRef.current.style.setProperty(
      "--video-card-background",
      theme["background"]
    );
    videoCardRef.current.style.setProperty(
      "--video-card-glow",
      theme["glow"]
    );

    if (theme["animate"]){
      videoCardRef.current.classList.add("animate-background");
    }

    if (glow){
      videoCardRef.current.style.boxShadow = "0px 18px 60px -33px  var(--video-card-glow)"
    }
  }, [theme, glow]);

  const handleMouseEnter = (e) => {
      videoSourceRef.current.setAttribute('src', props.preview)
      videoRef.current.load()
      videoRef.current.play(); 
      videoRef.current.volume = 0.2;
  };

  const handleMouseLeave = (e) => {
    videoRef.current.pause()
    // videoRef.current.currentTime = 0;
    videoRef.current.currentTime = 0;
    videoRef.current.load();
  };

  const handleOnClickPlayerButton = (e) => {
    axios({
      method: "post",
      url: "/api/videos/" + e.target.getAttribute("vidid") + "/open",
    });
  };

  const handleOnClickFolderButton = (e) => {
    axios({
      method: "post",
      url: "/api/videos/" + e.target.getAttribute("vidid") + "/folder",
    });
  };

  const handleOnClickDeleteButton = (e) => {
    axios({
      method: "post",
      url: "/api/videos/" + e.target.getAttribute("vidid") + "/localdelete",
    }).then((response) => {
      if (response.data["Status"]=="Success"){
        let target = e.target
        while (target.parentNode) {
          if(target && target.getAttribute("class") && target.getAttribute("class").includes("video-card")){
            target.remove();
            break
          }
          target = target.parentNode;
        }
      }
    });
  };

  const addFavoriteButton = (vidID, vidTitle, vidFavourite) => {
    axios({
      method: "put",
      url: "/api/videos/" + vidID + "/update",
      data: {
        id: vidID,
        title: vidTitle,
        favourite: vidFavourite,
      }
    }).then((response) => {
      let favStatus = Boolean(response.data.favourite)
      SetFavorite(favStatus)
      if (!favStatus){
        let videoTheme = videoThemeDict[response.data.special_tag] || "";
        if (videoTheme) {
          SetImageTag(videoTheme["icon"])
          SetTheme(videoTheme)
          if (props.specialTag!=="WATCHED") {
            SetGlow(true)
          }
        }else{
          SetGlow(false)
          SetImageTag("")
          SetTheme(videoThemeDict["DEFAULT"])
        }
      }else{
        SetGlow(true)
        SetTheme(videoThemeDict["FAVOURITE"])
        SetImageTag(videoThemeDict["FAVOURITE"]["icon"])
      }
    });
  };

  const handleOnClickCastRandomButton = (clickedCast) => {
    axios({
      method: "get",
      url: "/api/videos",
      params: {
        cast: clickedCast.castName,
        sort_by: "?",
        limit: 1
      },
    }).then((response) => {
      if (response.data.results.length > 0){
        window.open("/player/"+response.data.results[0].id, '_blank');
      }
    });
  };

  const handleOnClickCategoryRandomButton = (clickedCategory) => {
    axios({
      method: "get",
      url: "/api/videos",
      params: {
        categories: clickedCategory.categoryName,
        sort_by: "?",
        limit: 1
      },
    }).then((response) => {
      if (response.data.results.length > 0){
        window.open("/player/"+response.data.results[0].id, '_blank');
      }
    });
  };

  return (
    <div className="video-card" ref={videoCardRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="preview-video-container">
          <div className="preview-video-box">
            <a href={"/player/" + props.vidid} target="_blank">
              <video
                className="preview-video"
                preload="auto"
                loop
                poster={props.previewThumbnail}
                ref={videoRef}
              >
                <source ref={videoSourceRef}  src="" type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            </a>
          </div>
      </div>
      <div className="image-tag-container">
          {imageTag && (<img src={imageTag} className="image-tag" alt="" />)}
          <div className="duration-tag">{dateToTimestamp(props.duration)}</div>
          {props.subtitleBadge && (<div className="subtitle-tag">SRT</div>)}
      </div>
        
      <div className="advert-details">
        
        <div className="advert-details-heading">
          <div>
            {created
              .toLocaleString("default", { month: "short" })
              .toUpperCase()} {" "} 
            {created.getFullYear()}
          </div>
          <div>{durationText}</div>
          <div className='advert-views-box'> 
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V5z"/>
              <path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666c.92 0 1.667-.746 1.667-1.667v-.383a2.5 2.5 0 0 0 2-2.45V8h.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H14v-.5a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.254 0 10.333 0H5.667C4.747 0 4 .746 4 1.667zM4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3z"/>
            </svg>
            {secondsToHHMMSS(props.watchTime)} 
          </div>
          {props.badge && (<div>{props.badge}</div>)}
          <div className='advert-views-box'> 
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.5 0H5.914a1.5 1.5 0 0 0-1.06.44L2.439 2.853A1.5 1.5 0 0 0 2 3.914V14.5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0Zm-7 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2.75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Zm1.25-.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
            </svg>
            {getSize(props.size)} 
          </div>
        </div>
        <div className="advert-details-title">
          <span>{props.title}</span>
        </div>
        <div className="cast-container" >
          {cast.map((castName, i) => (
            <div key={i} className="cast-block">
              <a href={"/search?cast=" + castName} target="_blank">{castName}</a>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16" onClick={() => handleOnClickCastRandomButton({castName})}>
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/> 
              </svg>
            </div>
          ))}
        </div> 
        <div className="category-container">
          {categories.map((categoryName, i) => (
            <div key={i} className="category-block">
              <a href={"/search?category=" + categoryName} target="_blank">{categoryName}</a>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16" onClick={() => handleOnClickCategoryRandomButton({categoryName})}>
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/> 
              </svg>
            </div>
          ))}
        </div>
        <div className="video-advert-buttons-container">
          <div className='video-advert-button'> 
            <svg className='video-advert-button-text-svg' width="18" height="18" fill="currentColor" viewBox="0 0 16 16" onClick={handleOnClickPlayerButton} vidid={props.vidid}>
              <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
            </svg>
            <span className='video-advert-button-text' onClick={handleOnClickPlayerButton} vidid={props.vidid}>Open Player</span>
          </div>
          <div className='video-advert-button'> 
            <svg className='video-advert-button-text-svg' width="18" height="18" fill="currentColor" viewBox="0 0 16 16" onClick={handleOnClickDeleteButton} vidid={props.vidid}>
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
            </svg>
            <span className='video-advert-button-text' onClick={handleOnClickDeleteButton} vidid={props.vidid}>Delete Video</span>
          </div>
          <div className='video-advert-button'> 
            <svg className='video-advert-button-text-svg' width="18" height="18" fill="currentColor" viewBox="0 0 16 16" onClick={handleOnClickFolderButton} vidid={props.vidid}>
              <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
            </svg>
            <span className='video-advert-button-text' onClick={handleOnClickFolderButton} vidid={props.vidid}>Open Folder</span>
          </div>
          <div className='video-advert-button' onClick={() => {addFavoriteButton(props.vidid, props.title, !favorite)}}> 
            {favorite && (<svg width="16" height="16" fill="currentColor" className='video-advert-button-text-svg' viewBox="0 0 16 16">
              <path d="M8.931.586 7 3l1.5 4-2 3L8 15C22.534 5.396 13.757-2.21 8.931.586ZM7.358.77 5.5 3 7 7l-1.5 3 1.815 4.537C-6.533 4.96 2.685-2.467 7.358.77Z"/>
            </svg>)}
            {!favorite && (<svg width="16" height="16" fill="currentColor" className='video-advert-button-text-svg' viewBox="0 0 16 16">
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
            </svg>)}
            {favorite && (<span className='video-advert-button-text'>Del Favorite</span>)}
            {!favorite && (<span className='video-advert-button-text'>Add Favorite</span>)}
          </div>
        </div>
        {progress > 0 && (
          <div className="progress-bar">
            <div className="progress-bar-total">
              <div
                className="progress-bar-current"
                ref={progressBarRef}
              ></div>
            </div>
            <div className="progress-bar-text">
                {progressText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
