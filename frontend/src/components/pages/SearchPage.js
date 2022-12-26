import { React, useRef, useEffect, useState } from "react";
import VideoCard from "../video/VideoCard";
import MultiRangeSlider from "../utils/MultiRangeSlider";
import Paginator from "../paginator/Paginator"; 
import axios from "axios";
import "../../../static/css/pages/SearchPage.css";
import { useSearchParams } from "react-router-dom";
import { clearSiblingSelection, clearChildren, toggleDisplay } from '../utils'

function SearchPage() {
  const [videoData, SetVideoData] = useState([]);

  let [searchParams, setSearchParams] = useSearchParams();

  const videosPerPage = 18;
  const labelsContainerRef = useRef(null);
  const castBlockContainerRef = useRef(null);
  const categoryBlockContainerRef = useRef(null);
  const durationRangeRef = useRef(null);
  const searchPageFilterBoxRef = useRef(null);
  const searchPageSortBoxRef = useRef(null);
  const durationQueryRef = useRef(null);

  let page_no = searchParams.get("page") || 1;
  if (page_no < 1) {
    page_no = 1;
  }

  const [allStars, SetAllStars] = useState([]);
  const [allCategories, SetAllCategories] = useState([]);
  const [sortQuery, SetSortQuery] = useState(
    searchParams.get("sort_by") || "-created"
  );
  const [filterQuery, SetFilterQuery] = useState(
    searchParams.get("filter") || ""
  );
  const [searchQuery, SetSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [castQuery, SetCastQuery] = useState(searchParams.get("cast") || "");
  const [categoryQuery, SetCategoryQuery] = useState(
    searchParams.get("category") || ""
  );
  const [videosPageLimit, SetVideosPageLimit] = useState(
    searchParams.get("offset") || videosPerPage
  );
  const [maxDuration, SetMaxDuration] = useState(
    searchParams.get("max_duration") || 0
  );
  const [minDuration, SetMinDuration] = useState(
    searchParams.get("min_duration") || 0
  );
  const [seriesQuery, SetSeriesQuery] = useState(
    searchParams.get("series") || ""
  );
  const [videosPageNumber, SetVideosPageNumber] = useState(page_no);
  const [maxDurationBar, SetMaxDurationBar] = useState(0);
  const [minDurationBar, SetMinDurationBar] = useState(0);
  const [videoCount, SetVideoCount] = useState(0);
  const [numberOfPages, SetNumberOfPages] = useState(0);
  const [durationQueryText, SetDurationQueryText] = useState("");

  useEffect(() => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: videosPageLimit,
        offset: (videosPageNumber - 1) * videosPageLimit,
        query: searchQuery,
        cast: castQuery,
        sort_by: sortQuery,
        filter: filterQuery,
        duration_max: maxDuration,
        duration_min: minDuration,
        categories: categoryQuery,
        series: seriesQuery,
      },
    }).then((response) => {
      SetVideoData(response.data.results);
      SetVideoCount(response.data["count"]);
    });
  }, [sortQuery, filterQuery, castQuery, categoryQuery, videosPageNumber, seriesQuery]);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: videosPageLimit,
        offset: (videosPageNumber - 1) * videosPageLimit,
        query: searchQuery,
        cast: castQuery,
        sort_by: sortQuery,
        filter: filterQuery,
        duration_max: maxDuration,
        duration_min: minDuration,
        categories: categoryQuery,
        series: seriesQuery,
      },
    }).then((response) => {
      SetVideoData(response.data.results);
      SetAllStars(response.data["all_stars"]);
      SetAllCategories(response.data["all_categories"]);
      SetVideoCount(response.data["count"]);
    });
  }, [searchQuery, maxDuration, minDuration]);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: videosPageLimit,
        offset: (videosPageNumber - 1) * videosPageLimit,
        query: searchQuery,
        cast: castQuery,
        sort_by: sortQuery,
        categories: categoryQuery,
        series: seriesQuery,
      },
    }).then((response) => {
      SetVideoData(response.data.results);
      SetMaxDurationBar(response.data["max_duration"]);
      SetMinDurationBar(response.data["min_duration"]);
      SetAllStars(response.data["all_stars"]);
      SetAllCategories(response.data["all_categories"]);
      SetVideoCount(response.data["count"]);
    });
  }, []);

  useEffect(() => {
    SetVideosPageNumber(1)
    SetNumberOfPages(Math.ceil(videoCount/videosPageLimit))
  }, [videoCount]);

  const handleSortOnClick = (e) => {
    let clickedSort = e.currentTarget;
    let clickedText = clickedSort.innerText
      .toLowerCase()
      .replace("latest", "created")
      .replace("longest", "duration")
      .replace("surprise", "?")
      .trim();
    let clickedSiblings = clickedSort.parentElement.children;
    let sameButton = [...clickedSort.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    if (!sameButton) {
      clickedSort.classList.add("selected-filter");
      SetSortQuery(clickedText);
    } else {
      if (sortQuery === clickedText && clickedText != "?") {
        clickedSort.classList.add("selected-filter");
        SetSortQuery("-" + clickedText);
      } else {
        SetSortQuery("");
      }
    }
  };

  const handleFilterOnClick = (e) => {
    let filterText = clearSiblingSelection(e)
      .replace("latest", "created")
      .replace("longest", "duration")
      .replace("surprise", "?");
    SetVideosPageNumber(1);
    SetFilterQuery(filterText);
  };

  const handleSearchQueryChange = (e) => {
    SetVideosPageNumber(1);
    SetSearchQuery(e.currentTarget.value);
  };

  const handleCastOnClick = (e) => {
    SetVideosPageNumber(1);
    SetCastQuery(clearSiblingSelection(e));
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const handleCategoryOnClick = (e) => {
    SetVideosPageNumber(1);
    SetCategoryQuery(clearSiblingSelection(e));
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const handleHamburgerOnClick = (e) => {
    toggleDisplay(labelsContainerRef.current);
    toggleDisplay(durationRangeRef.current);
  };

  const sliderValueChange = (min, max) => {
    if(durationQueryText.trim()==""){
      SetMaxDuration(max);
      SetMinDuration(min);
    }
  };

  const openRandomSearchVideo = (e) => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: 1,
        query: searchQuery,
        cast: castQuery,
        sort_by: "?",
        filter: filterQuery,
        duration_max: maxDuration,
        duration_min: minDuration,
        categories: categoryQuery,
        series: seriesQuery,
      },
    }).then((response) => {
      if (response.data.results.length>0) {
        window.open("/player/"+response.data.results[0]["id"], '_blank');
      }
    });
  }


  const clearAllFilters = (e) => {
    SetSortQuery("-created");
    SetFilterQuery("");
    SetSearchQuery("");
    SetCastQuery("");
    SetCategoryQuery("");
    durationQueryRef.current.value = ""
    SetDurationQueryText("")
    SetMaxDuration(minDurationBar);
    SetMinDuration(maxDurationBar);
    clearChildren(castBlockContainerRef.current);
    clearChildren(categoryBlockContainerRef.current);
    clearChildren(searchPageFilterBoxRef.current);
    clearChildren(searchPageSortBoxRef.current);
  };

  const paginatorCallback = (val) => {
    SetVideosPageNumber(val)
  };

  const handleDurationInput = (e) => {
    SetDurationQueryText(e.currentTarget.value)
  };

  useEffect(() => {
    let hh=0, mm=0, ss=0;
    let durationQuery = durationQueryText.replace(/\D+/, '-');
    durationQuery = durationQuery.split(/\D/);
    if (durationQuery[2]){
      hh = parseInt(durationQuery[0])
      mm = parseInt(durationQuery[1])
      ss = parseInt(durationQuery[2])
    }else if (durationQuery[1]){
      mm = parseInt(durationQuery[0])
      ss = parseInt(durationQuery[1])
    }else if (durationQuery[0]){
      ss = parseInt(durationQuery[0])
    }

    let maxDurationSecs = hh*3600 + mm*60 + ss
    if (maxDurationSecs>120){
      SetMaxDuration(maxDurationSecs)
    }
  }, [durationQueryText]);

  
  return (
    <div className="search-page-container">
      <div className="search-page-filters-container">
        <div className="search-page-filters-left">
          {videoCount || "No"} videos found
        </div>
        <div className="search-page-filters-right">
          <div className="search-page-duration-query-box-container">
            <input
              type="text"
              name="duration-box"
              className="search-page-duration-query-box"
              placeholder="HH:MM"
              onChange={handleDurationInput}
              ref={durationQueryRef}
            />
          </div>
          <div className="search-page-filter-box" ref={searchPageFilterBoxRef}>
            <div
              className="search-page-sort selected-filter"
              onClick={handleSortOnClick}
            >
              <span>Latest</span>
              {sortQuery === "-created" && (
                <img
                  src="static/images/down.png"
                  alt=""
                  className="sort-direction"
                />
              )}
              {sortQuery === "created" && (
                <img
                  src="static/images/up.png"
                  alt=""
                  className="sort-direction"
                />
              )}
            </div>
            <div className="search-page-sort" onClick={handleSortOnClick}>
              <span>Longest</span>
              {sortQuery === "-duration" && (
                <img
                  src="static/images/down.png"
                  alt=""
                  className="sort-direction"
                />
              )}
              {sortQuery === "duration" && (
                <img
                  src="static/images/up.png"
                  alt=""
                  className="sort-direction"
                />
              )}
            </div>
            <div className="search-page-sort" onClick={handleSortOnClick}>
              <span>Size</span>
              {sortQuery === "-size" && (
                <img
                  src="static/images/down.png"
                  alt=""
                  className="sort-direction"
                />
              )}
              {sortQuery === "size" && (
                <img
                  src="static/images/up.png"
                  alt=""
                  className="sort-direction"
                />
              )}
            </div>
            <div className="search-page-sort" onClick={handleSortOnClick}>
              <span>Surprise</span>
            </div>
          </div>
          <div className="search-page-sort-box" ref={searchPageSortBoxRef}>
            <div className="search-page-filter" onClick={handleFilterOnClick}>
              <span>Recommended</span>
            </div>
            <div className="search-page-filter" onClick={handleFilterOnClick}>
              <span>Favourites</span>
            </div>
            <div className="search-page-filter" onClick={handleFilterOnClick}>
              <span>New</span>
            </div>
          </div>
          <div className="search-page-clear-filter" onClick={clearAllFilters}>
            Clear
          </div>
          <div>
            <img
              src="static/images/dice.png"
              alt=""
              className="random-button"
              onClick={openRandomSearchVideo}
            />
          </div>
          {maxDurationBar > 0 && videoData.length>1 && durationQueryText.trim()=="" && (
            <MultiRangeSlider
              min={minDurationBar}
              max={maxDurationBar}
              durationRangeRef={durationRangeRef}
              onChange={({ min, max }) => sliderValueChange(min, max)}
            />
          )}
          <div>
            <img
              src="static/images/hamburger.png"
              alt=""
              className="video-filters-hamburger"
              onClick={handleHamburgerOnClick}
            />
          </div>
        </div>
      </div>

      <div className="search-page-content-container">
        <div className="search-videos-box">
          <div className="video-adverts-container">
            {videoData.map((data, i) => (
              <VideoCard
                key={i}
                vidid={data["id"]}
                title={data["title"]}
                categories={data["categories"]}
                cast={data["cast"]}
                views={data["views"]}
                favorite={data["favourite"]}
                preview={data["preview"]}
                previewThumbnail={data["preview_thumbnail"]}
                progress={data["progress"]}
                duration={data["duration"]}
                created={data["created"]}
                badge={data["badge"]}
                specialTag={data["special_tag"]}
                watchTime={data["watch_time"]}
                subtitleBadge={data["subtitle_badge"]}
                size={data["size"]}
              />
            ))}
          </div>
          <div className="search-page-pagination-container">
            {videosPageNumber && (
              <Paginator pageNo={videosPageNumber} numberOfPages={numberOfPages} paginatorCallback={paginatorCallback}/>
            )}
          </div>
        </div>
        <div className="video-labels-container" ref={labelsContainerRef}>
          <input
            type="text"
            name="query-box"
            className="search-page-query-box"
            placeholder="Search"
            onChange={handleSearchQueryChange}
          />
          <div className="video-labels-cast-box">
            <div className="video-labels-cast-title">
              CAST
              <img
                src="static/images/down.png"
                alt=""
                className="sort-direction"
              />
            </div>
            <div className="video-labels-cast-data" ref={castBlockContainerRef}>
              {allStars.map((data, i) => (
                <div
                  key={i}
                  className="video-labels-cast"
                  onClick={handleCastOnClick}
                >
                  {data}
                </div>
              ))}
            </div>
          </div>
          <div className="video-labels-category-box">
            <div
              className="video-labels-category-title"
            >
              CATEGORIES
              <img
                src="static/images/down.png"
                alt=""
                className="sort-direction"
              />
            </div>
            <div
              className="video-labels-category-data"
              ref={categoryBlockContainerRef}
            >
              {allCategories.map((data, i) => (
                <div
                  key={i}
                  className="video-labels-category"
                  onClick={handleCategoryOnClick}
                >
                  {data}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
