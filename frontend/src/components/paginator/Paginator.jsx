import { React, useRef, useEffect, useState } from "react";
import "../../../static/css/paginator/Paginator.css";

const Paginator = ({  pageNo, numberOfPages, paginatorCallback }) => {
  const laneLength = 3;
  const [currentPage, SetCurrentPage] = useState(0);
  const [firstPage, SetFirstPage] = useState(0);
  const [lastPage, SetLastPage] = useState(0);
  const [leftLane, SetLeftLane] = useState([]);
  const [rightLane, SetRightLane] = useState([]);
  const [showLeftSkip, SetShowLeftSkip] = useState(false);
  const [showRightSkip, SetShowRightSkip] = useState(false);
  const [totalPages, SetTotalPages] = useState(0);

  useEffect(() => {
    let left = [];

    for (let i = currentPage - laneLength; i < currentPage ; i++) {
      if (i > 1) {
        left.push(i);
      }
    }

    if (left && left[0] > firstPage + 1) {
      SetShowLeftSkip(true);
    }else{
      SetShowLeftSkip(false);
    }

    SetLeftLane(left);

    let right = [];
    for (let i = currentPage + 1; i < currentPage + laneLength + 1; i++) {
      
      if (i < totalPages) {
        right.push(i);
      }
    }

    SetRightLane(right);

    if (right && right[right.length - 1] < totalPages - 1 && right.length>=laneLength) {
      SetShowRightSkip(true);
    }else{
      SetShowRightSkip(false)
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    SetTotalPages(numberOfPages);
    SetFirstPage(1);
    if (numberOfPages > 0) {
      SetLastPage(numberOfPages);
    }
    if (pageNo<0){
      SetCurrentPage(1);
    } else{
      SetCurrentPage(pageNo);
    }
  }, [numberOfPages]);

  const paginatorClickHandler = (e) => {
    let pageNumber = parseInt(e.currentTarget.getAttribute("page")) 
    SetCurrentPage(pageNumber)
    paginatorCallback(pageNumber)
  };

  return (
    <div className="paginator-container">
      {currentPage > 1 && (
        <div className="paginator-item paginator-prev-button" page={currentPage-1} onClick={paginatorClickHandler}> Prev </div>
      )}
      {currentPage > 1 && (<div className="paginator-item first-page" page={firstPage} onClick={paginatorClickHandler}>
        {firstPage}
      </div>)}
      {showLeftSkip && (
        <div className="left-skip">
          <span> .. </span>
        </div>
      )}
      {leftLane.map((data, i) => (
        <div
          key={i}
          className="paginator-item left-lane"
          page={data}
          onClick={paginatorClickHandler}
        >
          {data}
        </div>
      ))}
      {totalPages>1 && (<div className="paginator-item current-page" page={currentPage}  onClick={paginatorClickHandler}>
        {currentPage}
      </div>)}
      {rightLane.map((data, i) => (
        <div key={i} className="paginator-item right-lane" page={data}  onClick={paginatorClickHandler}>
          {data}
        </div>
      ))}
      {showRightSkip && (
        <div className="right-skip">
          <span>..</span>
        </div>
      )}
      {currentPage < totalPages && (<div className="paginator-item last-page" page={lastPage} onClick={paginatorClickHandler}>
        {lastPage}
      </div>)}
      {currentPage < totalPages-1 && (
        <div className="paginator-item paginator-next-button" page={currentPage+1} onClick={paginatorClickHandler}> Next </div>
      )}
    </div>
  );
};

export default Paginator;
