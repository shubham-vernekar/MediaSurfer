import { React, useEffect, useState, useRef } from "react";

import Spinner from "../utils/Spinner";
import axios from "axios";
import "../../../static/css/pages/ScrpListPage.css";
import { useSearchParams } from "react-router-dom";
import ScrpCard from "../Scrper/ScrpCard";
import Paginator from "../utils/Paginator";

function ScrpListPage() {

  let [searchParams, setSearchParams] = useSearchParams();
  let query = searchParams.get("query") || false;
  const MAX_RECORDS = 10

  const [loading, SetLoading] = useState(false);
  const [summary, SetSummary] = useState("");
  const [isMoreData, SetIsMoreData] = useState(false);
  const [scrpData, SetScrpData] = useState([]);
  const [totalPages, SetTotalPages] = useState(0);
  const [page_no, SetPageNo] = useState(searchParams.get("page") || 1);


  useEffect(() => {
    SetLoading(true);
    axios({
      method: "get",
      url: "/api/webscr/list",
      params:{
        key: query,
        limit: MAX_RECORDS,
        page_no: page_no,
      }
    }).then((response) => {
      console.log(response.data);
      SetScrpData(response.data.results)
      SetIsMoreData(response.data.has_more)
      SetSummary(response.data.summary)
      SetTotalPages(Math.ceil(response.data.total_count / MAX_RECORDS))
      SetLoading(false);
    });
  }, [page_no]);


  const paginatorCallback = (x) => {
    SetPageNo(x)
  };


  return (
    <div className="dark-page">
      <div className="scrp-page-container">
        <div className="scrp-header-container" onClick={() => window.location.replace("/scrp")}>
          <div className="scrp-page-title">{query}</div>
          <div className="scrp-page-summary">{summary}</div>
        </div>
        
        {scrpData.length > 0 && (
          <div className="scrp-adverts-container">
            {scrpData.map((data, i) => (
              <ScrpCard
                key={i}
                title={data.title}
                trailer={data.trailer}
                url={data.url}
                movie_id={data.movie_id}
                release_date={data.release_date}
                file_path={data.file_path}
                sub={data.sub}
                video={data.video}
              />
            ))}
          </div>
        )}
      </div>

      <div className="search-page-pagination-container">
        {page_no && (
          <Paginator pageNo={page_no} numberOfPages={totalPages} paginatorCallback={paginatorCallback}/>
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

export default ScrpListPage;
