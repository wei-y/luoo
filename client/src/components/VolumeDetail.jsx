
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJournalById, getSongsByJournalId } from '../api';

const VolumeDetail = ({ onPlay }) => {
    const { id } = useParams();
    const [journal, setJournal] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const journalData = await getJournalById(id);
                setJournal(journalData);
                const songsData = await getSongsByJournalId(id);
                setSongs(songsData);
            } catch (error) {
                console.error("Failed to fetch volume details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!journal) return <div>Volume not found</div>;

    return (
        <div className="container" style={{ height: 'calc(100vh - 100px)', overflowY: 'auto', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>Vol.{journal.vol} {journal.title}</h1>

                <div className="tags-container" style={{ padding: 0, height: 'auto', background: 'transparent', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {journal.tags && journal.tags.filter(t => t.name !== 'No Tag').map(tag => (
                        <Link
                            key={tag.id}
                            to={`/?tags=${tag.id}`}
                            className="tag-link"
                            style={{ fontSize: '0.9em', padding: '4px 12px' }}
                        >
                            {tag.name}
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'stretch', height: '500px', marginBottom: '2rem' }}>
                    {/* Left Pane: Image */}
                    <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', cursor: 'pointer' }}
                        onClick={() => songs.length > 0 && onPlay(songs[0], songs, journal)}>
                        <img
                            src={journal.cover}
                            alt={journal.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300?text=No+Cover';
                            }}
                        />
                        <div className="play-overlay" style={{ opacity: 0 }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                            <div className="play-btn-large">▶</div>
                        </div>
                    </div>

                    {/* Right Pane: Playlist */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {songs.map((song, index) => (
                                <div
                                    key={song.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.5rem 1rem',
                                        background: 'var(--color-surface)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        fontSize: '0.95em'
                                    }}
                                    onClick={() => onPlay(song, songs, journal)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
                                >
                                    <span style={{ width: '25px', color: 'var(--color-text-muted)', fontSize: '0.9em' }}>{index + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500' }}>{song.title}</div>
                                        <div style={{ fontSize: '0.85em', color: 'var(--color-text-muted)' }}>{song.artist}</div>
                                    </div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
                                        {Math.floor(song.length / 60)}:{String(song.length % 60).padStart(2, '0')}
                                    </div>
                                </div>
                            ))}
                            {songs.length === 0 && <p>No songs available (or filtered out).</p>}
                        </div>
                    </div>
                </div>

                {/* Bottom Pane: Description */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
                    <div
                        className="journal-desc"
                        style={{
                            lineHeight: '1.8',
                            fontSize: '1rem',
                            color: 'var(--color-text-muted)',
                            display: 'block',
                            height: 'auto',
                            whiteSpace: 'pre-wrap'
                        }}
                        dangerouslySetInnerHTML={{ __html: journal.descs }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VolumeDetail;

