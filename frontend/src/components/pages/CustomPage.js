import { React, useEffect, useState } from "react";
import "../../../static/css/pages/CustomPage.css";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import VideoAdvertBox from "../video/VideoAdvertBox";

// Query format
// {
// 	"size": "widthxheight",
// 	"data": [{
// 			"name": "Section Name",
// 			"query": "Section Query"
// 		}
// 	]
// }

function CustomPage() {
  let [searchParams, setSearchParams] = useSearchParams();
  let query = searchParams.get("q");
  const [allData, SetAllData] = useState({});
  const [boxes, SetBoxes] = useState([]);
  const [x, Setx] = useState({});

  useEffect(() => {
    let query = JSON.parse(searchParams.get("q"));
    SetBoxes(query.data);
  }, []);

  useEffect(() => {
    boxes.forEach(function (item, index) {
      axios({
        method: "get",
        url: "/api/videos?" + item["query"],
      }).then((response) => {
        let data = allData;
        data[item["name"]] = response.data.results;
        SetAllData({ ...data });
      });
    });
  }, [boxes]);

  
  const HandleRefreshButton = (e) => {
    let index = parseInt(e.target.getAttribute("index"));
    axios({
      method: "get",
      url: "/api/videos?" + boxes[index]["query"],
    }).then((response) => {
      let data = allData;
      data[boxes[index]["name"]] = response.data.results;
      SetAllData({ ...data });
    });
  };

  return (
    <div>
      <div className="advert-data-container">
        {boxes.map((data, i) => (
          <div key={i}>
            {allData[data.name] && (
              <VideoAdvertBox
                videoData={allData[data.name]}
                title={data.name}
                width={data.width}
                onRefresh={HandleRefreshButton}
                index={i}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomPage;
