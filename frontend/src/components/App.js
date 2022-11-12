import { BrowserRouter, Routes, Route } from "react-router-dom";

import VideoPlayer from "./pages/VideoPlayer";
import StarAdvert from "./pages/StarAdvert";
import VideoAdvert from "./pages/VideoAdvert";
import VideoBannerPage from "./pages/VideoBannerPage";
import Navbar from "./Navbar"

function App() {
  return (
    <div>
      <Navbar/>
      <BrowserRouter>
        <Routes>
          <Route path="/player" element={<VideoPlayer />} />
          <Route path="/stars" element={<StarAdvert />} />
          <Route path="/video" element={<VideoAdvert />} />
          <Route path="/banner" element={<VideoBannerPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
