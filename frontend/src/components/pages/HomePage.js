import BannerSlide from "../video/BannerSlide";
import VideoAdvertSlide from "../video/VideoAdvertSlide";
import VideoAdvertBox from "../video/VideoAdvertBox";
import { React, useEffect, useState } from "react";
import "../../../static/css/pages/HomePage.css";
import axios from "axios";

function HomePage() {
  const [bannerVideos, SetBannerVideos] = useState([]);
  const [discoverPaneVideos, SetDiscoverPaneVideos] = useState([]);
  const [continuePaneVideos, SetContinuePaneVideos] = useState([]);
  const [recommendedPaneVideos, SetRecommendedPaneVideos] = useState([]);
  const [newVideos, SetNewVideos] = useState([]);
  const [favoriteVideos, SetFavoriteVideos] = useState([]);


  useEffect(() => {
    GetVideos("banner", 18)
    GetVideos("discover", 24)
    GetVideos("continue", 15)
    GetVideos("recommended", 15)
    GetVideos("new", 15)
    GetVideos("favourites", 15)
  }, []);


  const GetVideos = (type, count) => {
    axios({
      method: "get",
      url: "/api/videos/recommended",
      params: {
        limit: count,
        type: type,
      },
    }).then((response) => {
      switch (type) {
        case "banner":
          SetBannerVideos(response.data)
          break;
        case "discover":
          SetDiscoverPaneVideos(response.data)
          break;
        case "continue":
          SetContinuePaneVideos(response.data)
          break;
        case "recommended":
          SetRecommendedPaneVideos(response.data)
          break;
        case "new":
          SetNewVideos(response.data)
          break;
        case "favourites":
          SetFavoriteVideos(response.data)
          break;
        default:
          break;
      }
    });
  };

  return (
    <div>
      <div>
        <BannerSlide videoData={bannerVideos} />
      </div>
      <div>
        <VideoAdvertBox videoData={discoverPaneVideos} title="Discover" />
      </div>
      {continuePaneVideos.length>0 &&(<div>
        <VideoAdvertSlide
          videoData={continuePaneVideos}
          title="Continue Watching"
        />
      </div>)}
      {recommendedPaneVideos.length>0 &&(<div>
        <VideoAdvertSlide
          videoData={recommendedPaneVideos}
          title="Recommended"
        />
      </div>)}
      {newVideos.length>0 &&(<div>
        <VideoAdvertSlide videoData={newVideos} title="Newly Added" />
      </div>)}
      {favoriteVideos.length>0 &&(<div>
        <VideoAdvertSlide videoData={favoriteVideos} title="Favourites" />
      </div>)}
    </div>
  );
}

export default HomePage;
