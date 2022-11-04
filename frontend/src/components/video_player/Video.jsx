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
      className="video-player"
    >
      <track kind="captions" srcLang="en" src={props.subtitle}></track>
    </video>
  );
}

export default Video;
