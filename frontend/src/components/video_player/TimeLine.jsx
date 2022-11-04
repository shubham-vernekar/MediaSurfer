import "../../../static/css/video_player/TimeLine.css";

function TimeLine(props) {
  const previewImageStyle = {
    backgroundImage: `url(${props.sprite})`,
    backgroundPosition: "-300px -0px",
    width: "150px",
    height: "84px",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="timeline-container" ref={props.timelineContainerRef}>
      <div className="timeline">
        <div className="preview-img" ref={props.previewImgRef} style={previewImageStyle}></div>
        <div className="thumb-indicator"></div>
      </div>
    </div>
  );
}

export default TimeLine;
