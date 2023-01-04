import StarCard from "../star/StarCard";
import { React, useRef, useEffect, useState } from "react";
import axios from "axios";
import "../../../static/css/pages/StarsPage.css";
import { clearChildren } from '../utils'

function StarAdvert() {

  const alphabetsLineOne = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", 
    "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  ];

  const [alphabetsLineTwo, SetAlphabetsLineTwo] = useState([]);
  const [alphabetsLineThree, SetAlphabetsLineThree] = useState([]);
  const [allStars, SetAllStars] = useState([]);
  const [allTags, SetAllTags] = useState([]);

  const [alphabetOne, SetAlphabetOne] = useState("");
  const [alphabetTwo, SetAlphabetTwo] = useState("");
  const [alphabetThree, SetAlphabetThree] = useState("");
  const [sortQuery, SetSortQuery] = useState("");
  const [filterQuery, SetFilterQuery] = useState("");
  const [searchQuery, SetSearchQuery] = useState("");
  const [tagQuery, SetTagQuery] = useState("");

  const [starData, SetStarData] = useState([]);

  const starAdvertIndexOne = useRef(null);
  const starAdvertIndexTwo = useRef(null);
  const starAdvertIndexThree = useRef(null);
  const starsSearch = useRef(null);
  const starsFilter = useRef(null);
  const starsSort = useRef(null);

  useEffect(() => {
    let completeQuery = searchQuery + filterQuery + alphabetOne + alphabetTwo + alphabetThree + tagQuery
    let alphabetOneValue = ""
    if (completeQuery.trim() == "") {
      alphabetOneValue = "A"
      starAdvertIndexOne.current.children[0].classList.add("selected-filter");
    }else{
      alphabetOneValue = alphabetOne
    }
    axios({
      method: "get",
      url: "/api/stars",
      params: {
        query: searchQuery,
        filter: filterQuery,
        sort_by: sortQuery,
        prefix: alphabetOneValue + alphabetTwo + alphabetThree,
        tag: tagQuery,
      },
    }).then((response) => {
      SetStarData(response.data);
    });
  }, [
    alphabetOne,
    alphabetTwo,
    alphabetThree,
    sortQuery,
    filterQuery,
    tagQuery
  ]);

  useEffect(() => {
    if(searchQuery){
      axios({
        method: "get",
        url: "/api/stars",
        params: {
          query: searchQuery
        },
      }).then((response) => {
        SetStarData(response.data);
      });
    }
  }, [searchQuery]);

  useEffect(() => {
    clearChildren(starAdvertIndexTwo.current);
    clearChildren(starAdvertIndexThree.current);
    starAdvertIndexThree.current.style.display = "none";
    if (alphabetOne === "") {
      starAdvertIndexTwo.current.style.display = "none";
    } else {
      starAdvertIndexTwo.current.style.display = "flex";
    }
  }, [alphabetOne]);

  useEffect(() => {
    clearChildren(starAdvertIndexThree.current);
    if (alphabetTwo === "") {
      starAdvertIndexThree.current.style.display = "none";
    } else {
      starAdvertIndexThree.current.style.display = "flex";
    }
  }, [alphabetTwo]);

  useEffect(() => {
    starAdvertIndexOne.current.children[0].classList.add("selected-filter");
    axios({
      method: "get",
      url: "/api/stars/names",
      params: {
        tags: "true"
      },
    }).then((response) => {
      SetAllStars(response.data.names);
      SetAllTags(response.data.tags);
    });

  }, []);

  const handleAlphabetOnClick = (e) => {
    let clickedAlphabet = e.currentTarget;
    let clickedSiblings = clickedAlphabet.parentElement.children;
    let sameButton = [...clickedAlphabet.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    let alphabetText = "";
    if (!sameButton) {
      clickedAlphabet.classList.add("selected-filter");
      alphabetText = clickedAlphabet.innerText.trim();
    }

    if (clickedAlphabet.parentElement.classList.contains("index-1")) {
      SetAlphabetTwo("");
      SetAlphabetThree("");
      SetAlphabetOne(alphabetText);
      SetAlphabetsLineTwo(getValidAlphabets(allStars, alphabetText));
    } else if (clickedAlphabet.parentElement.classList.contains("index-2")) {
      SetAlphabetTwo(alphabetText);
      SetAlphabetThree("");
      SetAlphabetsLineThree(getValidAlphabets(allStars, alphabetOne + alphabetText));
    } else if (clickedAlphabet.parentElement.classList.contains("index-3")) {
      SetAlphabetThree(alphabetText);
    }
  };

  const getValidAlphabets = (data, matchkey) => {
    let matches = new Set();
    Object.entries(data).forEach(([k, v]) => {
      let castName = v.toLowerCase();
      if (castName.startsWith(matchkey.toLowerCase())) {
        matches.add(castName.substring(matchkey.length, matchkey.length + 1));
      }
    });
    return [...matches].sort();
  };

  const handleFilterOnClick = (e) => {
    let clickedFilter = e.currentTarget;
    let clickedSiblings = clickedFilter.parentElement.children;
    let sameButton = [...clickedFilter.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    let filterText = "";
    if (!sameButton) {
      clickedFilter.classList.add("selected-filter");
      filterText = clickedFilter.innerText.replace("Only ", "").trim();
    }
    SetFilterQuery(filterText);
  };

  const getTopStars = (e) => {
    let clickedFilter = e.currentTarget;
    let clickedSiblings = clickedFilter.parentElement.children;
    let sameButton = [...clickedFilter.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    let filterText = "";
    if (!sameButton) {
      clickedFilter.classList.add("selected-filter");
      filterText = clickedFilter.innerText.replace("By ", "").trim();
    }
    if (filterText){
      axios({
        method: "get",
        url: "/api/stars",
        params: {
          sort_by: "-" + filterText.toLowerCase(),
          limit: 100
        },
      }).then((response) => {
        SetStarData(response.data);
      });
    }else{
      SetAlphabetOne("A")
    }
  };

  const handleSortOnClick = (e) => {
    let clickedSort = e.currentTarget;
    let clickedSiblings = clickedSort.parentElement.children;
    let sameButton = [...clickedSort.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    let sortText = "";
    if (!sameButton) {
      clickedSort.classList.add("selected-filter");
      sortText = "-" + clickedSort.innerText.replace("Sort By ", "").trim().toLowerCase();
    }
    SetSortQuery(sortText);
  };

  const handleSearchTextChange = (e) => {
    SetSearchQuery(e.currentTarget.value);
  };

  const handleTagOnClick = (e) => {
    let clickedFilter = e.currentTarget;
    let clickedSiblings = clickedFilter.parentElement.children;
    let sameButton = [...clickedFilter.classList].includes("selected-filter");
    [...clickedSiblings].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    let filterText = "";
    if (!sameButton) {
      clickedFilter.classList.add("selected-filter");
      filterText = clickedFilter.innerText.replace("Only ", "").trim();
    }

    SetTagQuery(filterText);
  };

  const clearAllFilters = (e) => {
    SetAlphabetOne("A");
    SetAlphabetTwo("");
    SetAlphabetThree("");
    SetSortQuery("");
    SetFilterQuery("");
    SetSearchQuery("");
    starsSearch.current.value = "";
    clearChildren(starAdvertIndexOne.current);
    clearChildren(starAdvertIndexTwo.current);
    clearChildren(starAdvertIndexThree.current);
    clearChildren(starsFilter.current);
    clearChildren(starsSort.current);
  };

  return (
    <div className="star-advert-page-container">
      <div className="star-advert-index-container">
        <div className="star-advert-index index-1" ref={starAdvertIndexOne}>
          {alphabetsLineOne.map((alphabet, i) => (
            <div className="alphabet" key={i} onClick={handleAlphabetOnClick}>
              {alphabet}
            </div>
          ))}
        </div>
        <div className="star-advert-index index-2" ref={starAdvertIndexTwo}>
          {alphabetsLineTwo.map((alphabet, i) => (
            <div className="alphabet" key={i} onClick={handleAlphabetOnClick}>
              {alphabet}
            </div>
          ))}
        </div>
        <div className="star-advert-index index-3" ref={starAdvertIndexThree}>
          {alphabetsLineThree.map((alphabet, i) => (
            <div className="alphabet" key={i} onClick={handleAlphabetOnClick}>
              {alphabet}
            </div>
          ))}
        </div>
      </div>
      <div className="star-advert-container">
        <div className="star-advert-box">
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
            />
          ))}
        </div>
        <div className="star-advert-right-container">
          <input
            type="text"
            name="search-box"
            className="star-advert-search-box"
            onChange={handleSearchTextChange}
            ref={starsSearch}
          />
          <div className="star-advert-clear-button" onClick={clearAllFilters}>
            <span>CLEAR</span>
          </div>
          <div>
            <div className="star-advert-filter-title">TOP 100</div>
            <div className="star-advert-global-search" onClick={getTopStars}>By Views</div>
            <div className="star-advert-global-search" onClick={getTopStars}>By Videos</div>
            <div className="star-advert-global-search" onClick={getTopStars}>By Watchtime</div>
          </div>
          <div className="star-advert-filter-container" ref={starsFilter}>
            <div className="star-advert-filter-title">FILTER</div>
            <div className="star-advert-filter" onClick={handleFilterOnClick}>
              Only Liked
            </div>
            <div className="star-advert-filter" onClick={handleFilterOnClick}>
              Only Favourites
            </div>
          </div>
          <div className="star-advert-sort-container" ref={starsSort}>
            <div className="star-advert-sort-title">SORT BY</div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Views
            </div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Videos
            </div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Added
            </div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Name
            </div>
          </div>

          <div className="star-advert-tag-container" ref={starsFilter}>
            <div className="star-advert-tag-title">TAGS</div>
            {allTags.map((data, i) => (
              <div key={i} className="star-advert-tag" onClick={handleTagOnClick}>
              {data}
            </div>

            ))}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default StarAdvert;
