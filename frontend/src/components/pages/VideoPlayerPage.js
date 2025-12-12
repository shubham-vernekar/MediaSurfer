import ResponsivePlayer from "../video_player/ResponsivePlayer";
import { useParams } from "react-router-dom";
import { React, useEffect, useState, useRef } from "react";
import OptionsSearchBox from "../utils/OptionsSearchBox";
import axios from "axios";
import "../../../static/css/pages/VideoPlayerPage.css";
import StarCard from "../star/StarCard";
import VideoAdvertSlide from "../video/VideoAdvertSlide";
import VideoAdvertBox from "../video/VideoAdvertBox";
import { getDurationText, getCreatedDate, secondsToHHMMSS, getSize, OpenLocalPlayer, OpenFolder, getCookie } from '../utils'

function VideoPlayerPage() {
  const params = useParams();
  const [videoID, SetVideoID] = useState(params.id);
  const [videoData, SetVideoData] = useState({});
  const [watchNextVideos, SetWatchNextVideos] = useState([]);
  const [similarVideos, SetSimilarVideos] = useState([]);
  const [categories, SetCategories] = useState([]);
  const [cast, SetCast] = useState([]);
  const [starData, SetStarData] = useState([]);
  const [isFavourite, SetIsFavourite] = useState(false);
  const [isVerfied, SetIsVerfied] = useState(false);
  const [allCategories, SetAllCategories] = useState([]);
  const [allStars, SetAllStars] = useState([]);
  const [showCastAdd, SetShowCastAdd] = useState(false);
  const [showCastDelete, SetShowCastDelete] = useState(false);
  const [showCategoriesAdd, SetShowCategoriesAdd] = useState(false);
  const [showCategoriesDelete, SetShowCategoriesDelete] = useState(false);
  const [specialTag, SetSpecialTag] = useState("");
  const [watchTime, SetWatchTime] = useState(0);
  const [volume, SetVolume] = useState(0);

  const VideoDetailsRef = useRef(null);

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/videos/" + videoID,
    }).then((response) => {
      SetVideoData(response.data);
      SetCategories(response.data.categories && response.data.categories.split(",").filter(Boolean)) 
      SetCast(response.data.cast && response.data.cast.split(",").filter(Boolean)) 
      getCastData(response.data.cast) 
      getOtherVideos(videoID, "similar", 20)
      getOtherVideos(videoID, "watch next", 15)
      SetIsFavourite(response.data.favourite)
      SetIsVerfied(response.data.verfied)
      SetSpecialTag(response.data.special_tag)
      SetWatchTime(response.data.watch_time)
    });

    axios({
      method: "post",
      url: "/api/videos/" + videoID + "/viewincr",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },

    });

    axios({
        method: "get",
        url: "/api/categories/names",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
      }).then((response) => {
        SetAllCategories(response.data);
    });

    axios({
        method: "get",
        url: "/api/stars/names",
      }).then((response) => {
        SetAllStars(response.data.names);
    });

    axios({
        method: "get",
        url: "/api/volume",
      }).then((response) => {
        SetVolume(response.data.volume_level);
    });
  
  }, []);

  useEffect(() => {
    if (specialTag == "FAVOURITE") {
      VideoDetailsRef.current.classList.add("fav-text");
      VideoDetailsRef.current.classList.remove("new-text");
      VideoDetailsRef.current.classList.remove("recommended-text");
      VideoDetailsRef.current.classList.remove("watched-text");
    } else if (specialTag == "NEW") {
      VideoDetailsRef.current.classList.add("new-text");
      VideoDetailsRef.current.classList.remove("recommended-text");
      VideoDetailsRef.current.classList.remove("watched-text");
      VideoDetailsRef.current.classList.remove("fav-text");
    } else if (specialTag == "RECOMMENDED") {
      VideoDetailsRef.current.classList.add("recommended-text");
      VideoDetailsRef.current.classList.remove("new-text");
      VideoDetailsRef.current.classList.remove("watched-text");
      VideoDetailsRef.current.classList.remove("fav-text");
    } else if (specialTag == "WATCHED") {
      VideoDetailsRef.current.classList.add("watched-text");
      VideoDetailsRef.current.classList.remove("new-text");
      VideoDetailsRef.current.classList.remove("recommended-text");
      VideoDetailsRef.current.classList.remove("fav-text");
    } else {
      VideoDetailsRef.current.classList.remove("watched-text");
      VideoDetailsRef.current.classList.remove("new-text");
      VideoDetailsRef.current.classList.remove("recommended-text");
      VideoDetailsRef.current.classList.remove("fav-text");
    }
  }, [specialTag]);

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
        SetSimilarVideos(response.data)
      }else if (type==="watch next"){
        SetWatchNextVideos(response.data)
      }
    });
  };


  const getCastData = (castName) => {
    if (castName){
      axios({
        method: "get",
        url: "/api/stars",
        params: {
          "cast": castName
        },
      }).then((response) => {
        SetStarData(response.data);
      });
    }else{
      SetStarData([]);
    }
  };

  const updateVideoCast = (id, title, newCast) => {
    axios({
      method: "put",
      url: "/api/videos/" + videoData.id + "/update",
      data: {
        id: id,
        title: title,
        cast: newCast,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
        getCastData(response.data.cast);
        SetCast(response.data.cast.split(",").filter(Boolean));
    });
  }

  const updateVideoCategories = (id, title, newCategories) => {
    axios({
      method: "put",
      url: "/api/videos/" + videoData.id + "/update",
      data: {
        id: id,
        title: title,
        categories: newCategories,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
        SetCategories(response.data.categories.split(",").filter(Boolean));
    });
  }

  const addStar = (name) => {
    let newCast = [...new Set([...cast,...[name.data]])].sort().join(",");
    updateVideoCast(videoData.id , videoData.title, newCast)
  };

  const deleteStar = (name) => {
    let newCast = cast.filter(item => item !== name.data).sort().join(",");
    updateVideoCast(videoData.id , videoData.title, newCast)
  };

  const addCategory = (name) => {
    let newCategories = [...new Set([...categories,...[name.data]])].sort().join(",");
    updateVideoCategories(videoData.id , videoData.title, newCategories)
  };

  const deleteCategory = (name) => {
    let newCategories = categories.filter(item => item !== name.data).sort().join(",");
    updateVideoCategories(videoData.id , videoData.title, newCategories)
  };

  const updateVideoFavourite = (fav) => {
    axios({
      method: "put",
      url: "/api/videos/" + videoData.id + "/update",
      data: {
        id: videoData.id,
        title: videoData.title,
        favourite: fav,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
        SetSpecialTag(response.data.special_tag);
        SetIsFavourite(response.data.favourite);
    });
  }

  const updateVerify = (verfied) => {
    axios({
      method: "put",
      url: "/api/videos/" + videoData.id + "/update",
      data: {
        id: videoData.id,
        title: videoData.title,
        verfied: verfied,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
        SetIsVerfied(response.data.verfied);
    });
  }

  const updateProgress = (progress, watchTime, currentVolume) => {
    
    if (volume!=currentVolume){
      SetVolume(currentVolume)
      axios({
        method: "post",
        url: "/api/volume",
        data: {
          volume: currentVolume
        }
      });
    }

    axios({
      method: "put",
      url: "/api/videos/" + videoData.id + "/update",
      data: {
        id: videoData.id,
        title: videoData.title,
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

  const refreshSimilarVideos = () => {
    getOtherVideos(videoData.id, "similar", 20)
  };

  const DeleteVideo = (vidid) => {
    axios({
      method: "post",
      url: "/api/videos/" + vidid + "/localdelete",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
      location.reload()
    });
  };
  

  return (
    <div className="video-player-container">
      <div className="video-player-box">
        <ResponsivePlayer
          url={videoData.video_url}
          title={videoData.title}
          subtitle={videoData.subtitle_url}
          poster={videoData.poster}
          sprite={videoData.scrubber_sprite}
          sprite_pos_file={videoData.scrubber_vtt}
          progress={videoData.progress}
          watchTime={videoData.watch_time}
          updateProgressCallback={updateProgress}
          initialVolume={volume}
        />
        <div className="video-player-details" >
          <div className="video-player-title" ><h1 ref={VideoDetailsRef}>{videoData.title}</h1></div>
          <div className="video-player-details-pane">
            <div style={{"cursor": "pointer"}} onClick={() => window.open("/admin/videos/video/"+ videoData.id +"/change/", '_blank').focus()}> 
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
              {getCreatedDate(videoData.created)} 
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
              {videoData.views}
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
            {videoData.badge && (<div> {videoData.badge} </div>)}
            {specialTag && (<div> {specialTag} </div>)}
            {videoData.subtitle_badge && (<div>SRT</div>)}

            <div className='video-player-button' onClick={() => OpenLocalPlayer(videoData.id)}>  
              <img src="/static/images/play-red.svg"  width="30px" height="30px" ></img>
              <span className='video-player-button-text'>Open Player</span>
            </div>
            <div className='video-player-button' onClick={() => OpenFolder(videoData.id)}> 
              <img src="/static/images/folder.svg"  width="30px" height="30px" ></img>
              <span className='video-player-button-text'>Open Folder</span>
            </div>
            <div className='video-player-button' onClick={() => DeleteVideo(videoData.id)}>
              <img src="/static/images/trash.svg"  width="30px" height="30px" ></img>
              <span className='video-player-button-text'>Delete Video</span>
            </div>

            {!isFavourite && (<div className='video-player-button' onClick={() => {updateVideoFavourite(true)}}>
              <img src="/static/images/like-add.svg" width="30px" height="30px" alt="" />
              <span className='video-player-button-text'>Add to favourites</span>
            </div>)}
            
            {isFavourite && (<div className='video-player-button' onClick={() => {updateVideoFavourite(false)}}>
              <img src="/static/images/like-remove.svg" width="30px" height="30px" alt="" />
              <span className='video-player-button-text'>Remove from favourites</span>
            </div>)}  

            <div className='video-player-button' onClick={() => {updateVerify(!isVerfied)}}> 
              {isVerfied && (
                  <img src="/static/images/verfied.svg" width="30px" height="30px" alt="" />
                )}
              {!isVerfied && (
                <div className="unverified-container">
                  <svg  width="30" height="30" fill="#c63c22" viewBox="0 0 16 16">
                    <path d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.71 1.71 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627z"/>
                  </svg>
                  <div className="white-background"></div> 
                </div>
              )}
              {isVerfied && (
                <span className='video-player-button-text'>Verfied</span>
              )}
              {!isVerfied && (
                <span className='video-player-button-text'>Not Verfied</span>
              )}
            </div>
            {videoData.jt_trailer_url && (<div className='video-player-button' onClick={() => window.open(videoData.jt_trailer_url)}>  
              <img src="/static/images/binocular.svg"  width="30px" height="30px" ></img>
              <span className='video-player-button-text'>Open Trailer</span>
            </div>)}
          </div>


          <div className="video-player-categories-pane">
            <div className="video-player-categories-box">
              {categories.map((categoryName, i) => (
                <a key={i} href={"/search?categories="+categoryName}>{categoryName}</a>
              ))}
            </div>
            
            <div className="player-categories-buttons-container">
              <div className="player-buttons-add-container">
                {showCategoriesAdd && (<img src="/static/images/unchecked.svg" alt="" onClick={() => {SetShowCategoriesAdd(false); SetShowCategoriesDelete(false)}}/>)}
                {!showCategoriesAdd && (<img src="/static/images/plus.svg" alt="" onClick={() => {SetShowCategoriesAdd(true); SetShowCategoriesDelete(false)}}/>)}
                {showCategoriesAdd && (<OptionsSearchBox options={allCategories} callbackFunction={addCategory} placeholder={"Add Star"}> 
                </OptionsSearchBox>)}
              </div>
              {categories.length>0 && (<div className="player-buttons-add-container">
                {showCategoriesDelete && (<img src="/static/images/unchecked.svg" alt="" onClick={() => {SetShowCategoriesDelete(false); SetShowCategoriesAdd(false)}}/>)}
                {!showCategoriesDelete && (<img src="/static/images/trash.svg" alt="" onClick={() => {SetShowCategoriesDelete(true); SetShowCategoriesAdd(false)}}/>)}
                {showCategoriesDelete && (<OptionsSearchBox options={categories} callbackFunction={deleteCategory} placeholder={"Delete Star"}> 
                </OptionsSearchBox>)}
              </div>)}
            </div>

          </div>
          {videoData.series && videoData.series.name &&(
            <div className="video-player-series-pane">
              <a href={"/search?series="+videoData.series.id}>{videoData.series.name}</a>
            </div>
          )}
          <div className="video-player-cast-pane">
            {starData.length>0 && (<div className="video-player-cast-box">
              {starData.map((data, i) => (
                <StarCard
                  key={i}
                  id={data["id"]}
                  poster={data["poster"]}
                  name={data["name"]}
                  videos={data["videos"]}
                  views={data["views"]}
                  liked={data["liked"]}
                  favourite={data["favourite"]}
                  watchtime={data["watchtime"]}
                  totaltime={data["totaltime"]}
                />
              ))}
            </div>)}

            <div className="player-cast-buttons-container">
              <div className="player-buttons-add-container">
                {showCastAdd && (<img src="/static/images/unchecked.svg" alt="" onClick={() => {SetShowCastAdd(false); SetShowCastDelete(false)}}/>)}
                {!showCastAdd && (<img src="/static/images/plus.svg" alt="" onClick={() => {SetShowCastAdd(true); SetShowCastDelete(false)}}/>)}
                {showCastAdd && (<OptionsSearchBox options={allStars} callbackFunction={addStar} placeholder={"Add Star"}> 
                </OptionsSearchBox>)}
              </div>
              {starData.length>0 && (<div className="player-buttons-add-container">
                {showCastDelete && (<img src="/static/images/unchecked.svg" alt="" onClick={() => {SetShowCastDelete(false); SetShowCastAdd(false)}}/>)}
                {!showCastDelete && (<img src="/static/images/trash.svg" alt="" onClick={() => {SetShowCastDelete(true); SetShowCastAdd(false)}}/>)}
                {showCastDelete && (<OptionsSearchBox options={cast} callbackFunction={deleteStar} placeholder={"Delete Star"}> 
                </OptionsSearchBox>)}
              </div>)}
            </div>
            
          </div>
        </div>
      </div>
      <div className="watch-next-container">
        <VideoAdvertSlide videoData={watchNextVideos} title={(videoData.series && videoData.series.name) || "Continue Watching"} />
      </div>
      <div className="discover-container">
        <VideoAdvertBox videoData={similarVideos}  title="Discover" onRefresh={refreshSimilarVideos}/>
      </div>
    </div>
  );
}

export default VideoPlayerPage;
