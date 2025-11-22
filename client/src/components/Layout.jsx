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
                padding: '2.5rem 0',
                backgroundImage: 'url(/banner.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(18, 18, 18, 0.6)', // Dark overlay
                    zIndex: -1
                }}></div>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Link to="/" className="logo" style={{ fontSize: '2.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--color-text)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Luoo Player</Link>
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
