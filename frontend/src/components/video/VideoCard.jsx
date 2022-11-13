import '../../../static/css/video/VideoCard.css';
import { React, useEffect, useRef } from "react";

function VideoCard(props) {

  const videoCardRef = useRef(null);
  const videoRef = useRef(null);
  const videoSourceRef = useRef(null);

  const videoThemeDict = {
    "WATCHED" : ["static/images/Watched.png", "#99d3ff"],
    "NEW" : ["static/images/new_video.png", "#ebc2ac"],
    "FAVOURITE" : ["static/images/Favorite Icon.png", "#ff6b87"],
    "RECOMMENDED" : ["static/images/Recommended.png", "#f2c73d"], //#ebbb24
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

  let cast = props.cast.split(",");
  let category = props.categories.split(",");


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

  return (
    <div className="video-card" ref={videoCardRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="preview-video-container">
        {/* eslint-disable-next-line  */}
        {/* <a href=""> */}
          <div className="preview-video-box">
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
          </div>
        {/* </a> */}
      </div>
      <div className="image-tag-container">
          <img src={imageTag} className="image-tag" alt="" />
        </div>
        
      <div className="advert-details">
        
        <div className="advert-details-heading">
          <div>
            {created
              .toLocaleString("default", { month: "short" })
              .toUpperCase()}{" "}
            {created.getFullYear()}
          </div>
          <div>{durationText}</div>
          <div>{props.resolution}</div>
          <div>{props.specialTag}</div>
        </div>
        <div className="advert-details-title">
          <span>{props.title}</span>
        </div>
        <div className="cast-container" >
          {cast.map((castName, i) => (
            <div key={i} className="cast-block">
              {/* eslint-disable-next-line  */}
              <a>{castName}</a>
              <img src="static/images/play-small.png" alt="" />
            </div>
          ))}
        </div>
        <div className="category-container">
          {category.map((categoryName, i) => (
            // eslint-disable-next-line 
            <a key={i}>{categoryName}</a>
          ))}
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
