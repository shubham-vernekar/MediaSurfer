import "../../static/css/navbar.css";
import VideoCard from "./video/VideoCard";
import StarCard from "./star/StarCard";
import { React, useState, useEffect, useRef } from "react";
import axios from "axios";

function Navbar(props) {
  const [navbarData, setNavbarData] = useState([]);

  const [searchResultsCast, setSearchResultsCast] = useState([]);
  const [searchResultsVideos, setSearchResultsVideos] = useState([]);
  const [searchResultsCategories, setSearchResultsCategories] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [previewVideo, setPreviewVideo] = useState(false);
  const [previewStar, setPreviewStar] = useState(false);

  const [alertMsg, setAlertMsg] = useState(false);
  const [scanMsg, setScanMsg] = useState(false);

  const previewVideoRef = useRef(null);
  const previewStarRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/navbar",
    }).then((response) => {
      setNavbarData(response.data["results"]);
    });

    getPending();

    const interval = setInterval(() => {
      getPending();
    }, 10000);
    return () => clearInterval(interval);

  }, []);

  const getPending = () => {
    axios({
      method: "get",
      url: "/api/pending",
    }).then((response) => {
      if (parseInt(response.data.pending)>0){
        setScanMsg(response.data.pending + " new videos");
      }
      if (parseInt(response.data.unsupported)>0){
        setAlertMsg(response.data.unsupported + " unsupported videos");
      }
    });
  };

  useEffect(() => {
    document.onclick = function (e) {
      var target = e && e.target;
      var display = "hide";

      while (target.parentNode) {
        if (target == previewVideoRef.current || target == previewStarRef.current) {
          display = "show";
          break;
        }
        target = target.parentNode;
      }
      if (display === "hide") {
        setPreviewVideo(false);
        setPreviewStar(false);
      }
    };
  }, []);

  const onSearchTextChange = (e) => {
    setSearchText(e.currentTarget.value);
    setPreviewVideo(false);
    setPreviewStar(false);
  };

  const searchSubmit = (e) => {
    e.preventDefault()
    if (searchInputRef.current.value){
      window.location.href = "/search?query=" + searchInputRef.current.value
    }
  };

  const onMouseEnterHandler = (e) => {
    let searchType = e.currentTarget.getAttribute("type");
    let identifier = parseInt(e.currentTarget.getAttribute("identifier"));
    if (searchType === "video") {
      setPreviewVideo(searchResultsVideos[identifier]);
      setPreviewStar(false);
    } else if (searchType === "cast") {
      setPreviewVideo(false);
      setPreviewStar(searchResultsCast[identifier]);
    } else {
      setPreviewVideo(false);
      setPreviewStar(false);
    }
  };

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/mastersearch",
      params: {
        query: searchText,
      },
    }).then((response) => {
      setSearchResultsCast(response.data.cast);
      setSearchResultsVideos(response.data.videos);
      setSearchResultsCategories(response.data.categories);
    });
  }, [searchText]);

  const scanLocalVideos = (e) => {
    axios({
      method: "post",
      url: "/api/scan"
    });
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo-img" src="/static/images/logo.png" alt="" />
        {navbarData.map((data, i) => (
          <a
            key={i}
            href={data["url"]}
            className="navbar-items"
            target={data["target"]}
          >
            {data["text"]}
          </a>
        ))}
      </div>

      <div className="navbar-right">
        <div className="scanner-container">

          <div className="navbar-populate" onClick={scanLocalVideos}>
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
              <path d="M13.5 10a.5.5 0 0 1 .5.5V12h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V13h-1.5a.5.5 0 0 1 0-1H13v-1.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
            {scanMsg && (<div>
              <div className="scan-alert-icon"></div>
              <div className="scan-msg-text">
                {scanMsg}
              </div>
            </div>)}
          </div>

          {alertMsg && (<div className="alert-msg-box">
            <img className="alert-msg-icon" src="/static/images/alert.svg" alt="" />
            <div className="alert-msg-text">
              {alertMsg}
            </div>
          </div>)}

        </div>

        <div className="navbar-search-box">
          <form onSubmit={searchSubmit}>
            <input
              type="search"
              placeholder="What are you looking for?"
              onChange={onSearchTextChange}
              ref={searchInputRef}
            />
            <button>Search</button>
          </form>
        </div>
        {(searchResultsCast.length > 0 ||
          searchResultsVideos.length > 0 ||
          searchResultsCategories.length > 0) && (
          <div className="navbar-search-results">
            {searchResultsVideos.length > 0 && (
              <div className="search-results-box search-results-videos">
                <div className="search-results-title">Videos</div>
                <div className="search-results-data">
                  {searchResultsVideos.map((data, i) => (
                    <a
                      key={i}
                      className="search-results-link"
                      href={"/player/" + data.id}
                      target="_blank"
                    >
                      <li
                        className="search-results"
                        identifier={i}
                        type="video"
                        onMouseEnter={onMouseEnterHandler}
                      >
                        {data.title}
                      </li>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {searchResultsCast.length > 0 && (
              <div className="search-results-box search-results-stars">
                <div className="search-results-title">Stars</div>
                <div className="search-results-data">
                  {searchResultsCast.map((data, i) => (
                    <a
                      key={i}
                      className="search-results-link"
                      href={"/search?cast=" + data.name}
                      target="_blank"
                    >
                      <li
                        className="search-results"
                        identifier={i}
                        type="cast"
                        onMouseEnter={onMouseEnterHandler}
                      >
                        {data.name}
                      </li>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {searchResultsCategories.length > 0 && (
              <div className="search-results-box search-results-categories">
                <div className="search-results-title">Categories</div>
                <div className="search-results-data">
                  {searchResultsCategories.map((data, i) => (
                    <a
                      key={i}
                      className="search-results-link"
                      href={"/search?category=" + data.title}
                      target="_blank"
                    >
                      <li
                        className="search-results"
                        identifier={i}
                        type="category"
                        onMouseEnter={onMouseEnterHandler}
                      >
                        {data.title}
                      </li>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="navbar-search-poster">
          {previewVideo && (
            <div ref={previewStarRef}>
              <VideoCard
                vidid={previewVideo["id"]}
                title={previewVideo["title"]}
                categories={previewVideo["categories"]}
                cast={previewVideo["cast"]}
                views={previewVideo["views"]}
                favorite={previewVideo["favourite"]}
                preview={previewVideo["preview"]}
                previewThumbnail={previewVideo["preview_thumbnail"]}
                progress={previewVideo["progress"]}
                duration={previewVideo["duration"]}
                created={previewVideo["created"]}
                badge={previewVideo["badge"]}
                specialTag={previewVideo["special_tag"]}
                watchTime={previewVideo["watch_time"]}
                subtitleBadge={previewVideo["subtitle_badge"]}
              />
            </div>
          )}
          {previewStar && (
            <div ref={previewVideoRef}>
              <StarCard
                id={previewStar["id"]}
                poster={previewStar["poster"]}
                name={previewStar["name"]}
                videos={previewStar["videos"]}
                views={previewStar["views"]}
                liked={previewStar["liked"]}
                favourite={previewStar["favourite"]}
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default Navbar;
