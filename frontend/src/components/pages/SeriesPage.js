import VideoAdvertSlide from "../video/VideoAdvertSlide";
import { React, useEffect, useState, useRef } from "react";
import "../../../static/css/pages/SeriesPage.css";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { clearSiblingSelection, clearChildren, toggleDisplay } from '../utils'
import Paginator from "../paginator/Paginator"; 

function SeriesPage() {
  let [searchParams, setSearchParams] = useSearchParams();
  const seriesPerPage = 5;

  const seriesPageSortBoxRef = useRef(null);
  const castBlockContainerRef = useRef(null);
  const seriesCastBoxRef = useRef(null);

  let page_no = searchParams.get("page") || 1;
  if (page_no < 1) {
    page_no = 1;
  }

  const [seriesData, SetSeriesData] = useState([]);
  const [sortQuery, SetSortQuery] = useState(
    searchParams.get("sort_by") || "?"
  );
  const [searchQuery, SetSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [castQuery, SetCastQuery] = useState(searchParams.get("cast") || "");
  const [seriesPageLimit, SetSeriesPageLimit] = useState(
    searchParams.get("offset") || seriesPerPage
  );
  const [allStars, SetAllStars] = useState([]);
  const [seriesPageNumber, SetSeriesPageNumber] = useState(page_no);
  const [seriesCount, SetSeriesCount] = useState(0);
  const [numberOfPages, SetNumberOfPages] = useState(0);
  const [refresherCount, SetRefresherCount] = useState(0);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/series",
      params: {
        limit: seriesPageLimit,
        offset: (seriesPageNumber - 1) * seriesPageLimit,
        query: searchQuery,
        cast: castQuery,
        sort_by: sortQuery,
      },
    }).then((response) => {
      SetSeriesData(response.data.results);
      SetSeriesCount(response.data["count"]);
    });
  }, [sortQuery, castQuery, seriesPageNumber, refresherCount]);

  useEffect(() => {
    axios({
      method: "get",
      url: "api/series",
      params: {
        limit: seriesPageLimit,
        offset: (seriesPageNumber - 1) * seriesPageLimit,
        query: searchQuery,
        cast: castQuery,
        sort_by: sortQuery,
      },
    }).then((response) => {
      SetSeriesData(response.data.results);
      SetSeriesCount(response.data["count"]);
      SetAllStars(response.data["all_stars"]);
    });
  }, [searchQuery]);

  useEffect(() => {
    SetSeriesPageNumber(1);
    SetNumberOfPages(Math.ceil(seriesCount / seriesPageLimit));
  }, [seriesCount]);

  const handleSortOnClick = (e) => {
    let clickedSort = e.currentTarget;
    let clickedText = clickedSort.innerText
      .toLowerCase()
      .replace("surprise", "?")
      .trim();

    if (clickedText=="?"){
      if (sortQuery==="?"){
        SetRefresherCount(refresherCount+1)
      }else{
        SetSortQuery("?");
      }
      return
    }

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

  const handleSearchTextChange = (e) => {
    SetSeriesPageNumber(1);
    SetSearchQuery(e.currentTarget.value);
  };

  const clearAllFilters = (e) => {
    SetSortQuery("?");
    SetSearchQuery("");
    SetCastQuery("");
    clearChildren(castBlockContainerRef.current);
    clearChildren(seriesPageSortBoxRef.current);
  };

  const handleHamburgerOnClick = (e) => {
    toggleDisplay(seriesCastBoxRef.current);
  };

  const handleCastOnClick = (e) => {
    SetSeriesPageNumber(1);
    SetCastQuery(clearSiblingSelection(e));
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const paginatorCallback = (val) => {
    SetSeriesPageNumber(val)
  };

  return (
    <div className="series-page-container">
      <div className="series-filter-parent">
        <div className="series-page-filters-container">
          <div className="series-page-filters-right" ref={seriesPageSortBoxRef}>
            <input
              type="text"
              name="series-search-box"
              className="series-search-box"
              onChange={handleSearchTextChange}
            />
            <div>
              {seriesCount || "No"} Series
            </div>
            <div
              className="series-page-sort selected-filter"
              onClick={handleSortOnClick}
            >
              <span>Surprise</span>
            </div>
            <div className="series-page-sort" onClick={handleSortOnClick}>
              <span>Created</span>
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
            <div className="series-page-sort" onClick={handleSortOnClick}>
              <span>Updated</span>
              {sortQuery === "-updated" && (
                <img
                  src="static/images/down.png"
                  alt=""
                  className="sort-direction"
                />
              )}
              {sortQuery === "updated" && (
                <img
                  src="static/images/up.png"
                  alt=""
                  className="sort-direction"
                />
              )}
            </div>
            <div className="series-page-sort" onClick={handleSortOnClick}>
              <span>Videos</span>
              {sortQuery === "-videos" && (
                <img
                  src="static/images/down.png"
                  alt=""
                  className="sort-direction"
                />
              )}
              {sortQuery === "videos" && (
                <img
                  src="static/images/up.png"
                  alt=""
                  className="sort-direction"
                />
              )}
            </div>
            <div className="series-page-clear-filter" onClick={clearAllFilters}>
              <span>Clear</span>
            </div>
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
        <div>
          <div className="series-cast-box" ref={seriesCastBoxRef}>
            <div className="series-labels-cast-title">
              CAST
              <img
                src="static/images/down.png"
                alt=""
                className="sort-direction"
              />
            </div>
            <div className="series-labels-cast-data" ref={castBlockContainerRef}>
              {allStars.map((data, i) => (
                <div
                  key={i}
                  className="series-labels-cast"
                  onClick={handleCastOnClick}
                >
                  {data}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="series-data-container">
        {seriesData.map((data, i) => (
          <VideoAdvertSlide
            key={i}
            videoData={data.video_data}
            title={data.name}
          />
        ))}
      </div>
      <div className="series-page-pagination-container">
            {seriesPageNumber && sortQuery != "?" && (
              <Paginator pageNo={seriesPageNumber} numberOfPages={numberOfPages} paginatorCallback={paginatorCallback}/>
            )}
          </div>
    </div>
  );
}

export default SeriesPage;
