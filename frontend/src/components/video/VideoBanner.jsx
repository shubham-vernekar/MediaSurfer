import '../../../static/css/video/VideoBanner.css';
import StarCard from "../star/StarCard";
import { React, useRef, useEffect, useState} from "react";
import axios from "axios";
import { getDurationText, getCreatedDate, secondsToHHMMSS } from '../utils'

function VideoBanner(props) {
  const bannerVideoRef = useRef(null);
  const bannerRef = useRef(null);
  const [starData, SetStarData] = useState([]);

  let category = []
  if (props.categories){
    props.categories.split(",");
  }
  
  useEffect(() => {
    getCastData(props.cast)
    bannerRef.current.style.width = window.innerWidth +"px";
    window.addEventListener("resize", (e) => {
        bannerRef.current.style.width = window.innerWidth +"px";
      });
  }, []);

  useEffect(() => {
    getCastData(props.cast)
  }, [props.cast]);

  const getCastData = (cast) => {
    axios({
      method: "get",
      url: "/api/stars",
      params: {
        cast: cast || "empty"
      },
    }).then((response) => {
      if (response.data.length > 5) {
        response.data = response.data.slice(0, 5);
      }
      SetStarData(response.data);
    });
  };

  return (
      <div
        className="video-banner"
        ref={bannerRef}
      >
        <div className="banner-video-details">
          <div className="banner-video-title">
            <span>{props.title}</span>
          </div>

          <div className="banner-details-container">
            <div> 
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                </svg>
                {getDurationText(props.duration)} 
            </div>
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zm5.402 9.746c.625 0 1.184-.484 1.184-1.18 0-.832-.527-1.23-1.16-1.23-.586 0-1.168.387-1.168 1.21 0 .817.543 1.2 1.144 1.2z"/>
                <path d="M16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-6.664-1.21c-1.11 0-1.656-.767-1.703-1.407h.683c.043.37.387.82 1.051.82.844 0 1.301-.848 1.305-2.164h-.027c-.153.414-.637.79-1.383.79-.852 0-1.676-.61-1.676-1.77 0-1.137.871-1.809 1.797-1.809 1.172 0 1.953.734 1.953 2.668 0 1.805-.742 2.871-2 2.871zm-2.89-5.435v5.332H5.77V8.079h-.012c-.29.156-.883.52-1.258.777V8.16a12.6 12.6 0 0 1 1.313-.805h.632z"/>
              </svg>
                {getCreatedDate(props.created)} 
            </div>
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
              {props.views}
            </div>
            <div> 
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V5z"/>
                <path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666c.92 0 1.667-.746 1.667-1.667v-.383a2.5 2.5 0 0 0 2-2.45V8h.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H14v-.5a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.254 0 10.333 0H5.667C4.747 0 4 .746 4 1.667zM4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3z"/>
              </svg>
              {secondsToHHMMSS(props.watchTime)} 
            </div>
            <div>{props.badge}</div>
            {props.subtitle_badge && (<div>SRT</div>)}
            <div>{props.specialTag}</div>
          </div>

          <div className="banner-category-container">
            {category.map((categoryName, i) => (
              <div key={i}>
                {/* eslint-disable-next-line */}
                <a>{categoryName}</a>
              </div>
            ))}
          </div>

          <div className="banner-cast-container">
            {starData.map((data, i) => (
              <div key={i} className="banner-cast-block">
                <StarCard
                key={i}
                poster={data["poster"]}
                name={data["name"]}
                videos={data["videos"]}
                views={data["views"]}
                favorite={data["favourite"]}
                superstar={data["superstar"]}
              />
              </div>
            ))}
          </div>
        </div>
        <div className="banner-video-container">
          <a href={"/player/" + props.vidID} target="_blank">
            <video
              className="banner-video"
              preload="auto"
              loop
              autoPlay
              muted
              poster={props.previewThumbnail}
              ref={bannerVideoRef}
            >
              <source src={props.preview} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          </a>
        </div>
      </div>
  );
}

export default VideoBanner;
