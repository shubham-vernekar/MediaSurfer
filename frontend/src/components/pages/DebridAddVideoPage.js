import Spinner from "../utils/Spinner";
import { useSearchParams } from 'react-router-dom';
import { React, useEffect, useState, useRef } from "react";
import "../../../static/css/pages/DebridAddVideoPage.css";
import DebridAddURLBox from "../debrid/DebridAddURLBox"; 
import axios from "axios";
import { getCookie } from '../utils'

function DebridAddVideoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, SetLoading] = useState(false);
  const [value, setValue] = useState("");
  const debridURL = searchParams.get('url');

  useEffect(() => {
    if(debridURL){
      SetLoading(true)
      axios({
        method: "get",
        url: "/api/debrid/details",
        params: {
          debridURL: debridURL,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
      }).then((response) => {
        if (response.data.error){
          console.log(response.data.error);
        }else{
          SetLoading(false)
          window.location.replace("/debrid/player/" + response.data.id);
        }
      });
    }
  }, []);

  return (
    <div>
      <div>
        <div className="debrid-link-input-container">
          <div className="debrid-manager-title" onClick={() => window.open("/debrid/manager", '_blank').focus()}> 
            ADD DEBRID VIDEO
          </div>
          <DebridAddURLBox/>
        </div>
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

export default DebridAddVideoPage;
