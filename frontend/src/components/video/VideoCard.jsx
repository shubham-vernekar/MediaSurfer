import '../../../static/css/video/VideoCard.css';
import { React, useEffect, useRef } from "react";
import { dateToTimestamp } from '../utils'

function VideoCard(props) {

  const videoCardRef = useRef(null);
  const videoRef = useRef(null);
  const videoSourceRef = useRef(null);

  const videoThemeDict = {
    "WATCHED" : ["/static/images/Watched.png", "#99d3ff"],
    "NEW" : ["/static/images/new_video.png", "#ebc2ac"],
    "FAVOURITE" : ["/static/images/Favorite Icon.png", "#ff6b87"],
    "RECOMMENDED" : ["/static/images/Recommended.png", "#f2c73d"], //#ebbb24
  }

  let videoTheme = videoThemeDict[props.specialTag] || "";
  let imageTag = ""
  let theme = ""
  let glow = false

  if (videoTheme) {
    imageTag = videoTheme[0]
    theme = videoTheme[1]
    if (props.specialTag!=="WATCHED") {
      glow = true
    }
    
  }

  let duration = props.duration.split(":");
  let durationText = "";
  let h = parseInt(duration[0]);
  let m = parseInt(duration[1]);
  let s = parseInt(duration[2]);

  let durationInSeconds = h * 3600 + m * 60 + s;
  let progress = parseInt(props.progress) / durationInSeconds;
  let progressBarStyle = {
    width: progress * 100 + "%",
  };

  const created = new Date(props.created);

  let category = []
  if (props.categories){
    category = props.categories.split(",");
  }
  
  let cast = []
  if (props.cast){
    cast = props.cast.split(",");
  }


  if (h > 0) {
    durationText = h + " hrs " + m + " mins";
  } else {
    durationText = m + " mins";
  }

  useEffect(() => {
    videoCardRef.current.style.setProperty(
      "--video-card-theme",
      theme
    );
    if (glow){
      videoCardRef.current.style.boxShadow = "0px 18px 60px -33px  var(--video-card-theme)"
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
  };

  const handleOnClickFolderButton = (e) => {
  };

  const handleOnClickDeleteButton = (e) => {
  };

  const handleOnClickCastRandomButton = (e) => {
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
          <img src={imageTag} className="image-tag" alt="" />
          <div className="duration-tag">{dateToTimestamp(props.duration)}</div>
          {props.subtitle_badge && (<div className="subtitle-tag">SRT</div>)}
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
          <div>{props.badge}</div>
          <div>{props.specialTag}</div>
        </div>
        <div className="advert-details-title">
          <span>{props.title}</span>
        </div>
        <div className="cast-container" >
          {cast.map((castName, i) => (
            <div key={i} className="cast-block" >
              {/* eslint-disable-next-line  */}
              <a href={"/search?cast=" + castName} target="_blank">{castName}</a>
              <img src="/static/images/play-small.png" alt="" onClick={handleOnClickCastRandomButton}/>
            </div>
          ))}
        </div>
        <div className="category-container">
          {category.map((categoryName, i) => (
            // eslint-disable-next-line 
            <div key={i} className="category-block">
              <a href={"/search?category=" + categoryName} target="_blank">{categoryName}</a>
            </div>
          ))}
        </div>
        <div className="video-advert-buttons-container">
          <div className='video-advert-button' onClick={handleOnClickPlayerButton}> 
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
            </svg>
            <span className='video-advert-button-text'>Open Player</span>
          </div>
          <div className='video-advert-button' onClick={handleOnClickDeleteButton}> 
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
            </svg>
            <span className='video-advert-button-text'>Delete Video</span>
          </div>
          <div className='video-advert-button' onClick={handleOnClickFolderButton}> 
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
            </svg>
            <span className='video-advert-button-text'>Open Folder</span>
          </div>
        </div>
        {progress > 0 && (
          <div className="progress-bar">
            <div className="progress-bar-total">
              <div
                className="progress-bar-current"
                style={progressBarStyle}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
