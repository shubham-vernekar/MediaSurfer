import { React, useEffect, useState, useRef } from "react";
import "../../../static/css/utils/OptionsSearchBox.css";

const OptionsSearchBox = ({ options, callbackFunction, placeholder }) => {
  const searchBoxRef = useRef(null);
  const [currentOptions, SetCurrentOptions] = useState([]);
  
  useEffect(() => {
    SetCurrentOptions(options)
  }, [options]);

  const handleSearchTextChange = (e) => {
    let searchText = e.target.value.toLowerCase();
    let matches = []
    options.forEach((x, i) => {
        if (x.toLowerCase().includes(searchText)) {
            matches.push(x);
        } 
    });
    SetCurrentOptions(matches)
  };

  return (
    <div className="cast-suggestion-box suggestion-box">
      <div>
        <input
          type="search"
          placeholder={placeholder}
          className="cast-suggestion-search-box"
          onChange={handleSearchTextChange}
          ref={searchBoxRef}
        />
      </div>

      <div className="cast-suggestion-list suggestion-list">
        {currentOptions.map((data, i) => (
          <a key={i} className="suggestion-data-cast suggestion-data" onClick={() => callbackFunction({data})}>{data}</a>
        ))}
      </div>
    </div>
  );
};

export default OptionsSearchBox;
