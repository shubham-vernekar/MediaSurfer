import { React, useState, useEffect } from "react";
import "../../../static/css/debrid/DebridFileCard.css";
import { secondsToHHMMSS, getSize, secondsToTimestamp } from '../utils'
import axios from "axios";
import { ClipLoader } from "react-spinners";

const DebridFileCard = (props) => {

    const [importing, setImporting] = useState(props.task_id ? "PENDING" : "");
    const [poster, setPoster] = useState(props.posters[0]);
    const [opacity, setOpacity] = useState(1);
    const [task_id, setTask_id] = useState(props.task_id);
    const [checked, setChecked] = useState(false);
    let currentIndex = 0

    const handleCheckbox = (e) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        if (props.onSelect) {
            props.onSelect(props.debrid_id, isChecked);
        }
    };

    useEffect(() => {
        if (props.clearSelectionTick > 0) {
            setChecked(false);
        }
    }, [props.clearSelectionTick]);


    const handleImport = (debrid_id) => {
        // setImporting(true)
        axios({
            method: "post",
            url: "/api/debrid-files/import",
            data: {
                debrid_id : debrid_id
            },
        }).then((response) => {
            console.log(response);
            setImporting("PENDING")
            setTask_id(response.data.task_id);
            // props.onImportComplete(debrid_id);

        });
  };

  const handleDelete = (debrid_id) => {
    axios({
        method: "post",
        url: "/api/debrid-files/delete",
        data: {
          debrid_id: debrid_id,
          clear_videos: true
        },
      }).then((response) => {
        props.onDelete(debrid_id);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
        if (props.posters.length > 0){
            setOpacity(0);
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % props.posters.length;
                setPoster(props.posters[currentIndex])
                setOpacity(1);
            }, 500);
        }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log(task_id);
        if (task_id){
            const poll = setInterval(async () => {
                const status = await axios.get(`/api/task-status/${task_id}/`);
                console.log(status.data);
                
                setImporting(status.data.status);
                
                if (status.data.status === 'SUCCESS' || status.data.status === 'FAILURE') {
                    clearInterval(poll);
                }
            }, 3000);
        }
    }, [task_id]);

  return (
    <div className={`debrid-file-card animate-background  ${props.is_imported ? "debrid-file-imported" : ""}`}>
        <input
                type="checkbox"
                className={`debrid-file-checkbox ${checked ? "debrid-file-checkbox--visible" : ""}`}
                checked={checked}
                onChange={handleCheckbox}
                onClick={(e) => e.stopPropagation()}
            />

        <div className="debrid-file-poster-container">
            {poster && (
                <a href={"/debrid?parent=" + props.hash} target="_blank">
                    <img className="debrid-file-poster-img"
                    src={poster} 
                    style={{ opacity: opacity }}
                    />
                </a>
            )}
            {!poster && (
                <div className="debrid-file-no-poster-container"> <div className="debrid-file-pending">IMPORT PENDING</div> </div>
            )}
        </div>
 
      <div className="debrid-file-details-container">
        <div className="debrid-details-heading">
            
            <div className='advert-views-box' style={{"cursor": "pointer"}} onClick={() => window.open("/admin/backend/debridfiles/"+ props.id +"/change/", '_blank').focus()} > 
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.5 0H5.914a1.5 1.5 0 0 0-1.06.44L2.439 2.853A1.5 1.5 0 0 0 2 3.914V14.5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0Zm-7 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2.75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Zm1.25-.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
                </svg>
                {getSize(props.size)} 
            </div>
            <div className='advert-views-box'> 
                <svg fill="currentColor" width="16" height="16" viewBox="0 -5 46 46">
                    <path id="_23.Videos" data-name="23.Videos" d="M43,42H5a4,4,0,0,1-4-4V10A4,4,0,0,1,5,6H43a4,4,0,0,1,4,4V38A4,4,0,0,1,43,42ZM12,8H5a2,2,0,0,0-2,2v2h9ZM23,8H14v4h9ZM34,8H25v4h9Zm11,2a2,2,0,0,0-2-2H36v4h9Zm0,4H3V34H45Zm0,22H36v4H34V36H25v4H23V36H14v4H12V36H3v2a2,2,0,0,0,2,2H43a2,2,0,0,0,2-2ZM21.621,29.765A.987.987,0,0,1,21,30a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1,.978.978,0,0,1,.563.2l7.771,4.872a.974.974,0,0,1,.261,1.715Z" transform="translate(-1 -6)" fillRule="evenodd"/>
                </svg>
                {props.files}
            </div> 
            {!props.is_imported && (<div className='advert-views-box'> 
                <span>{props.videos}</span>
            </div> )}
            <div className={"advert-views-box debrid-file-btn"}
                onClick={() => handleImport(props.debrid_id)}>
                 {importing === "PENDING" ? (
                    <ClipLoader size={15} color="currentColor" />
                    ) : (
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: importing === "FAILURE" ? "red" : "currentColor" }}
                    >
                        <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V12.1893L14.4697 10.4697C14.7626 10.1768 15.2374 10.1768 15.5303 10.4697C15.8232 10.7626 15.8232 11.2374 15.5303 11.5303L12.5303 14.5303C12.3897 14.671 12.1989 14.75 12 14.75C11.8011 14.75 11.6103 14.671 11.4697 14.5303L8.46967 11.5303C8.17678 11.2374 8.17678 10.7626 8.46967 10.4697C8.76256 10.1768 9.23744 10.1768 9.53033 10.4697L11.25 12.1893V7C11.25 6.58579 11.5858 6.25 12 6.25ZM8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z"
                        fill="currentColor"
                        />
                    </svg>
                    )}
            </div>
            <div className='advert-views-box debrid-file-btn' onClick={() => handleDelete(props.debrid_id)}> 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> 
            </div>
        </div>
        <div className="advert-details-title debrid-details-title">
          <span>{props.title}</span>
        </div>
      </div>
    </div>  
  );
};

export default DebridFileCard;