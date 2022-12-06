import { React, useRef, useEffect, useState } from "react";
import VideoCard from "../video/VideoCard";
import MultiRangeSlider from "../slider/MultiRangeSlider";
import Paginator from "../paginator/Paginator"; 
import axios from "axios";
import "../../../static/css/pages/SearchPage.css";
import { useSearchParams } from "react-router-dom";

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
  const [videosPageNumber, SetVideosPageNumber] = useState(page_no);
  const [maxDurationBar, SetMaxDurationBar] = useState(0);
  const [minDurationBar, SetMinDurationBar] = useState(0);
  const [videoCount, SetVideoCount] = useState(0);
  const [numberOfPages, SetNumberOfPages] = useState(0);

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
      },
    }).then((response) => {
      SetVideoData(response.data.results);
      SetVideoCount(response.data["count"]);
    });
  }, [sortQuery, filterQuery, castQuery, categoryQuery, videosPageNumber]);

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

  const clearSiblingSelection = (target) => {
    let clickedSort = target.currentTarget;
    let clickedSiblings = clickedSort.parentElement.children;
    let sameButton = [...clickedSort.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    let textData = "";
    if (!sameButton) {
      clickedSort.classList.add("selected-filter");
      textData = clickedSort.innerText.toLowerCase().trim();
    }
    return textData;
  };

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

  const toggleDisplay = (target) => {
    if (target.style.display === "") {
      target.style.display = "flex";
    } else {
      target.style.display = "";
    }
  };

  const handleHamburgerOnClick = (e) => {
    toggleDisplay(labelsContainerRef.current);
    toggleDisplay(durationRangeRef.current);
  };

  const sliderValueChange = (min, max) => {
    SetMaxDuration(max);
    SetMinDuration(min);
  };

  const clearChildern = (target) => {
    [...target.children].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
  };

  const clearAllFilters = (e) => {
    SetSortQuery("-created");
    SetFilterQuery("");
    SetSearchQuery("");
    SetCastQuery("");
    SetCategoryQuery("");
    SetMaxDuration(minDurationBar);
    SetMinDuration(maxDurationBar);
    clearChildern(castBlockContainerRef.current);
    clearChildern(categoryBlockContainerRef.current);
    clearChildern(searchPageFilterBoxRef.current);
    clearChildern(searchPageSortBoxRef.current);
  };

  const paginatorCallback = (val) => {
    SetVideosPageNumber(val)
  };

  return (
    <div className="search-page-container">
      <div className="search-page-filters-container">
        <div className="search-page-filters-left">
          {videoCount} videos found
        </div>
        <div className="search-page-filters-right">
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
            />
          </div>
          {maxDurationBar > 0 && (
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
                subtitle_badge={data["subtitle_badge"]}
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
