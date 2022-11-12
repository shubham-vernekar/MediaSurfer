import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import VideoPlayer from './pages/VideoPlayer';
import StarAdvert from './pages/StarAdvert';
import VideoAdvert from './pages/VideoAdvert';
import VideoBannerPage from './pages/VideoBannerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/player" element={<VideoPlayer />} />
        <Route path="/star" element={<StarAdvert />} />
        <Route path="/video" element={<VideoAdvert />} />
        <Route path="/banner" element={<VideoBannerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;