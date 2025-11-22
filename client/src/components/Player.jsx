import React, { useEffect, useRef, useState } from 'react';

const Player = ({ currentSong, currentVolume, playlist, onEnded, onNext, onPrev, onPlay }) => {
    const audioRef = useRef(null);
    const playlistRef = useRef(null);
    const [showPlaylist, setShowPlaylist] = useState(false);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Playback failed:", e));
        }
    }, [currentSong]);

    // Click outside to close playlist
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (playlistRef.current && !playlistRef.current.contains(event.target) && !event.target.closest('.control-btn')) {
                setShowPlaylist(false);
            }
        };

        if (showPlaylist) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPlaylist]);

    if (!currentSong) return null;

    return (
        <div className="player-bar">
            {showPlaylist && (
                <div className="playlist-overlay" ref={playlistRef}>
                    <div className="playlist-header">
                        <h4>Playlist ({playlist.length})</h4>
                    </div>
                    <div className="playlist-content">
                        {playlist.map((song, index) => (
                            <div
                                key={index}
                                className={`playlist-item ${song.id === currentSong.id ? 'active' : ''}`}
                                onClick={() => onPlay(song, playlist, currentVolume)}
                            >
                                <span className="playlist-index">{index + 1}</span>
                                <span className="playlist-title">{song.title}</span>
                                <span className="playlist-artist">{song.artist}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                {currentVolume && (
                    <img
                        src={currentVolume.cover}
                        alt={currentVolume.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                )}
                <div style={{ textAlign: 'left', minWidth: '150px' }}>
                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{currentSong.title}</div>
                    <div style={{ fontSize: '0.8em', color: 'var(--color-text-muted)' }}>{currentSong.artist}</div>
                    {currentVolume && (
                        <div style={{ fontSize: '0.7em', color: 'var(--color-text-muted)', opacity: 0.8 }}>Vol.{currentVolume.vol} {currentVolume.title}</div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 2, justifyContent: 'center' }}>
                <button onClick={onPrev} className="control-btn">⏮</button>
                <audio
                    ref={audioRef}
                    src={`http://localhost:3001${currentSong.src}`}
                    controls
                    autoPlay
                    onEnded={onEnded}
                    style={{ width: '100%', maxWidth: '600px' }}
                />
                <button onClick={onNext} className="control-btn">⏭</button>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={`control-btn ${showPlaylist ? 'active' : ''}`}
                    title="Toggle Playlist"
                >
                    ☰
                </button>
            </div>
        </div>
    );
};

export default Player;
