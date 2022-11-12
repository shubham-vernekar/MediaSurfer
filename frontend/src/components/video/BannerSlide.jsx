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
            console.log(bannerSlideRef.current.currentBanner);
            if (bannerSlideRef.current.currentBanner < props.videoData.length - 1){
                bannerSlideRef.current.currentBanner = bannerSlideRef.current.currentBanner + 1
            }else{
                bannerSlideRef.current.currentBanner = 0
            }

            bannerSlideRef.current.style.transform = "translate3d(-"+bannerSlideRef.current.currentBanner*window.innerWidth+"px, 0px, 0px)"
        }, 13000);
        return () => clearInterval(interval);
      }, []);


    return (
      <div className="video-banner-slide" ref={bannerSlideRef}>
        {props.videoData.map((data, i) => (
          <VideoBanner
            key={i}
            title={data["title"]}
            categories={data["categories"]}
            cast={data["cast"]}
            views={data["views"]}
            favorite={data["favorite"]}
            preview={data["preview"]}
            previewThumbnail={data["preview_thumbnail"]}
            progress={data["progress"]}
            duration={data["duration"]}
            created={data["created"]}
            resolution={data["resolution"]}
            specialTag={data["special_tag"]}
          />
        ))}
      </div>
    );
  }
  
  export default BannerSlide;