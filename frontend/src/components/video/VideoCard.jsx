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
            <a key={i} href={"/search?category=" + categoryName} target="_blank">{categoryName}</a>
          ))}
        </div>
        <div className="video-advert-buttons-container">
          <div className='video-advert-button' onClick={handleOnClickPlayerButton}>Player</div>
          <div className='video-advert-button' onClick={handleOnClickFolderButton}>Folder</div>
          <div className='video-advert-button' onClick={handleOnClickDeleteButton}>Delete</div>
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
