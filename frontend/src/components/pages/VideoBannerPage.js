import VideoBanner from "../video/VideoBanner";

function VideoBannerPage() {
  let videoData = [
    {
      title: "Test video",
      categories: "test",
      cast: "hugh jackman",
      views: 10,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      preview_thumbnail:
        "https://www.fotoaparat.cz/storage/a/26/2639/tg17d5xl-rosta.jpg",
      progress: 2132,
      resolution: "HD",
      duration: "00:56:21",
      special_tag: "FAVOURITE",
      created: "2017-10-20T11:23:09Z",
    },
    {
      title: "Another test video",
      categories: "test",
      cast: "hugh jackman",
      views: 6,
      favorite: false,
      preview:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      preview_thumbnail:
        "https://www.sulasula.com/wp-content/uploads/cr_em13_14.jpg",
      progress: 0,
      resolution: "4K UHD",
      duration: "00:50:35",
      special_tag: "",
      created: "2018-04-13T18:40:20Z",
    },
  ];

  const myStyle = {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  };

  let data = videoData[1];

  return (
    <div style={myStyle}>
      <VideoBanner
        title={data["title"]}
        categories={data["categories"]}
        cast={data["cast"]}
        views={data["views"]}
        favorite={data["favorite"]}
        preview={data["preview"]}
        previewThumbnail={data["preview_thumbnail"]}
        progress={data["progress"]}
        duration={data["duration"]}
        created={data["created"]}
        resolution={data["resolution"]}
        specialTag={data["special_tag"]}
      />
    </div>
  );
}

export default VideoBannerPage;
