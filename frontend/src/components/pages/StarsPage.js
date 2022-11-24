import StarCard from "../star/StarCard";
import { React, useRef, useEffect, useState } from "react";

import "../../../static/css/pages/StarsPage.css";

function StarAdvert() {
  let starData = [
    {
      name: "Tom cruise",
      videos: 35,
      views: 119,
      favorite: true,
      superstar: true,
      poster:
        "http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcRfFvKKvmGPnvJSQgTRy8MJI7ev8jnCH9CnzqNHfgqE1ml1LhlFIGBx4jY8HUAmf-yk_HZnA8IyQWc2gvI",
    },
    {
      name: "Henry Cavill",
      videos: 7,
      views: 88,
      favorite: false,
      superstar: false,
      poster:
        "https://media.vanityfair.com/photos/54caaa74b8f23e3a0314d4d6/master/w_2560%2Cc_limit/image.jpg",
    },
    {
      name: "Hugh Jackman",
      videos: 4,
      views: 72,
      favorite: false,
      superstar: false,
      poster:
        "https://cdn.britannica.com/47/201647-050-C547C128/Hugh-Jackman-2013.jpg",
    },
    {
      name: "Scarlett Johansson",
      videos: 135,
      views: 65,
      favorite: true,
      superstar: false,
      poster:
        "https://img.20mn.fr/fdIDsrEsTvivbyy8Lj8Bgik/1200x768_los-angeles-premiere-of-illumination-s-sing-2-featuring-scarlett-johansson-where-los-angeles-california-united-states-when-12-dec-2021-credit-robin-lori-insta-rimages-cover-images",
    },
    {
      name: "Robert Downey Jr.",
      videos: 8,
      views: 6,
      favorite: false,
      superstar: false,
      poster:
        "https://media1.popsugar-assets.com/files/thumbor/HwtAUAufmAZv-FgGEIMJS2eQM-A/0x1:2771x2772/fit-in/2048xorig/filters:format_auto-!!-:strip_icc-!!-/2020/03/30/878/n/1922398/eb11f12e5e825104ca01c1.02079643_/i/Robert-Downey-Jr.jpg",
    },
    {
      name: "Charlize Theron",
      videos: 899,
      views: 456,
      favorite: false,
      superstar: false,
      poster:
        "https://image.brigitte.de/10945160/t/sE/v5/w1440/r1.5/-/charlize-theron-bild.jpg",
    },
  ];

  starData = starData.concat(starData);
  starData = starData.concat(starData);
  starData = starData.concat(starData);

  const alphabetsLineOne = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  // -----------------------------------

  const [alphabetsLineTwo, SetAlphabetsLineTwo] = useState([]);
  const [alphabetsLineThree, SetAlphabetsLineThree] = useState([]);

  const [alphabetOne, SetAlphabetOne] = useState("");
  const [alphabetTwo, SetAlphabetTwo] = useState("");
  const [alphabetThree, SetAlphabetThree] = useState("");
  const [sortQuery, SetSortQuery] = useState("");
  const [filterQuery, SetFilterQuery] = useState("");

  // const starAdvertIndexOne = useRef(null);
  const starAdvertIndexTwo = useRef(null);
  const starAdvertIndexThree = useRef(null);

  useEffect(() => {
    console.log(
      alphabetOne,
      alphabetTwo,
      alphabetThree,
      sortQuery,
      filterQuery
    );
  }, [alphabetOne, alphabetTwo, alphabetThree, sortQuery, filterQuery]);

  useEffect(() => {
    [...starAdvertIndexTwo.current.children].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    [...starAdvertIndexThree.current.children].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    starAdvertIndexThree.current.style.display = "none";
    if (alphabetOne === "") {
      starAdvertIndexTwo.current.style.display = "none";
    } else {
      starAdvertIndexTwo.current.style.display = "flex";
    }
  }, [alphabetOne]);

  useEffect(() => {
    [...starAdvertIndexThree.current.children].forEach((sib) =>
      sib.classList.remove("selected-filter")
    );
    if (alphabetTwo === "") {
      starAdvertIndexThree.current.style.display = "none";
    } else {
      starAdvertIndexThree.current.style.display = "flex";
    }
  }, [alphabetTwo]);

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
      SetAlphabetsLineTwo(getValidAlphabets(starData, alphabetText));
    } else if (clickedAlphabet.parentElement.classList.contains("index-2")) {
      SetAlphabetTwo(alphabetText);
      SetAlphabetThree("");
      SetAlphabetsLineThree(
        getValidAlphabets(starData, alphabetOne + alphabetText)
      );
    } else if (clickedAlphabet.parentElement.classList.contains("index-3")) {
      SetAlphabetThree(alphabetText);
    }
  };

  const getValidAlphabets = (data, matchkey) => {
    let matches = new Set();
    Object.entries(data).forEach(([k, v]) => {
      let castName = v.name.toLowerCase();
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
      filterText = clickedFilter.innerText.trim();
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
      sortText = clickedSort.innerText.trim();
    }
    console.log(sortText);
  };

  return (
    <div className="star-advert-page-container">
      <div className="star-advert-index-container">
        <div className="star-advert-index index-1">
          {alphabetsLineOne.map((alphabet, i) => (
            <div className="alphabet" key={i} onClick={handleAlphabetOnClick}>
              {" "}
              {alphabet}{" "}
            </div>
          ))}
        </div>
        <div className="star-advert-index index-2" ref={starAdvertIndexTwo}>
          {alphabetsLineTwo.map((alphabet, i) => (
            <div className="alphabet" key={i} onClick={handleAlphabetOnClick}>
              {" "}
              {alphabet}{" "}
            </div>
          ))}
        </div>
        <div className="star-advert-index index-3" ref={starAdvertIndexThree}>
          {alphabetsLineThree.map((alphabet, i) => (
            <div className="alphabet" key={i} onClick={handleAlphabetOnClick}>
              {" "}
              {alphabet}{" "}
            </div>
          ))}
        </div>
      </div>
      <div className="star-advert-container">
        <div className="star-advert-box">
          {starData.map((data, i) => (
            <StarCard
              key={i}
              poster={data["poster"]}
              name={data["name"]}
              videos={data["videos"]}
              views={data["views"]}
              favorite={data["favorite"]}
              superstar={data["superstar"]}
            />
          ))}
        </div>
        <div className="star-advert-right-container">
          <input
            type="text"
            name="search-box"
            className="star-advert-search-box"
          />
          <div className="star-advert-filter-container">
            <div className="star-advert-filter-title">FILTER</div>
            <div className="star-advert-filter" onClick={handleFilterOnClick}>
              Only Favorites
            </div>
            <div className="star-advert-filter" onClick={handleFilterOnClick}>
              Only Superstars
            </div>
          </div>
          <div className="star-advert-sort-container">
            <div className="star-advert-sort-title">SORT BY</div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Length
            </div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Videos
            </div>
            <div className="star-advert-sort" onClick={handleSortOnClick}>
              Sort by Added
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StarAdvert;
