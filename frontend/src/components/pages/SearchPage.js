import { React, useRef, useEffect, useState } from "react";
import VideoCard from "../video/VideoCard";
import axios from "axios";
import "../../../static/css/pages/SearchPage.css";

function SearchPage() {
  let videoData = [
    {
      title: "No Country for old men",
      categories: "drama,thriller",
      cast: "Javier Bardem",
      views: 10,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      preview_thumbnail:
        "https://www.fotoaparat.cz/storage/a/26/2639/tg17d5xl-rosta.jpg",
      progress: 2132,
      resolution: "HD",
      duration: "00:56:21",
      special_tag: "FAVOURITE",
      created: "2017-10-20T11:23:09Z",
    },
    {
      title: "Pacific Rim Starring Charlie Hunnam",
      categories: "action",
      cast: "Charlie Hunnam",
      views: 6,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      preview_thumbnail:
        "https://www.sulasula.com/wp-content/uploads/cr_em13_14.jpg",
      progress: 0,
      resolution: "4K UHD",
      duration: "00:50:35",
      special_tag: "",
      created: "2018-04-13T18:40:20Z",
    },
    {
      title: "The Man from Toronto",
      categories: "comedy",
      cast: "Kevin Hart,Woody Harrelson",
      views: 33,
      favorite: true,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
      preview_thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png",
      progress: 0,
      resolution: "2K QHD",
      duration: "00:32:48",
      special_tag: "RECOMMENDED",
      created: "2020-06-18T14:42:11Z",
    },
    {
      title: "Texas Chainsaw Massacre",
      categories: "Horror",
      cast: "hugh jackman",
      views: 19,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      preview_thumbnail:
        "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg",
      progress: 3321,
      resolution: "4K UHD",
      duration: "03:08:46",
      special_tag: "FAVOURITE",
      created: "2021-09-08T10:37:23Z",
    },
    {
      title:
        "Fast & Furious Presents: Hobbs & Shaw and The Man from Toronto and Texas Chainsaw Massacre all together",
      categories: "Action,Comedy",
      cast: "Jason Statham,Idris Elba",
      views: 76,
      favorite: true,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      preview_thumbnail:
        "https://cdn.searchenginejournal.com/wp-content/uploads/2022/06/image-search-1600-x-840-px-62c6dc4ff1eee-sej-1520x800.png",
      progress: 2132,
      resolution: "720p",
      duration: "00:56:57",
      special_tag: "NEW",
      created: "2017-12-22T19:31:09Z",
    },
  ];

  videoData = videoData.concat(videoData);
  videoData = videoData.concat(videoData);
  videoData = videoData.concat(videoData);
  videoData = videoData.concat(videoData);
  videoData = videoData.concat(videoData);

  //   --------------------------------------------

  const labelsContainerRef = useRef(null);

  const [allStars, SetAllStars] = useState([]);
  const [allCategories, SetAllCategories] = useState([]);
  const [sortQuery, SetSortQuery] = useState("latest");
  const [filterQuery, SetFilterQuery] = useState("");
  const [timeQuery, SetTimeQuery] = useState("");
  const [castQuery, SetCastQuery] = useState("");
  const [categoryQuery, SetCategoryQuery] = useState("");

  useEffect(() => {
    console.log(sortQuery, filterQuery, timeQuery,  castQuery, categoryQuery);
  }, [
    sortQuery, filterQuery, timeQuery, castQuery, categoryQuery,
  ]);

  useEffect(() => {
    let allStarsSet = new Set();
    let allCategoriesSet = new Set();
    Object.entries(videoData).forEach(([k, v]) => {
      v.cast
        .toLowerCase()
        .split(",")
        .forEach((item) => allStarsSet.add(item));
      v.categories
        .toLowerCase()
        .split(",")
        .forEach((item) => allCategoriesSet.add(item));
    });
    SetAllStars([...allStarsSet].sort());
    SetAllCategories([...allCategoriesSet].sort());
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
    return textData
  };

  const handleSortOnClick = (e) => {
    let clickedSort = e.currentTarget;
    let clickedText = clickedSort.innerText.toLowerCase().trim()
    let clickedSiblings = clickedSort.parentElement.children;
    let sameButton = [...clickedSort.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    if (!sameButton) {
      clickedSort.classList.add("selected-filter");
      SetSortQuery(clickedText)
    } else {
      if (sortQuery === clickedText && clickedText !="surprise"){
        clickedSort.classList.add("selected-filter");
        SetSortQuery("-"+clickedText)
      }else{
        SetSortQuery("")
      }
    }
  };

  const handleFilterOnClick = (e) => {
    SetFilterQuery(clearSiblingSelection(e))
  };

  const handleTimeTextChange = (e) => {
    SetTimeQuery(e.currentTarget.value);
  };

  const handleCastOnClick = (e) => {
    SetCastQuery(clearSiblingSelection(e));
  };

  const handleCategoryOnClick = (e) => {
    SetCategoryQuery(clearSiblingSelection(e))
  };

  const handleHamburgerOnClick = (e) => {
    if (labelsContainerRef.current.style.display === "") {
      labelsContainerRef.current.style.display = "flex";
    } else {
      labelsContainerRef.current.style.display = "";
    }
  };
  
  return (
    <div className="search-page-container">
      <div className="search-page-filters-container">
        <input
          type="text"
          name="length-box"
          className="search-page-length-box"
          onChange={handleTimeTextChange}
        />
        <div className="search-page-filter-box">
            <div className="search-page-sort selected-filter" onClick={handleSortOnClick}>
            <span>Latest</span>
            {sortQuery==="latest" && ( 
              <img src="static/images/down.png"  alt="" className="sort-direction" />
            )} 
            {sortQuery==="-latest" && ( 
              <img src="static/images/up.png"  alt="" className="sort-direction" />
            )} 
            </div>
            <div className="search-page-sort" onClick={handleSortOnClick}>
            <span>Longest</span>
            {sortQuery==="longest" && ( 
              <img src="static/images/down.png"  alt="" className="sort-direction" />
            )} 
            {sortQuery==="-longest" && ( 
              <img src="static/images/up.png"  alt="" className="sort-direction" />
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
              favorite={data["favorite"]}
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
          <div className="video-labels-cast-box">
            <div className="video-labels-title">CAST</div>
            {allStars.map((data, i) => (
              <div key={i} className="video-labels-cast" onClick={handleCastOnClick}>
                {data}
              </div>
            ))}
          </div>
          <div className="video-labels-category-box">
            <div className="video-labels-title">CATEGORIES</div>
            {allCategories.map((data, i) => (
              <div key={i} className="video-labels-category" onClick={handleCategoryOnClick}>
                {data}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
