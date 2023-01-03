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
        <div className="video-advert-box-refresh" onClick={() => props.onRefresh(props.index)}>
          <svg width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          <span className="video-advert-box-text">Refresh</span>
        </div>
        {props.explore && (<a className="video-advert-box-explore" href={props.explore} target="_blank">
          <svg width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"/>
            <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
          </svg>
          <span className="video-advert-box-text">Explore More</span>
        </a>)}
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
