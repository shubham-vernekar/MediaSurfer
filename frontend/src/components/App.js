import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import VideoPlayer from './pages/VideoPlayer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/player" element={<VideoPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;