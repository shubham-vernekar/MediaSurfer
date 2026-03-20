import { useSearchParams } from 'react-router-dom';
import { React, useEffect, useState, useRef } from "react";
import { getSize } from '../utils'
import "../../../static/css/pages/DebridManagerPage.css";
import Spinner from "../utils/Spinner";
import axios from "axios";
import DebridFileCard from "../debrid/DebridFileCard";
import Paginator from '../utils/Paginator';

function DebridManagerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [debridData, SetDebridData] = useState([]);
  const [loading, SetLoading] = useState(false);
  const [importing, SetImporting] = useState(false);
  const [managerMode, SetManagerMode] = useState(true);
  const [debridFilesData, SetDebridFilesData] = useState([]);
  const [dd_page_no, SetDD_page_no] = useState(1);
  const [df_page_no, SetDF_page_no] = useState(1);
  const [df_numberOfPages, SetDF_NumberOfPages] = useState(0);
  const [df_videoCount, SetDF_VideoCount] = useState(0);
  const [selectedDebridIds, setSelectedDebridIds] = useState(new Set());
  const [clearSelectionTick, setClearSelectionTick] = useState(0);
  const [editedTitles, setEditedTitles] = useState({});
  const [searchQuery, SetSearchQuery] = useState(searchParams.get("query") || "");
  const dd_videosPageLimit = 50
  const df_videosPageLimit = 20


  const handleAdd = (data) => {
    SetLoading(true)
    axios({
        method: "post",
        url: "/api/debrid-files",
        data: {
          debrid_id: data["id"],
          hash: data["hash"],
          title: getTitle(data),
          size: data["bytes"],
          status: data["debrid_status"],
          files: data["files"],
          is_imported: (data["files"] == data["videos"] && data["files"]!=0)
        },
      }).then((response) => {
        RefreshDebridData()
    });
  };

  const handleDelete = (ids, clear_videos) => {
    SetLoading(true)
    axios({
        method: "post",
        url: "/api/debrid-files/delete",
        data: {
          debrid_id: ids,
          clear_videos: clear_videos
        },
      }).then((response) => {
        // console.log(response);
        RefreshDebridFilesData()
        RefreshDebridData()
        handleClearAll()
    });
  };

  const handleImport = (ids, import_all) => {
    SetLoading(true)
    axios({
        method: "post",
        url: "/api/debrid-files/import",
        data: {
          debrid_id: ids,
          import_all: import_all
        },
      }).then((response) => {
        // console.log(response);
        RefreshDebridData()
        handleClearAll()
        RefreshDebridFilesData()
    });
  };

  const RefreshDebridData = () => {
    axios({
        method: "get",
        url: "/api/real-debrid/list",
        params: {
          limit: dd_videosPageLimit,
          page_no: dd_page_no,
        },
      }).then((response) => {
        // console.log(response);
        SetDebridData(response.data);
        SetLoading(false)
    });
  };

  const RefreshDebridFilesData = () => {
    axios({
        method: "get",
        url: "/api/debrid-files",
        params: {
          limit: df_videosPageLimit,
          offset: (df_page_no - 1) * df_videosPageLimit,
          query: searchQuery
        },
      }).then((response) => {
        // console.log(response);
        SetDebridFilesData(response.data.results);
        SetDF_VideoCount(response.data.count);
    });
  };

  const paginatorCallback = (val) => {
    SetDF_page_no(val)
  };


  useEffect(() => {
    if (!managerMode){
        SetLoading(true)
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        RefreshDebridData()
    }
  }, [dd_page_no, managerMode]);

  useEffect(() => {
    if (managerMode){
        RefreshDebridFilesData();
        SetDF_page_no(1)
    }
  }, [searchQuery]);

  useEffect(() => {
    if (managerMode){
        RefreshDebridFilesData();
    }
  }, [df_page_no, managerMode]);

  
  useEffect(() => {
      SetDF_NumberOfPages(Math.ceil(df_videoCount/df_videosPageLimit))
  }, [df_videoCount]);

  const handleDeleteDebridFile = (debrid_id) => {
        SetDebridFilesData(prev => prev.filter(file => file.debrid_id !== debrid_id));
    };

 const onImportComplete = (debrid_id) => {
        RefreshDebridFilesData()
    };

  const handleClearAll = () => {
    setSelectedDebridIds(new Set());
    setClearSelectionTick(t => t + 1);
  };

  const handleSelect = (debrid_id, isChecked) => {
    setSelectedDebridIds(prev => {
      const next = new Set(prev);
      if (isChecked) {
        next.add(debrid_id);
      } else {
        next.delete(debrid_id);
      }
      return next;
    });
  };

  const getTitle = (data) => editedTitles[data["id"]] ?? data["filename"];


  return (
    <div className='dark-page'>
        {!managerMode && (<div className='debrid-list-page-container'>
        <div className='real-debrid-title' onClick={() => SetManagerMode(true)}>
            Real Debrid Library
        </div>
        <div className='real-debrid-container-box'> 
            {debridData && (<div className={`real-debrid-container`}>
                {debridData.map((data, i) => (
                    <div className={`real-debrid-box status-${data["status"]}`} key={data["id"]}>
                        <div
                            className="real-debrid-filename"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setEditedTitles(prev => ({
                                ...prev,
                                [data["id"]]: e.target.innerText.trim()
                            }))}
                            >
                            {data["filename"]}
                        </div>

                        <div className='real-debrid-details'>  
                            {data["debrid_status"] && (<div className='real-debrid-info real-debrid-status'> 
                                {data["debrid_status"].toUpperCase()}
                            </div> )}

                            <div className='real-debrid-info'> 
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.5 0H5.914a1.5 1.5 0 0 0-1.06.44L2.439 2.853A1.5 1.5 0 0 0 2 3.914V14.5A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 12.5 0Zm-7 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Zm2.75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 1.5 0Zm1.25-.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
                                </svg>
                                {getSize(data["bytes"])}
                            </div> 
                            
                            <div className='real-debrid-info'> 
                                <svg fill="currentColor" width="20" height="20" viewBox="0 -5 46 46">
                                    <path id="_23.Videos" data-name="23.Videos" d="M43,42H5a4,4,0,0,1-4-4V10A4,4,0,0,1,5,6H43a4,4,0,0,1,4,4V38A4,4,0,0,1,43,42ZM12,8H5a2,2,0,0,0-2,2v2h9ZM23,8H14v4h9ZM34,8H25v4h9Zm11,2a2,2,0,0,0-2-2H36v4h9Zm0,4H3V34H45Zm0,22H36v4H34V36H25v4H23V36H14v4H12V36H3v2a2,2,0,0,0,2,2H43a2,2,0,0,0,2-2ZM21.621,29.765A.987.987,0,0,1,21,30a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1,.978.978,0,0,1,.563.2l7.771,4.872a.974.974,0,0,1,.261,1.715Z" transform="translate(-1 -6)" fillRule="evenodd"/>
                                </svg>
                                {data["files"]}
                            </div> 
                            <div className='real-debrid-info'> 
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {data["videos"]}
                            </div> 
                            {/* <div className='real-debrid-status'>{data["status"]}</div> */}
                            {/* <div className='real-debrid-info-btn-box'> */}
                            {data["status"] == "" && data["debrid_status"] != "Downloading" && (<div className='real-debrid-info-btn' onClick={() => handleAdd(data)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM17.53 7.53L9.81 15.25H12.83C13.24 15.25 13.58 15.59 13.58 16C13.58 16.41 13.24 16.75 12.83 16.75H8C7.59 16.75 7.25 16.41 7.25 16V11.17C7.25 10.76 7.59 10.42 8 10.42C8.41 10.42 8.75 10.76 8.75 11.17V14.19L16.47 6.47C16.62 6.32 16.81 6.25 17 6.25C17.19 6.25 17.38 6.32 17.53 6.47C17.82 6.76 17.82 7.24 17.53 7.53Z" fill="currentColor"/>
                                </svg>
                                <div className='real-debrid-info-btn-text'>Add</div> 
                            </div> )}
                            {data["status"] != "" && (<div className='real-debrid-info-btn' onClick={() => handleDelete(data["id"], false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div className='real-debrid-info-btn-text'>Delete</div> 
                            </div> )}

                            {/* </div>  */}
                        </div> 
                    </div>    
                ))}
            </div>)}

            {!loading && (<div className="pagination-container">
                {dd_page_no>1 && (<button className="pagination-btn" onClick={() => SetDD_page_no(Math.max(Number(dd_page_no) - 1, 1))} >
                    Prev
                </button>)}
                {dd_page_no>1 && (<span className="pagination-pagenum">{dd_page_no}</span>)}
                <button className="pagination-btn" onClick={() => SetDD_page_no(Number(dd_page_no) + 1)} >
                    Next
                </button>
                </div>)}
            </div>
        </div>)}

        {managerMode && (<div className='debrid-list-page-container'>
            <div className='real-debrid-title' onClick={() => SetManagerMode(false)}>
                Debrid Manager
            </div>



            <div className="debrid-files-input-container ">
                <div className="debrid-input-box">
                    <div>
                        <div className="debrid-add-page" onClick={() => window.open("/debrid/add", '_blank').focus()}>
                        Add Video
                        </div>
                    </div>
                    <input
                        type="url"
                        value={searchQuery}
                        onChange={(e) => SetSearchQuery(e.target.value)}
                        placeholder="Search Debrid Videos..."
                        className="debrid-url-input debrid-files-search-input"
                    />
                </div>
            
                <div className='debrid-list-import-container'>
                    <div onClick={() => handleImport("", true)}>
                        Import All
                    </div>

                    {selectedDebridIds.size > 0 && (<div onClick={() => handleImport(Array.from(selectedDebridIds).join(","), false)}>
                        Import ({selectedDebridIds.size})
                    </div>)}

                    {selectedDebridIds.size > 0 && (<div onClick={() => handleDelete(Array.from(selectedDebridIds).join(","), true)}>
                        Delete ({selectedDebridIds.size})
                    </div>)}
                    
                    {selectedDebridIds.size > 0 && (
                        <div onClick={handleClearAll}>
                            Clear All 
                        </div>
                    )}
                </div>
            </div>

            <div className="debrid-adverts-container">
                {debridFilesData.map((data, i) => (
                    <DebridFileCard
                        key={data["id"]}
                        id={data["id"]}
                        debrid_id={data["debrid_id"]}
                        title={data["title"]}
                        hash={data["hash"]}
                        status={data["status"]}
                        is_imported={data["is_imported"]}
                        size={data["size"]}
                        files={data["files"]}
                        importing={data["importing"]}
                        videos={data["videos"]}
                        posters={data["posters"]}
                        task_id={data["task_id"]}
                        onDelete={handleDeleteDebridFile}
                        onImportComplete= {onImportComplete}
                        onSelect={handleSelect}
                        clearSelectionTick={clearSelectionTick}
                    />
                ))}
            </div>

            <div className="search-page-pagination-container">
                {df_page_no && (
                    <Paginator pageNo={df_page_no} numberOfPages={df_numberOfPages} paginatorCallback={paginatorCallback}/>
                )}
            </div>
        </div>)}

        {(importing || loading) && (
            <Spinner 
                visible = {(importing || loading)}
                color = "#ff0000"
            />
        )}
    </div>
  );
}

export default DebridManagerPage;