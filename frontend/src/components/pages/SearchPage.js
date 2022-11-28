import { React, useRef, useEffect, useState } from "react";
import VideoCard from "../video/VideoCard";
import MultiRangeSlider from "../slider/MultiRangeSlider";
import axios from "axios";
import "../../../static/css/pages/SearchPage.css";

function SearchPage() {
  const [videoData, SetVideoData] = useState([]);

  const videosPerPage = 30;
  const labelsContainerRef = useRef(null);
  const castBlockContainerRef = useRef(null);
  const categoryBlockContainerRef = useRef(null);
  const durationRangeRef = useRef(null);

  const [allStars, SetAllStars] = useState([]);
  const [allCategories, SetAllCategories] = useState([]);
  const [sortQuery, SetSortQuery] = useState("-created");
  const [filterQuery, SetFilterQuery] = useState("");
  const [searchQuery, SetSearchQuery] = useState("");
  const [castQuery, SetCastQuery] = useState("");
  const [categoryQuery, SetCategoryQuery] = useState("");
  const [videosPageOffset, SetVideosPageOffset] = useState("");
  const [videosPageNumber, SetVideosPageNumber] = useState("");
  const [maxDuration, SetMaxDuration] = useState(0);
  const [minDuration, SetMinDuration] = useState(0);
  const [maxDurationBar, SetMaxDurationBar] = useState(0);
  const [minDurationBar, SetMinDurationBar] = useState(0);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: videosPerPage,
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
    });
  }, [
    sortQuery,
    filterQuery,
    castQuery,
    categoryQuery,
  ]);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: videosPerPage,
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
    });
  }, [
    searchQuery,
    maxDuration,
    minDuration,
  ]);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/videos",
      params: {
        limit: videosPerPage,
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
    });
  }, []);

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
    SetFilterQuery(filterText);
  };

  const handleSearchQueryChange = (e) => {
    SetSearchQuery(e.currentTarget.value);
  };

  const handleCastOnClick = (e) => {
    SetCastQuery(clearSiblingSelection(e));
  };

  const handleCategoryOnClick = (e) => {
    SetCategoryQuery(clearSiblingSelection(e));
  };

  const toggleDisplay = (target) => {
    if (target.style.display === "") {
      target.style.display = "flex";
    } else {
      target.style.display = "";
    }
  };

  const handleHamburgerOnClick = (e) => {
    toggleDisplay(labelsContainerRef.current)
    toggleDisplay(durationRangeRef.current)
  };

  const toggleCastBlock = (e) => {
    toggleDisplay(castBlockContainerRef.current)
  };

  const toggleCategoryBlock = (e) => {
    toggleDisplay(categoryBlockContainerRef.current)
  };

  const sliderValueChange = (min, max) => {
    SetMaxDuration(max);
    SetMinDuration(min);
  };

  return (
    <div className="search-page-container">
      <div className="search-page-filters-container">
        <div className="search-page-filter-box">
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
        <div className="search-page-sort-box">
          <div className="search-page-filter" onClick={handleFilterOnClick}>
            <span>Recommended</span>
          </div>
          <div className="search-page-filter" onClick={handleFilterOnClick}>
            <span>Favourites</span>
          </div>
        </div>
        <div>
          <img src="static/images/dice.png" alt="" className="random-button" />
        </div>
        {maxDurationBar > 0 && (
          <MultiRangeSlider
            min={minDurationBar}
            max={maxDurationBar}
            durationRangeRef = {durationRangeRef}
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
      <div className="search-page-content-container">
        <div className="video-adverts-container">
          {videoData.map((data, i) => (
            <VideoCard
              key={i}
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
              resolution={data["resolution"]}
              specialTag={data["special_tag"]}
            />
          ))}
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
            <div className="video-labels-cast-title" onClick={toggleCastBlock}>CAST <img
                src="static/images/down.png"
                alt=""
                className="sort-direction"
              /></div>
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
            <div className="video-labels-category-title" onClick={toggleCategoryBlock}>CATEGORIES <img
                src="static/images/down.png"
                alt=""
                className="sort-direction"
              /></div>
            <div className="video-labels-category-data" ref={categoryBlockContainerRef}>
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
