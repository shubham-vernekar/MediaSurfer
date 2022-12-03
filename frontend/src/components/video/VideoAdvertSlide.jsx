import VideoCard from "./VideoCard";
import "../../../static/css/video/VideoAdvertSlide.css";
import { React, useRef, useEffect } from "react";

function VideoAdvertSlide(props) {
  const advertSlideRef = useRef(null);
  const slideLeftRef = useRef(null);
  const slideRightRef = useRef(null);

  useEffect(() => {
    advertSlideRef.current.style.width = (350 + 40)*(props.videoData.length)+"px";
    advertSlideRef.current.slidePosition = 0

    let intervalRight = null;
    let intervalLeft = null;
    slideRightRef.current.addEventListener('mouseover', function () {
      moveSlideLeft()
      intervalRight = setInterval(moveSlideLeft, 500);
    });

    slideRightRef.current.addEventListener('mouseout', function () {
        clearInterval(intervalRight);
    });

    slideLeftRef.current.addEventListener('mouseover', function () {
      moveSlideRight()
      intervalLeft = setInterval(moveSlideRight, 500);
    });

    slideLeftRef.current.addEventListener('mouseout', function () {
        clearInterval(intervalLeft);
    });

    }, [props.videoData]);

    const moveSlideLeft = () => {
      let leftMove = advertSlideRef.current.slidePosition + 350;
      if (leftMove < (parseInt(advertSlideRef.current.style.width.replace('px',''))-(window.innerWidth*0.85))){
        advertSlideRef.current.style.transform = "translate3d(-"+leftMove+"px, 0px, 0px)";
        advertSlideRef.current.slidePosition = leftMove;
      }
      
    };

    const moveSlideRight = () => {
      advertSlideRef.current.slidePosition = advertSlideRef.current.slidePosition - 350
      advertSlideRef.current.style.transform = "translate3d(-"+advertSlideRef.current.slidePosition+"px, 0px, 0px)"
    };
  

  return (
    <div className="video-advert-slide-container">
      <div className="video-advert-slide-right" ref={slideRightRef}></div>
      <div className="video-advert-slide-left" ref={slideLeftRef}></div>
      <div className="video-advert-slide-title">
        <div className="video-advert-slide-title-name">
            {props.title}
        </div>
        <div className="video-advert-slide-explore">
            Explore More {">"}
        </div>
      </div>
      <div className="video-advert-slide" ref={advertSlideRef}>
        {props.videoData.map((data, i) => (
          <VideoCard
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
            resolution={data["badge"]}
            specialTag={data["special_tag"]}
          />
        ))}
      </div>
    </div>
  );
}

export default VideoAdvertSlide;
