import { React, useEffect, useState } from "react";
import ScrpCard from "../Scrper/ScrpCard";
import axios from "axios";
import "../../../static/css/pages/ScrpPage.css";
import { useSearchParams } from "react-router-dom";

function ScrpPage() {
  const [scrpDirData, SetScrpDirData] = useState([]);
  const [scrpImgData, SetScrpImgData] = useState([]);
  const [reverse, SetReverse] = useState(true);
  let [searchParams, setSearchParams] = useSearchParams();
  let key = searchParams.get("key") || false;
  let index = searchParams.get("index") || 0;

  useEffect(() => {
    if(!key){
      axios({
        method: "get",
        url: "api/webscr"
      }).then((response) => {
          SetScrpDirData(response.data.dirs);
      });
    } else{
      document.addEventListener("keydown", (e) => {
        const tagName = document.activeElement.tagName.toLowerCase();
        if (tagName === "input") return;
  
        switch (e.key.toLowerCase()) {
          case "a":
          case "arrowleft":
            window.location.href = "/scrp?key="+ key + "&index=" + (parseInt(index)-1)
            break;
          case "d":
          case "arrowright":
            window.location.href = "/scrp?key="+ key + "&index=" + (parseInt(index)+1)
            break;
          default:
            break;
        }
      });

    }
  }, []);

  useEffect(() => {
    if(key){
      axios({
        method: "get",
        url: "api/webscr",
        params: {
          key: key,
          reverse: reverse,
          index: index
        },
      }).then((response) => {
        SetScrpImgData(response.data);
      });
    }
  }, [key, reverse, index]);

  const handleOnClickDone = (file_path) => {
    axios({
      method: "post",
      url: "api/webscr",
      data: {
        file_path: file_path
      },
    }).then((response) => {
      if(response.data.status=="success"){
        location.reload();
      }
    });
  };

  const handleOnClickOpenFolder = (file_path) => {
    axios({
      method: "post",
      url: "api/webscr",
      data: {
        file_path: file_path,
        open: "true"
      },
    });
  };

  return (
    <div className="scrp-page-container">
        {scrpDirData.length>0 && !key && 
          (<div className="scrp-cast-container">
              {scrpDirData.map((data, i) => (
                <div key={i}>
                    <ScrpCard title={data.title} pending={data.pending} done={data.done} img={data.img}/>
                </div>
              ))}
          </div>)
        }

        {scrpImgData && key && 
          (<div className="scrp-img-container">
              <div><span>{scrpImgData.count}</span></div>
              <div className="scrp-img">
                <img src={scrpImgData.url}></img>
              </div>
              <div className="scrp-title-main">{scrpImgData.title}</div>
              <div className="scrp-details-main">
                <div className="scrp-mov-id" onClick={() => handleOnClickOpenFolder(scrpImgData.file_path)}>{scrpImgData.movie_id}</div>
                {scrpImgData.release_date && (<div>{scrpImgData.release_date}</div>)}
                
                <a className="scrp-btn" onClick={() => handleOnClickDone(scrpImgData.file_path)}><span className="scrp-btn-span">Done</span></a>
                <div>
                  <a href={scrpImgData.trailer} className="scrp-links" target="_blank"> Trailer </a>
                </div>
                <div>
                  <a href={scrpImgData.sub} className="scrp-links" target="_blank"> Subtitle </a>
                </div>
                <div>
                  <a href={scrpImgData.video} className="scrp-links" target="_blank"> Video </a>
                </div>
              </div>

              <div className="scrp-left scrp-move-btn" onClick={() => window.location.href = "/scrp?key="+ key + "&index=" + (parseInt(index)-1)}></div>
              <div className="scrp-right scrp-move-btn" onClick={() => window.location.href = "/scrp?key="+ key + "&index=" + (parseInt(index)+1)}></div>
          </div>)
        }


    </div>
  );
}

export default ScrpPage;
