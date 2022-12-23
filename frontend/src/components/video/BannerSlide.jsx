import VideoBanner from "./VideoBanner";
import "../../../static/css/video/BannerSlide.css";
import { React, useRef, useEffect, useState } from "react";

function BannerSlide(props) {
  const bannerSlideRef = useRef(null);
  const [isMuted, SetIsMuted] = useState(true);

  useEffect(() => {
    bannerSlideRef.current.style.width =
      window.innerWidth * props.videoData.length + "px";
    bannerSlideRef.current.currentBanner = 0;
    bannerSlideRef.current.isMuted = true;
    window.addEventListener("resize", (e) => {
      bannerSlideRef.current.style.width =
        window.innerWidth * props.videoData.length + "px";
    });

    const interval = setInterval(() => {
      moveBanner("right");
    }, 12000); // 12000
    return () => clearInterval(interval);
  }, [props.videoData]);

  const moveBanner = (direction) => {
    
    let newPosition = 0;
    if (direction === "right") {
      newPosition = bannerSlideRef.current.currentBanner + 1;
    } else {
      newPosition = bannerSlideRef.current.currentBanner - 1;
    }

    if (newPosition >= props.videoData.length || newPosition<0) {
      newPosition = 0;
    }
    
    bannerSlideRef.current.currentBanner = newPosition;
    bannerSlideRef.current.style.transform =
      "translate3d(-" +
      bannerSlideRef.current.currentBanner * window.innerWidth +
      "px, 0px, 0px)";
    playCurrentVideo(newPosition);
  };

  useEffect(() => {
    bannerSlideRef.current.isMuted = isMuted;
    playCurrentVideo(bannerSlideRef.current.currentBanner);
  }, [isMuted]);

  const moveBannerLeft = () => {
    moveBanner("left");
  };

  const moveBannerRight = () => {
    moveBanner("right");
  };

  const toggleMute = () => {
    SetIsMuted(!isMuted);
  };

  const playCurrentVideo = (position) => {
    let allVideos = Array.prototype.slice.call(
      bannerSlideRef.current.getElementsByTagName("video")
    );
    allVideos.forEach(function (item, index) {
      if (index == position) {
        item.muted = bannerSlideRef.current.isMuted;
        item.play();
        item.volume = 0.2;
      } else {
        item.pause();
      }
    });
  };

  return (
    <div>
      <div className="video-banner-slide" ref={bannerSlideRef}>
        <div className="video-banner-slide-box">
          {props.videoData.map((data, i) => (
            <VideoBanner
              key={i}
              vidID={data["id"]}
              title={data["title"]}
              categories={data["categories"]}
              cast={data["cast"]}
              views={data["views"]}
              favorite={data["favourite"]}
              preview={data["preview"]}
              previewThumbnail={data["preview_thumbnail"]}
              progress={data["progress"]}
              duration={data["duration"]}
              created={data["created"]}
              badge={data["badge"]}
              specialTag={data["special_tag"]}
              subtitle_badge={data["subtitle_badge"]}
              watchTime={data["watch_time"]}
            />
          ))}
        </div>
      </div>
      <div className="video-banner-toggle-mute-container"> 
        <div className="video-banner-toggle-mute" onClick={toggleMute}>
          {!isMuted && (
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
              <path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z" />
            </svg>
          )}
          {isMuted && (
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96V5.04zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z" />
            </svg>
          )}
        </div>
      </div>
      <div className="video-banner-slide-right video-banner-slide-button" onClick={moveBannerRight}></div>
      <div className="video-banner-slide-left video-banner-slide-button" onClick={moveBannerLeft}></div>
    </div>
  );
}

export default BannerSlide;
