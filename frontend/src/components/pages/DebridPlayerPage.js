import ResponsivePlayer from "../video_player/ResponsivePlayer";
import Spinner from "../utils/Spinner";
import DebridAddURLBox from "../debrid/DebridAddURLBox"; 
import { useParams, useNavigate } from "react-router-dom";
import { React, useEffect, useState, useRef } from "react";
import "../../../static/css/pages/DebridPlayerPage.css";
import "../../../static/css/pages/VideoPlayerPage.css";
import axios from "axios";
import { getDurationText, getCreatedDate, secondsToHHMMSS, getSize, getCookie } from '../utils'


function DebridPlayerPage() {
  const params = useParams();
  const [videoID, SetVideoID] = useState(params.id);
  const [volume, SetVolume] = useState(0);
  const [clickToSkip, SetClickToSkip] = useState(false);
  const [videoData, SetVideoData] = useState({});
  const [videoFound, SetVideoFound] = useState(true);
  const [watchTime, SetWatchTime] = useState(0);
  const [loading, SetLoading] = useState(true);
  
  const [views, SetViews] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);


  useEffect(() => {
    axios({
        method: "get",
        url: "/api/volume",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
      }).then((response) => {
        SetVolume(response.data.volume_level);
        SetClickToSkip(response.data.click_to_skip);
    });

    axios({
      method: "get",
      url: "/api/videos/debrid/" + videoID,
    }).then((response) => {
      SetVideoData(response.data);
      SetWatchTime(response.data.watch_time)
      document.title = response.data.title;
      SetVideoFound(true)
      SetLoading(false)
    })
    .catch((error) => {
      SetVideoFound(false)
    });

    axios({
      method: "post",
      url: "/api/videos/debrid/" + videoID + "/viewincr",
      headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken')
            }
      }).then((response) => {
        SetViews(response.data.views)
      });

  }, []);

  // useEffect(( => {
  //   console.log(videoData);
  // }, [videoData]);


  const updateProgress = (progress, watchTime, currentVolume) => {
    if (volume!=currentVolume){
      SetVolume(currentVolume)
      axios({
        method: "post",
        url: "/api/volume",
        data: {
          volume: currentVolume
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
      });
    }

    axios({
      method: "put",
      url: "/api/videos/debrid/" + videoData.id + "/update",
      data: {
        id: videoData.id,
        title: videoData.title,
        url: videoData.url,
        progress: progress,
        watch_time: watchTime,
      },
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
    }).then((response) => {
      SetWatchTime(response.data.watch_time)
    });
  }

  return (
      <div>
        {videoFound && (
          <div className="video-player-container">
            <div className="video-player-box">
              <ResponsivePlayer
                url={videoData.url}
                title={videoData.title}
                poster={videoData.poster}
                progress={videoData.progress}
                watchTime={videoData.watch_time}
                updateProgressCallback={updateProgress}
                initialVolume={volume}
                clickToSkip={clickToSkip}
              />
              
              <div className="video-player-details">
                <div className="video-player-title">
                  <h1>{videoData.title}</h1>
                </div>
                <div className="video-player-details-pane">
                  <div style={{"cursor": "pointer"}} onClick={() => window.open("/admin/videos/debridvideo/"+ videoData.id +"/change/", '_blank').focus()}> 
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    </svg>
                    {getDurationText(videoData.duration)}
                  </div>
                  <div> 
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zm5.402 9.746c.625 0 1.184-.484 1.184-1.18 0-.832-.527-1.23-1.16-1.23-.586 0-1.168.387-1.168 1.21 0 .817.543 1.2 1.144 1.2z"/>
                      <path d="M16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-6.664-1.21c-1.11 0-1.656-.767-1.703-1.407h.683c.043.37.387.82 1.051.82.844 0 1.301-.848 1.305-2.164h-.027c-.153.414-.637.79-1.383.79-.852 0-1.676-.61-1.676-1.77 0-1.137.871-1.809 1.797-1.809 1.172 0 1.953.734 1.953 2.668 0 1.805-.742 2.871-2 2.871zm-2.89-5.435v5.332H5.77V8.079h-.012c-.29.156-.883.52-1.258.777V8.16a12.6 12.6 0 0 1 1.313-.805h.632z"/>
                    </svg>
                    {getCreatedDate(videoData.added)} 
                  </div>
                  <div> 
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.5 0H5.914a1.5 1.5 0 0 0-1.06.44L2.439 2.853A1.5 1.5 0 0 0 2 3.914V14.5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0Zm-7 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2.75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Zm1.25-.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
                    </svg>
                    {getSize(videoData.size)} 
                  </div>
                  <div> 
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                    </svg>
                    {views}
                  </div>
                  <div> 
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.5 13.5A.5.5 0 0 1 3 13h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zM2 2h12s2 0 2 2v6s0 2-2 2H2s-2 0-2-2V4s0-2 2-2z"/>
                    </svg>
                    {videoData.height} x {videoData.width} </div>
                  <div> 
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V5z"/>
                      <path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666c.92 0 1.667-.746 1.667-1.667v-.383a2.5 2.5 0 0 0 2-2.45V8h.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H14v-.5a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.254 0 10.333 0H5.667C4.747 0 4 .746 4 1.667zM4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3z"/>
                    </svg>
                    {secondsToHHMMSS(watchTime)} 
                  </div>
                    {videoData.badge && (
                      <div> {videoData.badge} </div>
                    )}
                    <DebridAddURLBox/>
                </div>

              </div>
            </div>
          </div>
        )}
        {!videoFound && (
          <div className="video-not-found"> 
            <img src="/static/images/404-no-video.svg" alt="" />
          </div>
        )}
        {loading && (
            <Spinner 
                visible = {loading}
                color = "#ff0000"
            />
        )}
      </div>
  );
}

export default DebridPlayerPage;
