import '../../../static/css/video_player/ClosedCaptions.css';

function ClosedCaptions(props) {
  return (
    <div className="closed-captions-container">
      <span id="closed-captions-text" ref={props.captionsRef}> </span>
    </div>
  );
}

export default ClosedCaptions;