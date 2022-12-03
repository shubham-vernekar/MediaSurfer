import VideoCard from "./VideoCard";
import "../../../static/css/video/VideoAdvertBox.css";

function VideoAdvertBox(props) {
  return (
    <div className="video-advert-box-container">
      <div className="video-advert-box-title">
        <div className="video-advert-box-title-name">{props.title}</div>
        <div className="video-advert-box-refresh">Refresh {">"}</div>
      </div>
      <div className="video-advert-box">
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

export default VideoAdvertBox;
