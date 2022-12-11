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
  }, []);

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
            {" "}
            {data["text"]}{" "}
          </a>
        ))}
      </div>

      <div className="navbar-right">
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
                subtitle_badge={previewVideo["subtitle_badge"]}
              />
            </div>
          )}
          {previewStar && (
            <div ref={previewVideoRef}>
              <StarCard
                poster={
                  previewStar["poster"]
                    ? previewStar["poster"]
                    : "https://thumbs.dreamstime.com/b/no-user-profile-picture-hand-drawn-illustration-53840792.jpg"
                }
                name={previewStar["name"]}
                videos={previewStar["videos"]}
                views={previewStar["views"]}
                favorite={previewStar["favourite"]}
                superstar={previewStar["superstar"]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
