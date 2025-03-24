import { React, useState, useEffect, useRef } from "react";
import VideoCard from "../video/VideoCard";
import StarCard from "../star/StarCard";
import "../../../static/css/navbar/SearchRecommendations.css";
import axios from "axios";

const SearchRecommendations = (props) => {
  const [searchResultsCast, setSearchResultsCast] = useState([]);
  const [searchResultsVideos, setSearchResultsVideos] = useState([]);
  const [searchResultsCategories, setSearchResultsCategories] = useState([]);

  const [previewVideo, setPreviewVideo] = useState(false);
  const [previewStar, setPreviewStar] = useState(false);

  const previewVideoRef = useRef(null);
  const previewStarRef = useRef(null);
  const recommendationsRef = useRef(null);

  useEffect(() => {
    document.onclick = function (e) {
      var target = e && e.target;
      var display = "hide";

      while (target.parentNode) {
        if (
          target == previewVideoRef.current ||
          target == previewStarRef.current
        ) {
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
    recommendationsRef.current.style.display = "block"
    setPreviewVideo(false);
    setPreviewStar(false);
    axios({
      method: "get",
      url: "/api/mastersearch",
      params: {
        query: props.searchText,
      },
    }).then((response) => {
      setSearchResultsCast(response.data.cast);
      setSearchResultsVideos(response.data.videos);
      setSearchResultsCategories(response.data.categories);
    });
  }, [props.searchText]);

  const closeRecommendations = (e) => {
    recommendationsRef.current.style.display = "none"
  };

  return (
    <div className="search-recommendations"  ref={recommendationsRef}>
      {(searchResultsCast.length > 0 ||
        searchResultsVideos.length > 0 ||
        searchResultsCategories.length > 0) && (
        <div className="navbar-search-container">
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
                      href={"/search?categories=" + data.title}
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
          <img src="/static/images/close.svg" alt="" className="navbar-search-close" onClick={closeRecommendations}/>         
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
              previewThumbnail={previewVideo["preview_poster"]}
              progress={previewVideo["progress"]}
              duration={previewVideo["duration"]}
              created={previewVideo["created"]}
              badge={previewVideo["badge"]}
              specialTag={previewVideo["special_tag"]}
              watchTime={previewVideo["watch_time"]}
              subtitleBadge={previewVideo["subtitle_badge"]}
              size={previewVideo["size"]}
              jtTrailerUrl={previewVideo["jt_trailer_url"]}
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
              watchtime={previewStar["watchtime"]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRecommendations;
