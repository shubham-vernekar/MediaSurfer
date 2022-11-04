import ResponsivePlayer from "../video_player/ResponsivePlayer"

function VideoPlayer() {

    // Test data
    let url = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    let subtitle = null
    let poster = null
    let sprite = null
    let sprite_pos_file = null

    const myStyle = {
        display:"grid",
        justifyContent: "center",
      };

    
    return (
        <div style={myStyle}>
            <ResponsivePlayer
                url={url}
                subtitle={subtitle}
                poster={poster}
                sprite={sprite}
                sprite_pos_file={sprite_pos_file}
            />
            <h2>TITLE PLACEHOLDER</h2>
      </div>
    )
  }
  
  export default VideoPlayer;