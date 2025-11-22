import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import VolumeDetail from './components/VolumeDetail';
import TagList from './components/TagList';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentVolume, setCurrentVolume] = useState(null);

  const handlePlay = (song, list, volume) => {
    setCurrentSong(song);
    setPlaylist(list);
    if (volume) setCurrentVolume(volume);
  };

  const handleEnded = () => {
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      setCurrentSong(playlist[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    handleEnded();
  };

  const handlePrev = () => {
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex > 0) {
      setCurrentSong(playlist[currentIndex - 1]);
    }
  };

  return (
    <Router>
      <Layout
        currentSong={currentSong}
        currentVolume={currentVolume}
        playlist={playlist}
        onEnded={handleEnded}
        onNext={handleNext}
        onPrev={handlePrev}
        onPlay={handlePlay}
      >
        <Routes>
          <Route path="/" element={<TagList onPlay={handlePlay} />} />
          <Route path="/journal/:id" element={<VolumeDetail onPlay={handlePlay} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
