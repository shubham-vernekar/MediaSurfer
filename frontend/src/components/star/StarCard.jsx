import '../../../static/css/star/StarCard.css';
import { React, useRef, useEffect } from "react";


// ebc2ac - rose gold
// ffd700 -  gold
// f8f9fa - white

function StarCard(props) {

  const starCardRef = useRef(null);
  let baseTheme = ["#f8f9fa", ""]
  let favTheme = ["#fbbf00", "/static/images/fire.png"]
  let superStarTheme = ["#fe475c", "/static/images/heart.png"]
  let showGlow = false

  let theme = baseTheme[0]
  let bannerImg = baseTheme[1]

  if (props.favorite) {
    theme = favTheme[0]
    bannerImg = favTheme[1]
    showGlow = true
  }
  if (props.superstar) {
    theme = superStarTheme[0]
    bannerImg = superStarTheme[1]
    showGlow = true
  }

  useEffect(() => {
    starCardRef.current.style.setProperty(
      "--star-card-theme",
      theme
    );
    if (showGlow){
      starCardRef.current.style.boxShadow = "0px 18px 60px -33px  var(--star-card-theme)"
    }
  }, [theme, showGlow]);

  return (
    <div className="star-card" ref={starCardRef}>
        <div className="star-banner" >
            <img src={bannerImg} alt="" width="45"/>
        </div>
        <div className="star-poster">
            <img src={props.poster} alt=""/>
        </div>
        <div className="star-details">
            <span className="star-title"> {props.name} </span>
            <div className="star-videos"> 
               <img src="/static/images/video-stream.png" alt="" width="30" height="30"/>
              <span> {props.videos} </span>
            </div>
            <div className="star-views"> 
               <img src="/static/images/view.png" alt="" width="25" height="25"/>
              <span> {props.views} </span>
            </div>
            <div className="star-play">
              <div className="star-play-button">PLAY</div>
            </div>
        </div>
        
    </div>
  );
}

export default StarCard;