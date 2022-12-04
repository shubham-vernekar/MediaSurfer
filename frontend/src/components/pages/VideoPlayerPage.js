import ResponsivePlayer from "../video_player/ResponsivePlayer";
import { useParams } from "react-router-dom";
import { React, useRef, useEffect, useState } from "react";
import axios from "axios";
import "../../../static/css/pages/VideoPlayerPage.css";
import StarCard from "../star/StarCard";
import VideoAdvertSlide from "../video/VideoAdvertSlide";
import VideoAdvertBox from "../video/VideoAdvertBox";

function VideoPlayerPage() {
  const params = useParams();
  const [videoID, SetVideoID] = useState(params.id);
  const [videoData, SetVideoData] = useState({});
  const [watchNextVideos, SetWatchNextVideos] = useState([]);
  const [similarVideos, SetSimilarVideos] = useState([]);
  const [categories, SetCategories] = useState([]);
  const [createdDate, SetCreatedDate] = useState(""); 
  const [starData, SetStarData] = useState([]);

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/videos/" + videoID,
    }).then((response) => {
      SetVideoData(response.data);
      SetCategories(response.data.categories.split(",")) 
      const created = new Date(response.data.created);
      SetCreatedDate(created.toLocaleString("default", { month: "long" }) + " " + created.toLocaleString("default", { day: "2-digit" }).toUpperCase() + " " + created.getFullYear())
      getCastData(response.data.cast) 
      getOtherVideos(videoID, "similar", 18)
      getOtherVideos(videoID, "watch next", 15)
    });
  }, []);

  const getOtherVideos = (videoID, type, count) => {
    axios({
      method: "get",
      url: "/api/videos/related",
      params: {
        videoID: videoID,
        limit: count,
        type: type
      },
    }).then((response) => {
      if (type==="similar"){
        SetSimilarVideos(response.data.results)
      }else if (type==="watch next"){
        SetWatchNextVideos(response.data.results)
      }
    });
  };
 

  const getDurationText = (duration) => {
    if (duration){
      duration = duration.split(":");
      if (parseInt(duration[0]) > 0) {
        return parseInt(duration[0]) + " hrs " + parseInt(duration[1]) + " mins";
      } else {
        return parseInt(duration[1]) + " mins";
      }
    }
  };

  const getCastData = (cast) => {
    axios({
      method: "get",
      url: "/api/stars",
      params: {
        cast: cast
      },
    }).then((response) => {
      SetStarData(response.data);
    });
  };

  const getSize = (size) => {
    if (size<1024){
      return parseFloat(size).toFixed(2) + " Mb"
    }else{
      return parseFloat(parseFloat(size)/parseFloat(1024)).toFixed(2) + " Gb"
    }
  }

  return (
    <div className="video-player-container">
      <div className="video-player-box">
        <ResponsivePlayer
          url={videoData.video_url}
          subtitle={videoData.subtitle}
          poster={videoData.poster}
          sprite={videoData.scrubber_sprite}
          sprite_pos_file={videoData.scrubber_vtt}
        />
        <div className="video-player-details">
          <div className="video-player-title"><h1>{videoData.title}</h1></div>
          <div className="video-player-details-pane">
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              </svg>
              {getDurationText(videoData.duration)} </div>
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zm5.402 9.746c.625 0 1.184-.484 1.184-1.18 0-.832-.527-1.23-1.16-1.23-.586 0-1.168.387-1.168 1.21 0 .817.543 1.2 1.144 1.2z"/>
                <path d="M16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-6.664-1.21c-1.11 0-1.656-.767-1.703-1.407h.683c.043.37.387.82 1.051.82.844 0 1.301-.848 1.305-2.164h-.027c-.153.414-.637.79-1.383.79-.852 0-1.676-.61-1.676-1.77 0-1.137.871-1.809 1.797-1.809 1.172 0 1.953.734 1.953 2.668 0 1.805-.742 2.871-2 2.871zm-2.89-5.435v5.332H5.77V8.079h-.012c-.29.156-.883.52-1.258.777V8.16a12.6 12.6 0 0 1 1.313-.805h.632z"/>
              </svg>
              {createdDate} 
            </div>
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.5 0H5.914a1.5 1.5 0 0 0-1.06.44L2.439 2.853A1.5 1.5 0 0 0 2 3.914V14.5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0Zm-7 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2.75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Zm1.25-.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
              </svg>
              {getSize(videoData.size)} </div>
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
              {videoData.views}
            </div>
            <div> 
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 13.5A.5.5 0 0 1 3 13h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zM2 2h12s2 0 2 2v6s0 2-2 2H2s-2 0-2-2V4s0-2 2-2z"/>
              </svg>
              {videoData.height} x {videoData.width} </div>
            <div> {videoData.badge} </div>
            <div> {videoData.special_tag} </div>
          </div>
          <div className="video-player-categories-pane">
            {categories.map((categoryName, i) => (
              <a key={i}>{categoryName}</a>
            ))}
          </div>
          <div className="video-player-cast-pane">
            {starData.map((data, i) => (
              <StarCard
                key={i}
                poster={data["poster"] ? data["poster"] : "https://thumbs.dreamstime.com/b/no-user-profile-picture-hand-drawn-illustration-53840792.jpg"  }
                name={data["name"]}
                videos={data["videos"]}
                views={data["views"]}
                favorite={data["favourite"]}
                superstar={data["superstar"]}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="watch-next-container">
        <VideoAdvertSlide videoData={watchNextVideos} title="Continue Watching" />
      </div>
      <div className="discover-container">
        <VideoAdvertBox videoData={similarVideos}  title="Discover" />
      </div>
    </div>
  );
}

export default VideoPlayerPage;
