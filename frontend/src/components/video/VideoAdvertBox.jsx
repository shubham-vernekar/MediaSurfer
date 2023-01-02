import VideoCard from "./VideoCard";
import "../../../static/css/video/VideoAdvertBox.css";
import { React, useRef, useEffect, useState } from "react";


function VideoAdvertBox(props) {
  const videoAdvertBoxRef = useRef(null);

  useEffect(() => {
    if(props.width){
      let adverts = videoAdvertBoxRef.current.querySelectorAll('.video-card')
      adverts.forEach(function (item, index) {
        item.style.width = props.width + "px"
        item.style.height = Math.floor(props.width*319/385) + "px"
      });
    }
  }, [props.width]);

  return (
    <div className="video-advert-box-container">
      <div className="video-advert-box-title">
        <div className="video-advert-box-title-name">{props.title}</div>
        <div className="video-advert-box-refresh" onClick={props.onRefresh} index={props.index}>Refresh {">"}</div>
      </div>
      <div className="video-advert-box" ref={videoAdvertBoxRef}>
        {props.videoData.map((data, i) => (
          <VideoCard
            key={i}
            vidid={data["id"]}
            title={data["title"]}
            categories={data["categories"]}
            cast={data["cast"]}
            views={data["views"]}
            favorite={data["favourite"]}
            preview={data["preview"]}
            previewThumbnail={data["preview_poster"]}
            progress={data["progress"]}
            duration={data["duration"]}
            created={data["created"]}
            badge={data["badge"]}
            specialTag={data["special_tag"]}
            watchTime={data["watch_time"]}
            subtitleBadge={data["subtitle_badge"]}
            size={data["size"]}
          />
        ))}
      </div>
    </div>
  );
}

export default VideoAdvertBox;
