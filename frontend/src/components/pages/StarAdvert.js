import StarCard from "../star/StarCard";

function StarAdvert() {
  let starData = [
    {
      name: "Tom cruise",
      videos: 35,
      views: 119,
      favorite: true,
      superstar: true,
      poster:
        "http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcRfFvKKvmGPnvJSQgTRy8MJI7ev8jnCH9CnzqNHfgqE1ml1LhlFIGBx4jY8HUAmf-yk_HZnA8IyQWc2gvI",
    },
    {
      name: "Hugh Jackman",
      videos: 4,
      views: 72,
      favorite: false,
      superstar: false,
      poster:
        "https://cdn.britannica.com/47/201647-050-C547C128/Hugh-Jackman-2013.jpg",
    },
    {
      name: "Scarlett Johansson",
      videos: 135,
      views: 65,
      favorite: true,
      superstar: false,
      poster:
        "https://img.20mn.fr/fdIDsrEsTvivbyy8Lj8Bgik/1200x768_los-angeles-premiere-of-illumination-s-sing-2-featuring-scarlett-johansson-where-los-angeles-california-united-states-when-12-dec-2021-credit-robin-lori-insta-rimages-cover-images",
    },
    {
      name: "Robert Downey Jr.",
      videos: 8,
      views: 6,
      favorite: false,
      superstar: false,
      poster: "https://media1.popsugar-assets.com/files/thumbor/HwtAUAufmAZv-FgGEIMJS2eQM-A/0x1:2771x2772/fit-in/2048xorig/filters:format_auto-!!-:strip_icc-!!-/2020/03/30/878/n/1922398/eb11f12e5e825104ca01c1.02079643_/i/Robert-Downey-Jr.jpg",
    },
    {
      name: "Charlize Theron",
      videos: 899,
      views: 456,
      favorite: false,
      superstar: false,
      poster:
        "https://image.brigitte.de/10945160/t/sE/v5/w1440/r1.5/-/charlize-theron-bild.jpg",
    },
  ];

  const myStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    gap: "25px",
    paddingTop: "25px"
  };

  return (
    <div style={myStyle}>
      {starData.map((data, i) => (
        <StarCard
          key={i}
          poster={data["poster"]}
          name={data["name"]}
          videos={data["videos"]}
          views={data["views"]}
          favorite={data["favorite"]}
          superstar={data["superstar"]}
        />
      ))}
    </div>
  );
}

export default StarAdvert;
