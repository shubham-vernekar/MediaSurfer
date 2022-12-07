import BannerSlide from "../video/BannerSlide";
import VideoAdvertSlide from "../video/VideoAdvertSlide";
import VideoAdvertBox from "../video/VideoAdvertBox";
import { React, useEffect, useState } from "react";
import "../../../static/css/pages/SeriesPage.css";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

function SeriesPage() {
  let [searchParams, setSearchParams] = useSearchParams();
  const seriesPerPage = 5;

  let page_no = searchParams.get("page") || 1;
  if (page_no < 1) {
    page_no = 1;
  }

  const [sortQuery, SetSortQuery] = useState(searchParams.get("sort_by") || "-updated");
  const [searchQuery, SetSearchQuery] = useState(searchParams.get("query") || "");
  const [castQuery, SetCastQuery] = useState(searchParams.get("cast") || "");
  const [seriesPageLimit, SetSeriesPageLimit] = useState(searchParams.get("offset") || seriesPerPage);
  const [allStars, SetAllStars] = useState([]);
  const [seriesPageNumber, SetSeriesPageNumber] = useState(page_no);
  const [seriesCount, SetSeriesCount] = useState(0);
  const [numberOfPages, SetNumberOfPages] = useState(0);

  return (
    <div className="series-page-container">
      <div className="series-page-filters-container">

      </div>
    </div>
  );
}

export default SeriesPage;
