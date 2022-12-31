import VideoCard from "../video/VideoCard";

function VideoAdvert() {
  let videoData = [
    {
      title: "No Country for old men",
      categories: "drama,thriller",
      cast: "hugh jackman",
      views: 10,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      preview_poster:
        "https://www.fotoaparat.cz/storage/a/26/2639/tg17d5xl-rosta.jpg",
      progress: 2132,
      resolution: "HD",
      duration: "00:56:21",
      special_tag: "FAVOURITE",
      watch_time: 563,
      created: "2017-10-20T11:23:09Z",
    },
    {
      title: "Pacific Rim Starring Charlie Hunnam",
      categories: "action",
      cast: "hugh jackman",
      views: 6,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      preview_poster:
        "https://www.sulasula.com/wp-content/uploads/cr_em13_14.jpg",
      progress: 0,
      resolution: "4K UHD",
      duration: "00:50:35",
      special_tag: "",
      watch_time: 563,
      created: "2018-04-13T18:40:20Z",
    },
    {
      title: "The Man from Toronto",
      categories: "comedy",
      cast: "hugh jackman,hugh jackman",
      views: 33,
      favorite: true,
      preview: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
      preview_poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png",
      progress: 0,
      resolution: "2K QHD",
      duration: "00:32:48",
      watch_time: 563,
      special_tag: "RECOMMENDED",
      created: "2020-06-18T14:42:11Z",
    },
    {
      title: "Texas Chainsaw Massacre",
      categories: "Horror",
      cast: "hugh jackman",
      views: 19,
      favorite: false,
      preview: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      preview_poster: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg",
      progress: 3321,
      resolution: "4K UHD",
      duration: "03:08:46",
      special_tag: "FAVOURITE",
      watch_time: 563,
      created: "2021-09-08T10:37:23Z",
    },
    {
      title: "Fast & Furious Presents: Hobbs & Shaw and The Man from Toronto and Texas Chainsaw Massacre all together",
      categories: "Action,Comedy",
      cast: "hugh jackman",
      views: 76,
      favorite: true,
      preview: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
      preview_poster: "https://cdn.searchenginejournal.com/wp-content/uploads/2022/06/image-search-1600-x-840-px-62c6dc4ff1eee-sej-1520x800.png",
      progress: 2132,
      resolution: "720p",
      duration: "00:56:57",
      special_tag: "NEW",
      watch_time: 563,
      created: "2017-12-22T19:31:09Z",
    }
  ];

  videoData = videoData.concat(videoData)
  videoData = videoData.concat(videoData)
  videoData = videoData.concat(videoData)
  videoData = videoData.concat(videoData)
  videoData = videoData.concat(videoData)

  const myStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "25px",
    margin: "50px"
  };

  return (
    <div style={myStyle}>
      {videoData.map((data, i) => (
        <VideoCard
          key={i}
          vidid={data["id"]}
          title={data["title"]}
          categories={data["categories"]}
          cast={data["cast"]}
          views={data["views"]}
          favorite={data["favorite"]}
          preview={data["preview"]}
          previewThumbnail={data["preview_poster"]}
          progress={data["progress"]}
          duration={data["duration"]}
          created={data["created"]}
          badge={data["badge"]}
          specialTag={data["special_tag"]}
          watchTime={data["watch_time"]}
          subtitleBadge={data["subtitle_badge"]}
          size={data["size"]}
        />
      ))}
    </div>
  );
}

export default VideoAdvert;