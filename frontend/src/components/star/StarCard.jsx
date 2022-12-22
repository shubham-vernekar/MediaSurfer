import '../../../static/css/star/StarCard.css';
import { React, useRef, useEffect, useState } from "react";
import axios from "axios";

// ebc2ac - rose gold
// ffd700 -  gold
// f8f9fa - white

function StarCard(props) {

  const starCardRef = useRef(null);
  const [theme, SetTheme] = useState("#f8f9fa");
  const [bannerImg, SetBannerImg] = useState("");
  const [showGlow, SetShowGlow] = useState(false);
  const [favorite, SetFavorite] = useState(props.favorite);
  const [superStar, SetSuperStar] = useState(props.superstar);

  let favTheme = ["#fbbf00", "/static/images/fire.png"]
  let superStarTheme = ["#fe475c", "/static/images/heart.png"]

  useEffect(() => {
    if (favorite) {
      SetTheme(favTheme[0])
      SetBannerImg(favTheme[1])
      SetShowGlow(true)
    }
    if (superStar) {
      SetTheme(superStarTheme[0])
      SetBannerImg(superStarTheme[1])
      SetShowGlow(true)
    }
  }, []);

  useEffect(() => {
    starCardRef.current.style.setProperty(
      "--star-card-theme",
      theme
    );
    if (showGlow){
      starCardRef.current.style.boxShadow = "0px 18px 60px -33px  var(--star-card-theme)"
    }
  }, [theme, showGlow]);

  const handleOnClickCastRandomButton = (e) => {
    axios({
      method: "get",
      url: "/api/videos",
      params: {
        cast: e.target.getAttribute("cast") || "empty",
        sort_by: "?",
        limit: 1
      },
    }).then((response) => {
      if (response.data.results.length > 0){
        window.open("/player/"+response.data.results[0].id, '_blank');
      }
    });
  };

  return (
    <div className="star-card" ref={starCardRef}>
        <div className="star-banner" >
            <img src={bannerImg} alt="" width="45"/>
        </div>
        <div className="star-poster">
          <a href={"/search?cast=" + props.name}><img src={props.poster || "https://thumbs.dreamstime.com/b/no-user-profile-picture-hand-drawn-illustration-53840792.jpg"} alt=""/></a>
        </div>
        <div className="star-details">
            <span className="star-title"> {props.name} </span>
            <div className="star-videos"> 
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm6.258-6.437a.5.5 0 0 1 .507.013l4 2.5a.5.5 0 0 1 0 .848l-4 2.5A.5.5 0 0 1 6 12V7a.5.5 0 0 1 .258-.437z"/>
              </svg>
              <span> {props.videos} </span>
            </div>
            <div className="star-views"> 
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
              <span> {props.views} </span>
            </div>
            <div className="star-buttons-container">

              {!superStar && (
                <div className="star-superstar-button star-button">
                  <img src="https://www.svgrepo.com/show/190889/burn-fire.svg" alt="" /> 
                </div>
              )}

              {superStar && (
                <div className="star-superstar-button star-button">
                  <img src="https://www.svgrepo.com/show/288941/fire.svg" alt="" />
                </div>
              )}

              <div className="star-play">
                <div className="star-play-button" onClick={handleOnClickCastRandomButton} cast={props.name}>PLAY</div>
              </div>

              {!favorite && (
                <div className="star-favourite-button star-button">
                  <img src="/static/images/like-add.svg" alt="" /> 
                </div>
              )}

              {favorite && (
                <div className="star-favourite-button star-button">
                  <img src="/static/images/like-remove.svg" alt="" />
                </div>
              )}
              
            </div>
        </div>
        
    </div>
  );
}

export default StarCard;