import '../../../static/css/scrper/ScrpCard.css';
import { React } from "react";

function ScrpCard(props) {

  return (
    <div className="scrp-card">
      <div className="scrp-poster">
        <a href={parseInt(props.pending)>0 ? "scrp?key=" + props.title : ''}><img className='scrp-poster-img' src={props.img} alt=""/></a>
        {parseInt(props.pending)==0 && (<img className="scrp-done-icn" src="/static/images/checked.png" alt=""></img>)}
      </div>
      
      <div className="scrp-details">
        <div className="scrp-title">
          <div><a href={"/search?query=" + props.title} target='_blank'>{props.title}</a></div>
        </div>
        <div className="scrp-cnt-details-box">
          <div className="scrp-cnt-details">
            <img src="/static/images/remove.png" alt=""></img>
            {props.pending} 
          </div>
          <div className="scrp-cnt-details">
            <img src="/static/images/check.png" alt=""></img>
            {props.done} 
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScrpCard;