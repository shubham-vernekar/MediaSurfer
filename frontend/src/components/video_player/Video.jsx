import "../../../static/css/video_player/Video.css";

function Video(props) {
  return (
    <video ref={props.videoRef}
      src={props.url}
      sub={props.subtitle}
      sprite={props.sprite}
      sprite_pos_file={props.sprite_pos_file}
      poster={props.poster}
      onPlay={props.playVideoState}
      onPause={props.pauseVideoState}
      onTimeUpdate={props.timeupdate}
      onLoadedData={props.loadeddata}
      onVolumeChange={props.volumechange}
      onClick={props.clickVideo}
      onMouseDown={props.videoMouseDown}
      onMouseUp={props.videoMouseUp}
      onContextMenu={props.handleRightClick}
      className="video-player"
    >
      <track kind="captions" srcLang="en" src={props.subtitle}></track>
    </video>
  );
}

export default Video;
