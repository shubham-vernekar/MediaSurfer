import { React, useRef, useEffect, useState } from "react";
import "../../../static/css/paginator/Paginator.css";
import { useSearchParams } from "react-router-dom";

const Paginator = ({ pagesData }) => {
  const laneLength = 3;
  const [currentPage, SetCurrentPage] = useState(0);
  const [firstPage, SetFirstPage] = useState(0);
  const [lastPage, SetLastPage] = useState(0);
  const [leftLane, SetLeftLane] = useState([]);
  const [rightLane, SetRightLane] = useState([]);
  const [showLeftSkip, SetShowLeftSkip] = useState(false);
  const [showRightSkip, SetShowRightSkip] = useState(false);
  const [totalPages, SetTotalPages] = useState(0);

  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let left = [];

    for (let i = currentPage - laneLength; i < currentPage; i++) {
      if (i > 0) {
        left.push(i);
      }
    }

    if (left && left[0] > firstPage + 1) {
      SetShowLeftSkip(true);
    }

    SetLeftLane(left);

    let right = [];
    for (let i = currentPage + 1; i < currentPage + laneLength + 1; i++) {
      if (i < totalPages - 1) {
        right.push(i);
      }
    }

    SetRightLane(right);

    if (right && right[right.length - 1] < lastPage - 1) {
      SetShowRightSkip(true);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    SetTotalPages(pagesData.length);
    SetFirstPage(0);
    if (pagesData.length > 1) {
      SetLastPage(pagesData.length - 1);
    }
    let currPage = searchParams.get("page")-1 || 0
    if (currPage<0){
        currPage = 0
    }
    SetCurrentPage(currPage);
  }, [pagesData]);

//   useEffect(() => {
//       console.log("currentPage", currentPage);
//   }, [currentPage]);

//   useEffect(() => {
//       console.log("leftLane", leftLane, "rightLane", rightLane);
//   }, [leftLane, rightLane]);

  // useEffect(() => {
  //     console.log("showLeftSkip", showLeftSkip, "showRightSkip", showRightSkip);
  // }, [showLeftSkip, showRightSkip]);

  // useEffect(() => {
  //     console.log("firstPage", firstPage, "lastPage", lastPage);
  // }, [firstPage, lastPage]);

  const paginatorItemOnClick = (e) => {
    window.location.href = e.currentTarget.getAttribute("url")
  };

  return (
    <div className="paginator-container">
      {currentPage > 0 && (
        <div className="paginator-item paginator-prev-button" url={pagesData[currentPage-1] && pagesData[currentPage-1].url} onClick={paginatorItemOnClick}> {"<"} </div>
      )}
      {currentPage > 0 && (<div className="paginator-item first-page" url={pagesData[firstPage] && pagesData[firstPage].url} onClick={paginatorItemOnClick}>
        {pagesData[firstPage] && pagesData[firstPage].page}
      </div>)}
      {showLeftSkip && (
        <div className="left-skip">
          <span> .. </span>
        </div>
      )}
      {leftLane.map((data, i) => (
        <div
          key={i}
          className="paginator-item"
          url={pagesData[data] && pagesData[data].url}
          onClick={paginatorItemOnClick}
        >
          {pagesData[data] && pagesData[data].page}
        </div>
      ))}
      <div className="paginator-item current-page" url={pagesData[currentPage] && pagesData[currentPage].url}  onClick={paginatorItemOnClick}>
        {pagesData[currentPage] && pagesData[currentPage].page}
        
      </div>
      {rightLane.map((data, i) => (
        <div key={i} className="paginator-item" url={pagesData[data] && pagesData[data].url}  onClick={paginatorItemOnClick}>
          {pagesData[data] && pagesData[data].page}
          
        </div>
      ))}
      {showRightSkip && (
        <div className="right-skip">
          <span>..</span>
        </div>
      )}
      {currentPage < totalPages-1 && (<div className="paginator-item last-page" url={pagesData[lastPage] && pagesData[lastPage].url} onClick={paginatorItemOnClick}>
        {pagesData[lastPage] && pagesData[lastPage].page}
      </div>)}
      {currentPage < totalPages-1 && (
        <div className="paginator-item paginator-next-button" url={pagesData[currentPage+1] && pagesData[currentPage+1].url} onClick={paginatorItemOnClick}> {">"} </div>
      )}
    </div>
  );
};

export default Paginator;
