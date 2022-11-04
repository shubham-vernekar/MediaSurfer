import TimeLine from "./TimeLine";
import VolumeSlider from "./VolumeSlider";
import "../../../static/css/video_player/VideoControls.css";

function VideoControls(props) {
  return (
    <div className="video-controls-container" ref={props.videoControlsRef}>
      <TimeLine
        sprite={props.sprite}
        previewImgRef={props.previewImgRef}
        timelineContainerRef={props.timelineContainerRef}
      ></TimeLine>
      <div className="controls">
        <button className="play-pause-btn" onClick={props.togglePlay}>
          {!props.pauseVideo && (
            <svg className="play-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
          )}
          {props.pauseVideo && (
            <svg className="pause-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          )}
        </button>

        <img
          src="static/images/rewind.png"
          alt="rewind"
          className="rewind-button"
          onClick={props.rewindFiveSeconds}
        ></img>

        <VolumeSlider
          toggleMute={props.toggleMute}
          volumeLevel={props.volumeLevel}
          volumeSliderRef={props.volumeSliderRef}
          volumeInput={props.volumeInput}
        ></VolumeSlider>

        <div className="duration-container">
          <div
            className="current-time"
            ref={props.currentTimeRef}
            onClick={props.toggleReverseDuration}
          >
            0:00
          </div>
          /<div className="total-time" ref={props.totalTimeRef}></div>
        </div>

        <button
          className="captions-btn"
          onClick={props.toggleCaptions}
          ref={props.captionsButtonRef}
        >
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z"
            />
          </svg>
        </button>

        <button
          className="speed-btn wide-btn"
          ref={props.speedButtonRef}
          onClick={props.changePlaybackSpeed}
        >
          1x
        </button>

        <button className="mini-player-btn" onClick={props.toggleMiniPlayer}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
            />
          </svg>
        </button>

        <button className="theater-btn" onClick={props.toggleTheaterMode}>
          {props.theaterMode && (
            <svg className="tall" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
              />
            </svg>
          )}
          {!props.theaterMode && (
            <svg className="wide" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
              />
            </svg>
          )}
        </button>

        <button
          className="full-screen-btn"
          onClick={props.toggleFullScreenMode}
        >
          {!props.fullScreenMode && (
            <svg className="open" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              />
            </svg>
          )}
          {props.fullScreenMode && (
            <svg className="close" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default VideoControls;
