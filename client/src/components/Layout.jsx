import React from 'react';
import { Link } from 'react-router-dom';
import Player from './Player';

const Layout = ({ children, currentSong, currentVolume, playlist, onEnded, onNext, onPrev, onPlay }) => {
    return (
        <div>
            <nav className="navbar" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '1.5rem 0',
                background: 'var(--color-surface)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" className="logo" style={{ fontSize: '2rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--color-text)' }}>Luoo Player</Link>
                </div>
            </nav>
            <main style={{ minHeight: '80vh', paddingTop: '100px' }}>
                {children}
            </main>
            <Player
                currentSong={currentSong}
                currentVolume={currentVolume}
                playlist={playlist}
                onEnded={onEnded}
                onNext={onNext}
                onPrev={onPrev}
                onPlay={onPlay}
            />
        </div>
    );
};

export default Layout;
