import '../../../static/css/video/VideoBanner.css';
import StarCard from "../star/StarCard";
import { React, useRef } from "react";

function VideoBanner(props) {
  const bannerVideoRef = useRef(null);
  const bannerVideoSourceRef = useRef(null);

  let category = props.categories.split(",");
  let cast = props.cast.split(",");

  if (cast.length > 5) {
    cast = cast.slice(0, 5);
  }

  const handleMouseEnter = (e) => {
    bannerVideoSourceRef.current.setAttribute("src", props.preview);
    bannerVideoRef.current.load();
    bannerVideoRef.current.play();
    bannerVideoRef.current.volume = 0.2;
  };

  const handleMouseLeave = (e) => {
    bannerVideoRef.current.pause();
    // bannerVideoRef.current.currentTime = 0;
  };

  return (
    <div className="video-banner-container">
      <div
        className="video-banner"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="banner-video-details">
          <div className="banner-video-title">
            <span>{props.title}</span>
          </div>

          <div className="banner-details-container">
            <div>{props.duration}</div>
            <div>{props.resolution}</div>
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
            {cast.map((castName, i) => (
              <div key={i} className="banner-cast-block">
                <StarCard
                  poster={
                    "https://cdn.britannica.com/47/201647-050-C547C128/Hugh-Jackman-2013.jpg"
                  }
                  name={castName}
                  videos={35}
                  views={119}
                  favorite={true}
                  superstar={true}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="banner-video-container">
          <video
            className="banner-video"
            preload="auto"
            loop
            poster={props.previewThumbnail}
            ref={bannerVideoRef}
          >
            <source ref={bannerVideoSourceRef} src="" type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default VideoBanner;
