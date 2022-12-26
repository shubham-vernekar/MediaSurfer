import { React, useState, useRef, useEffect } from "react";
import "../../../static/css/video_player/ResponsivePlayer.css";
import Video from "./Video";
import ClosedCaptions from "./ClosedCaptions";
import VideoControls from "./VideoControls";

function ResponsivePlayer(props) {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoControlsRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const currentTimeRef = useRef(null);
  const totalTimeRef = useRef(null);
  const previewImgRef = useRef(null);
  const thumbnailImgRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const captionsRef = useRef(null);
  const captionsButtonRef = useRef(null);
  const speedButtonRef = useRef(null);
  const centerPlayButtonRef = useRef(null);

  const [fullScreenMode, SetFullScreenMode] = useState(false);
  const [miniPlayer, SetMiniPlayer] = useState(false);
  const [volumeLevel, SetVolumeLevel] = useState("high");
  const [showCaptions, SetShowCaptions] = useState(true);
  const [pauseVideo, SetPauseVideo] = useState(false);
  const [lastTimeUpdate, SetLastTimeUpdate] = useState(false);
  const [watchTime, SetWatchTime] = useState(0);

  

  useEffect(() => {
    SetWatchTime(props.watchTime)
  }, [props.watchTime]);

  useEffect(() => {
    if (pauseVideo) {
      videoContainerRef.current.classList.remove("show-controls");
    } else {
      videoContainerRef.current.classList.add("show-controls");
    }
  }, [pauseVideo]);

  useEffect(() => {
    if (showCaptions) {
      captionsButtonRef.current.style.setProperty(
        "border-bottom",
        "3px solid #3ae23a"
      );
    } else {
      captionsButtonRef.current.style.removeProperty("border-bottom");
    }
  }, [showCaptions]);

  useEffect(() => {
    if (miniPlayer) {
      videoRef.current.requestPictureInPicture();
    } else {
      if (document.pictureInPictureElement != null) {
        document.exitPictureInPicture();
      }
    }
  }, [miniPlayer]);

  useEffect(() => {
    videoRef.current.addEventListener("enterpictureinpicture", (e) => {
      SetMiniPlayer(true);
    });

    videoRef.current.addEventListener("leavepictureinpicture", (e) => {
      SetMiniPlayer(false);
    });

    var pendingClick = 0;
    videoRef.current.addEventListener("click", (e) => {
      if (pendingClick) {
        clearTimeout(pendingClick);
        pendingClick = 0;
      }
      switch (e.detail) {
        case 1:
          pendingClick = setTimeout(function () {
            togglePlay();
          }, 200);
          break;
        case 2:
          toggleFullScreenMode();
          break;
        default:
          break;
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (isScrubbing) toggleScrubbing(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isScrubbing) handleTimelineUpdate(e);
    });

    let isScrubbing = false;
    let wasPaused;

    const toggleScrubbing = (e) => {
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
      isScrubbing = (e.buttons & 1) === 1;
      videoContainerRef.current.classList.toggle("scrubbing", isScrubbing);
      if (isScrubbing) {
        wasPaused = videoRef.current.paused;
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = percent * videoRef.current.duration;
        if (!wasPaused) videoRef.current.play();
      }

      handleTimelineUpdate(e);
    };

    const handleTimelineUpdate = (e) => {
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
      let previewImgNumber = Math.floor(percent * videoRef.current.duration);
      let sprite_pos = videoRef.current.sprite_data[previewImgNumber];
      if (sprite_pos) {
        sprite_pos = sprite_pos.split("=");
        if (sprite_pos[1]) {
          sprite_pos = sprite_pos[1].split(",").filter(Boolean);
          if (sprite_pos[1]) {
            previewImgRef.current.style.backgroundPosition =
              "-" + sprite_pos[0] + "px -" + sprite_pos[1] + "px";
          }
        }
      }
      timelineContainerRef.current.style.setProperty(
        "--preview-position",
        percent
      );
      if (isScrubbing) {
        e.preventDefault();
        const context = thumbnailImgRef.current.getContext("2d");
        const img = new Image();
        img.src = props.sprite;
        img.onload = () => {
          context.drawImage(
            img,
            sprite_pos[0],
            sprite_pos[1],
            150,
            84,
            0,
            0,
            300,
            150
          );
        };

        timelineContainerRef.current.style.setProperty(
          "--progress-position",
          percent
        );
      }
    };

    timelineContainerRef.current.addEventListener("mousedown", toggleScrubbing);
    timelineContainerRef.current.addEventListener(
      "mousemove",
      handleTimelineUpdate
    );

    document.addEventListener("fullscreenchange", (e) => {
      SetFullScreenMode(document.fullscreenElement != null);
    });

    document.addEventListener("keydown", (e) => {
      const tagName = document.activeElement.tagName.toLowerCase();

      if (tagName === "input") return;

      switch (e.key.toLowerCase()) {
        case " ":
          if (tagName === "button") return;
          togglePlay();
          break;
        case "k":
          togglePlay();
          break;
        case "f":
          toggleFullScreenMode();
          break;
        case "i":
          toggleMiniPlayer();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          skip(-5);
          break;
        case "arrowright":
        case "l":
          skip(5);
          break;
        case "c":
          toggleCaptions();
          break;
        case "arrowup":
          changeVolume(0.2);
          break;
        case "arrowdown":
          changeVolume(-0.2);
          break;
        default:
          break;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeUpdate = () => {
    let currentTime = videoRef.current.currentTime

    if (currentTime < lastTimeUpdate){
      SetLastTimeUpdate(currentTime) 
    }

    if ((currentTime - lastTimeUpdate)>1){
      SetWatchTime(watchTime + 1)
      SetLastTimeUpdate(currentTime) 
      props.updateProgressCallback(Math.round(currentTime), watchTime, videoRef.current.volume);
    }

    if (videoRef.current.reverseDuration) {
      currentTimeRef.current.textContent = formatDuration(
        videoRef.current.duration - videoRef.current.currentTime
      );
    } else {
      currentTimeRef.current.textContent = formatDuration(
        videoRef.current.currentTime
      );
    }

    const percent = videoRef.current.currentTime / videoRef.current.duration;
    timelineContainerRef.current.style.setProperty(
      "--progress-position",
      percent
    );

    let captionsText =
      videoRef.current.subtitle_data[Math.floor(videoRef.current.currentTime)];

    if (captionsRef.current) {
      if (captionsText) {
        captionsRef.current.textContent = captionsText;
      } else {
        captionsRef.current.textContent = "";
      }
    }
  };

  const loadedData = () => {
    videoRef.current.volume = props.initialVolume;
    volumeSliderRef.current.style.background = "linear-gradient(90deg, #3ae23a "+props.initialVolume*100+"%, #fff "+props.initialVolume*100+"%)"

    videoRef.current.reverseDuration = false;
    totalTimeRef.current.textContent = formatDuration(
      videoRef.current.duration
    );

    let subtitle_file = videoRef.current.getAttribute("sub");
    fetch(subtitle_file)
      .then((response) => response.text())
      .then((data) => {
        let subtitle_data = parse_subs(data);
        videoRef.current.subtitle_data = subtitle_data;
      });

    let sprite_file = videoRef.current.getAttribute("sprite_pos_file");
    fetch(sprite_file)
      .then((response) => response.text())
      .then((data) => {
        let sprite_data = parse_subs(data);
        videoRef.current.sprite_data = sprite_data;
      });
      if (props.progress>5){
        videoRef.current.currentTime = props.progress
      }
  };

  const volumeChange = () => {
    volumeSliderRef.current.value = videoRef.current.volume;
    if (videoRef.current.muted || videoRef.current.volume === 0) {
      volumeSliderRef.current.value = 0;
      SetVolumeLevel("muted");
    } else if (videoRef.current.volume >= 0.5) {
      SetVolumeLevel("high");
    } else {
      SetVolumeLevel("low");
    }
  };

  const skip = (duration) => {
    videoRef.current.currentTime += duration;
  };

  const changeVolume = (target) => {
    let newVolume = videoRef.current.volume + target;
    if (newVolume > 1) {
      newVolume = 1;
    } else if (newVolume < 0) {
      newVolume = 0;
    }
    videoRef.current.volume = newVolume;
  };

  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  const formatDuration = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`;
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullScreenMode = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const parse_subs = (sub_text) => {
    let subtitle_data = {};
    let lines = sub_text.split(/\r\n|\n/);
    let curr_text = "";
    let line_no = 1;
    let start_time = 0;
    let end_time = 0;

    for (var line = 0; line < lines.length - 1; line++) {
      let curr_row = lines[line].trim(); // eslint-disable-next-line
      let pattern = /[\d]{2}:[\d]{2}:[\d]{2}[\.,][\d]+/;
      if (curr_row.match(pattern)) {
        // Timing row
        let timings = curr_row.split(/-->/);
        for (let i = start_time; i <= end_time; i++) {
          if (curr_text) {
            subtitle_data[i] = curr_text;
          }
        }

        curr_text = "";
        start_time = convert_sec(timings[0]);
        end_time = convert_sec(timings[1]);
        line_no += 1;
      } else {
        //Non Timing Row
        if (line_no.toString() !== curr_row && curr_row) {
          curr_text += curr_row + "\n";
        }
      }
    }
    return subtitle_data;
  };

  const convert_sec = (time) => {
    time = time
      .replaceAll(/[\D]/gi, " ")
      .trim()
      .replaceAll(/\s+/gi, ":")
      .split(":");
    return +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
  };

  const changePlaybackSpeed = () => {
    let newPlaybackRate = videoRef.current.playbackRate + 0.25;
    if (newPlaybackRate > 2) newPlaybackRate = 0.25;
    videoRef.current.playbackRate = newPlaybackRate;
    speedButtonRef.current.textContent = `${newPlaybackRate}x`;
  };

  const toggleReverseDuration = () => {
    videoRef.current.reverseDuration = !videoRef.current.reverseDuration;
  };

  const toggleMiniPlayer = () => {
    SetMiniPlayer(!miniPlayer);
  };

  const rewindFiveSeconds = () => {
    skip(-5);
  };

  const videoContainerMouseDownHandler = (e) => {
    if (e.button === 4) {
      e.preventDefault();
      skip(5);
    } else if (e.button === 1) {
      e.preventDefault();
      toggleFullScreenMode()
    } else if (e.button === 3) {
      e.preventDefault();
      skip(-5);
    }
  };

  const playVideoState = () => {
    centerPlayButtonRef.current.style.visibility = "hidden";
    SetPauseVideo(true);
  };
  
  const videoContainerMouseWheelHandler = (e) => {
    if (e.deltaY>0 && fullScreenMode){
      changeVolume(-0.04);
    }else{
      changeVolume(0.04);
    }

  };

  const pauseVideoState = () => {
    SetPauseVideo(false);
  };

  const togglePlay = () => {
    videoRef.current.paused
      ? videoRef.current.play()
      : videoRef.current.pause();
  };

  const toggleCaptions = () => {
    if (showCaptions) {
      SetShowCaptions(false);
    } else {
      SetShowCaptions(true);
    }
  };

  const volumeInput = (e) => {
    volumeSliderRef.current.style.background = "linear-gradient(90deg, #3ae23a "+e.target.value*100+"%, #fff "+e.target.value*100+"%)"
    videoRef.current.volume = e.target.value;
    videoRef.current.muted = e.target.value === 0;
  };

  const videoContainerMouseMoveHandler = (e) => {
    if (document.fullscreenElement != null) {
      // Hide controls in full screen
      const rect = videoContainerRef.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientY - rect.y), rect.height) / rect.height;
      if (percent > 0.7) {
        videoContainerRef.current.classList.add("show-controls");
      } else {
        videoContainerRef.current.classList.remove("show-controls");
      }
    } else {
      videoContainerRef.current.classList.add("show-controls");
    }
  };

  const videoContainerMouseLeaveHandler = (e) => {
    if (pauseVideo) {
      videoContainerRef.current.classList.remove("show-controls");
    }
  };

  return (
    <div
      className="video-container"
      onMouseDown={videoContainerMouseDownHandler}
      onMouseLeave={videoContainerMouseLeaveHandler}
      onMouseMove={videoContainerMouseMoveHandler}
      onWheel={videoContainerMouseWheelHandler}
      ref={videoContainerRef}
    >
      <canvas className="thumbnail-img" ref={thumbnailImgRef}></canvas>

      <img
        src="/static/images/play.png"
        alt="play"
        className="central-play-button"
        ref={centerPlayButtonRef}
      ></img>

      {showCaptions && (
        <ClosedCaptions captionsRef={captionsRef}></ClosedCaptions>
      )}

      <VideoControls
        sprite={props.sprite}
        pauseVideo={pauseVideo}
        title={props.title}
        videoControlsRef={videoControlsRef}
        toggleFullScreenMode={toggleFullScreenMode}
        fullScreenMode={fullScreenMode}
        toggleMiniPlayer={toggleMiniPlayer}
        togglePlay={togglePlay}
        volumeLevel={volumeLevel}
        volumeSliderRef={volumeSliderRef}
        currentTimeRef={currentTimeRef}
        totalTimeRef={totalTimeRef}
        toggleReverseDuration={toggleReverseDuration}
        toggleMute={toggleMute}
        toggleCaptions={toggleCaptions}
        captionsButtonRef={captionsButtonRef}
        speedButtonRef={speedButtonRef}
        changePlaybackSpeed={changePlaybackSpeed}
        rewindFiveSeconds={rewindFiveSeconds}
        volumeInput={volumeInput}
        previewImgRef={previewImgRef}
        timelineContainerRef={timelineContainerRef}
      ></VideoControls>

      <Video
        {...props}
        videoRef={videoRef}
        playVideoState={playVideoState}
        pauseVideoState={pauseVideoState}
        timeupdate={timeUpdate}
        loadeddata={loadedData}
        volumechange={volumeChange}
      ></Video>
    </div>
  );
}

export default ResponsivePlayer;
