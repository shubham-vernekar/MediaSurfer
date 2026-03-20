import Spinner from "../utils/Spinner";
import { useSearchParams } from 'react-router-dom';
import { React, useEffect, useState, useRef } from "react";
import "../../../static/css/pages/DebridPage.css";
import Paginator from "../utils/Paginator"; 
import DebridCard from "../debrid/DebridCard";
import axios from "axios";
import { getDurationText, getCreatedDate, secondsToHHMMSS, getSize, getCookie } from '../utils'

function DebridPage() {
  const videosPerPage = 20;
  const [searchParams, setSearchParams] = useSearchParams();
  const [videoData, SetVideoData] = useState([]);
  const [loading, SetLoading] = useState(false);
  const [videoCount, SetVideoCount] = useState(0);
  const [numberOfPages, SetNumberOfPages] = useState(0);
  const [searchQuery, SetSearchQuery] = useState(searchParams.get("query") || "");
  const [sortQuery, SetSortQuery] = useState(searchParams.get("sort_by") || "");
  const [parentQuery, SetParentQuery] = useState(searchParams.get("parent") || "");
  const [filterQuery, SetFilterQuery] = useState(searchParams.get("filter") || "");

  let page_no = searchParams.get("page") || 1;
  if (page_no < 1) {
    page_no = 1;
  }
  const [currentPageNumber, SetCurrentPageNumber] = useState(page_no);

  useEffect(() => {
  }, []);

  useEffect(() => {
    axios({
      method: "get",
      url: "/api/videos/debrid",
      params: {
        limit: videosPerPage,
        offset: (currentPageNumber - 1) * videosPerPage,
        query: searchQuery,
        sort_by: sortQuery,
        parent: parentQuery,
        filter: filterQuery,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
    }).then((response) => {
        // console.log(response.data);
        SetVideoData(response.data.results);
        SetVideoCount(response.data.count);
    });
  }, [currentPageNumber, searchQuery, sortQuery, parentQuery, filterQuery]);

  useEffect(() => {
    SetNumberOfPages(Math.ceil(videoCount/videosPerPage))
  }, [videoCount]);

  useEffect(() => {
    SetCurrentPageNumber(1)
  }, [searchQuery]);


  const paginatorCallback = (val) => {
    SetCurrentPageNumber(val)
  };

  const handleSortOnClick = (e) => {
    let clickedSort = e.currentTarget;
    let clickedText = clickedSort.innerText
      .toLowerCase()
      .replace("latest", "added")
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
      SetSortQuery("-" + clickedText);
    } else {
      if (sortQuery === "-" + clickedText && clickedText != "?") {
        clickedSort.classList.add("selected-filter");
        SetSortQuery(clickedText);
      } else {
        SetSortQuery("");
      }
    }
  };

  const handleFilterOnClick = (e) => {
    let clickedSort = e.currentTarget;
    let clickedText = clickedSort.innerText
    if (filterQuery == clickedText){
      clickedText = ""
    }
    
    SetCurrentPageNumber(1);
    SetFilterQuery(clickedText);
  };

  const clearAllFilters = (e) => {
    SetSortQuery("");
    SetFilterQuery("");
  };

  const handleDeleteVideo = (id) => {
    SetVideoData(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div>
      <div>
        <div className="debrid-search-input-container">
          <div className="debrid-search-title" onClick={() => window.open("/debrid/manager", '_blank').focus()}> 
            DEBRID MANAGER
          </div>
          <div className="debrid-input-container">
            <div className="debrid-input-box">
              <div>
                <div className="debrid-add-page" onClick={() => window.open("/debrid/add", '_blank').focus()}>
                  Add Video
                </div>
              </div>
              <input
                  type="url"
                  value={searchQuery}
                  onChange={(e) => SetSearchQuery(e.target.value)}
                  placeholder="Search Debrid Videos..."
                  className="debrid-url-input"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="search-page-filters-container">
        <div className="search-page-filters-left debrid-page-filters-left">
          {videoCount || "No"} videos found
        </div>

        <div className="search-page-filters-right debrid-page-filters-right">
          <div className="search-page-filter-box">
            <div className="search-page-sort selected-filter" onClick={handleSortOnClick}>
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
              <span>Views</span>
              {sortQuery === "-views" && (
                <img
                  src="static/images/down.png"
                  alt=""
                  className="sort-direction"
                />
              )}
              {sortQuery === "views" && (
                <img
                  src="static/images/up.png"
                  alt=""
                  className="sort-direction"
                />
              )}
            </div>
            <div className="search-page-filter" onClick={handleFilterOnClick}>
              <span>Favourites</span>
            </div>
            <div className="search-page-sort" onClick={handleSortOnClick}>
              <span>Surprise</span>
            </div>
          </div>

          <div className="search-page-clear-filter" onClick={clearAllFilters}>
            Clear
          </div>
        </div>
      </div>


      <div className="debrid-adverts-container">
        {videoData.map((data, i) => (
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
            url={data["url"]}
            onDelete={handleDeleteVideo}
          />
        ))}
      </div>

      <div className="search-page-pagination-container">
        {currentPageNumber && (
          <Paginator pageNo={currentPageNumber} numberOfPages={numberOfPages} paginatorCallback={paginatorCallback}/>
        )}
      </div>

      {loading && (
        <Spinner 
          visible = {loading}
          color = "#ff0000"
        />
      )}
    </div>
  );
}

export default DebridPage;
