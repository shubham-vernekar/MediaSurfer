import VideoBanner from "./VideoBanner";
import '../../../static/css/video/BannerSlide.css';
import { React, useRef, useEffect } from "react";

function BannerSlide(props) {
  const bannerSlideRef = useRef(null);

  useEffect(() => {
      bannerSlideRef.current.style.width = window.innerWidth*(props.videoData.length)+"px";
      bannerSlideRef.current.currentBanner = 0
      window.addEventListener("resize", (e) => {
          bannerSlideRef.current.style.width = window.innerWidth*(props.videoData.length)+"px";
        });

      const interval = setInterval(() => {
        moveBanner("right")
      }, 12000); // 12000
      return () => clearInterval(interval);
    }, [props.videoData]);

  
  const moveBanner = (direction) => {
    let newPosition = 0
    if (direction==="right"){
      newPosition = bannerSlideRef.current.currentBanner + 1
    }else{
      newPosition = bannerSlideRef.current.currentBanner - 1 
    }
    if (newPosition >= props.videoData.length){
      newPosition = 0
    }
    bannerSlideRef.current.currentBanner = newPosition
    bannerSlideRef.current.style.transform = "translate3d(-"+bannerSlideRef.current.currentBanner*window.innerWidth+"px, 0px, 0px)"
  };

  const moveBannerLeft = () => {
    moveBanner("left")
  }

  const moveBannerRight = () => {
    moveBanner("right")
  }



    return (
      <div>
        <div className="video-banner-slide" ref={bannerSlideRef}>
          <div className="video-banner-slide-box" >
            {props.videoData.map((data, i) => (
              <VideoBanner
                key={i}
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
              />
            ))}
          </div>
        </div>
        <div className="video-banner-slide-right" onClick={moveBannerRight}></div>
        <div className="video-banner-slide-left" onClick={moveBannerLeft}></div>
      </div>
    );
  }
  
  export default BannerSlide;