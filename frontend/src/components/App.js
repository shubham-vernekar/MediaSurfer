import { BrowserRouter, Routes, Route } from "react-router-dom";

import VideoPlayerPage from "./pages/VideoPlayerPage";
import StarsPage from "./pages/StarsPage";
import VideoAdvert from "./pages/VideoAdvert";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import SeriesPage from "./pages/SeriesPage";
import Navbar from "./navbar/Navbar"
import UpdatePage from "./pages/UpdatePage";
import CustomPage from "./pages/CustomPage";
import ScrpPage from "./pages/ScrpPage";

function App() {
  return (
    <div>
      <Navbar/>
      <BrowserRouter>
        <Routes>
          <Route path="/player/:id" element={<VideoPlayerPage />} />
          <Route path="/stars" element={<StarsPage />} />
          <Route path="/video" element={<VideoAdvert />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/update" element={<UpdatePage />} />
          <Route path="/custom" element={<CustomPage />} />
          <Route path="/scrp" element={<ScrpPage />} />
          <Route path="" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
