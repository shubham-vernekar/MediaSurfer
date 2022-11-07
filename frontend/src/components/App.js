import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import VideoPlayer from './pages/VideoPlayer';
import StarAdvert from './pages/StarAdvert';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/player" element={<VideoPlayer />} />
        <Route path="/star" element={<StarAdvert />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;