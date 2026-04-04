import ResponsivePlayer from "../video_player/ResponsivePlayer";
import Spinner from "../utils/Spinner";
import DebridCard from "../debrid/DebridCard";
import DebridAddURLBox from "../debrid/DebridAddURLBox"; 
import { useSearchParams, useNavigate } from "react-router-dom";
import { React, useEffect, useState, useRef } from "react";
import "../../../static/css/pages/DebridPlayerPage.css";
import "../../../static/css/pages/VideoPlayerPage.css";
import axios from "axios";
import { getDurationText, getCreatedDate, secondsToHHMMSS, getSize, getCookie, OpenLocalPlayerDebrid } from '../utils'


function DebridPlayerPage() {
  // const params = useParams();
  // const [videoID, SetVideoID] = useState(params.id);
  const SUPPORTED_VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "ogv", "mov", "m4v", "3gp"];

  let [searchParams, setSearchParams] = useSearchParams();
  const [videoID, SetVideoID] = useState(searchParams.get("id") || "");
  const [inputURL, SetInputURL] = useState(searchParams.get("url") || "");
  const [subtitleURL, SetSubtitleURL] = useState(searchParams.get("subs") || "");
  

  const [volume, SetVolume] = useState(0);
  const [clickToSkip, SetClickToSkip] = useState(false);
  const [videoData, SetVideoData] = useState({});
  const [videoFound, SetVideoFound] = useState(true);
  const [videoSupported, SetVideoSupported] = useState(true);
  const [watchTime, SetWatchTime] = useState(0);
  const [loading, SetLoading] = useState(true);
  const [favorite, SetFavorite] = useState(false);
  const [relatedVideos, SetRelatedVideos] = useState([]);
  
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

    if (videoID){
      axios({
        method: "get",
        url: "/api/videos/debrid/" + videoID,
      }).then((response) => {
        // console.log(response.data);
        
        SetVideoData(response.data);
        SetWatchTime(response.data.watch_time)
        SetRelatedVideos(response.data.related_videos)
        SetVideoSupported(SUPPORTED_VIDEO_EXTENSIONS.includes(response.data.extention?.toLowerCase()))
        document.title = response.data.title;
        SetVideoFound(true)
        SetFavorite(response.data.favourite)
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
    }else if (inputURL){
      axios({
        method: "get",
        url: "/api/debrid/details",
        params: {
          debridURL: inputURL,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
      }).then((response) => {
        if (response.data.error){
          console.log(response.data.error);
        }else{
          // console.log(response.data)

          SetVideoData(response.data);
          SetWatchTime(response.data.watch_time)
          SetRelatedVideos(response.data.related_videos)
          document.title = response.data.title;
          SetVideoSupported(SUPPORTED_VIDEO_EXTENSIONS.includes(response.data.extention?.toLowerCase()))
          SetVideoFound(true)
          SetLoading(false)
        }
      });
    }

  }, []);

  // useEffect(() => {
  //   console.log(relatedVideos);
  // }, [relatedVideos]);


  const handleDeleteVideo = (id) => {
    SetVideoData(prev => prev.filter(v => v.id !== id));
  };
  

  const HandleFavorite = (id, url, title, is_favourite) => {
    axios({
      method: "put",
      url: "/api/videos/debrid/" + id + "/update",
      data: {
        id: id,
        title: title,
        url: url,
        favourite: is_favourite,
      }
    }).then((response) => {
      let favStatus = Boolean(response.data.favourite)
      SetFavorite(favStatus)
    });
  };


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

    if (videoID){
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
  }

  return (
      <div>
        {videoFound && (
          <div className="video-player-container">
            <div className="video-player-box">
              { videoSupported
                ? (
                  <ResponsivePlayer
                    url={videoData.url}
                    title={videoData.title}
                    subtitle={subtitleURL}
                    poster={videoData.poster}
                    progress={videoData.progress}
                    watchTime={videoData.watch_time}
                    updateProgressCallback={updateProgress}
                    initialVolume={volume}
                    clickToSkip={clickToSkip}
                  />
                ) : (
                  <div className="unsupported-format-box">
                    <img className="unsupported-format-poster" src={videoData.poster} alt="" />
                    <div className='unsupported-format-buttons-box'>
                      <div className='unsupported-player-button' onClick={() => OpenLocalPlayerDebrid(videoData.url, "pot", subtitleURL)}>
                        <img src="/static/images/play-red.svg" width="70px" height="70px" />
                      </div>
                      <div className='unsupported-player-button' onClick={() => OpenLocalPlayerDebrid(videoData.url, "vlc", subtitleURL)}>
                        <img src="/static/images/vlc.png" width="70px" height="70px" />
                      </div>
                    </div>
                  </div>
                )
              }
              
              <div className="video-player-details">
                <div className={`video-player-title  ${favorite ? "fav-text" : ""}`}>
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
                      <div> 
                        {videoData.badge} 
                      </div>
                    )}
                    {videoData.extention && (
                      <div> 
                        {videoData.extention.toUpperCase()} 
                      </div>
                    )}
                    <div className='video-player-button' onClick={() => OpenLocalPlayerDebrid(videoData.url, "pot", subtitleURL)}>  
                      <img src="/static/images/play-red.svg"  width="25px" height="25px" ></img>
                      <span className='video-player-button-text'>Open Pot Player</span>
                    </div>
                    <div className='video-player-button' onClick={() => OpenLocalPlayerDebrid(videoData.url, "vlc", subtitleURL)}>  
                      <img src="/static/images/vlc.png"  width="25px" height="25px" ></img>
                      <span className='video-player-button-text'>Open VLC Player</span>
                    </div>
                    {/* <div className='video-advert-button' onClick={() => {HandleFavorite(videoData.vidid, videoData.url, videoData.title, !favorite)}}> 
                      {favorite && (<svg width="14" height="14" fill="currentColor" className='video-advert-button-text-svg' viewBox="0 0 16 16">
                      <path d="M8.931.586 7 3l1.5 4-2 3L8 15C22.534 5.396 13.757-2.21 8.931.586ZM7.358.77 5.5 3 7 7l-1.5 3 1.815 4.537C-6.533 4.96 2.685-2.467 7.358.77Z"/>
                      </svg>)}
                      {!favorite && (<svg width="14" height="14" fill="currentColor" className='video-advert-button-text-svg' viewBox="0 0 16 16">
                      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                      </svg>)}
                    </div> */}
                    {!favorite && videoID && (<div className='video-player-button' onClick={() => {HandleFavorite(videoData.id, videoData.url, videoData.title, !favorite)}}>
                      <img src="/static/images/like-add.svg" width="25px" height="25px" alt="" />
                      <span className='video-player-button-text'>Add to favourites</span>
                    </div>)}
                    
                    {favorite && videoID && (<div className='video-player-button' onClick={() => {HandleFavorite(videoData.id, videoData.url, videoData.title, !favorite)}}>
                      <img src="/static/images/like-remove.svg" width="25px" height="25px" alt="" />
                      <span className='video-player-button-text'>Remove from favourites</span>
                    </div>)}  
                    <DebridAddURLBox/>
                </div>

                {videoData.parent_title && videoData.parent_hash &&(
                  <div className="video-player-series-pane">
                    <a href={"/debrid?parent="+videoData.parent_hash}>{videoData.parent_title}</a>
                  </div>
                )}
                
              </div>

              <div className="debrid-adverts-container">
                  {relatedVideos.map((data, i) => (
                    <DebridCard
                      key={data["id"]}
                      vidid={data["id"]}
                      title={data["title"]}
                      views={data["views"]}
                      favorite={data["favourite"]}
                      poster={data["poster"]}
                      progress={data["progress"]}
                      duration={data["duration"]}
                      created={data["added"]}
                      badge={data["badge"]}
                      watchTime={data["watch_time"]}
                      size={data["size"]}
                      debrid_link={data["debrid_link"]}
                      extention={data["extention"]}
                      onDelete={handleDeleteVideo}
                    />
                  ))}
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
