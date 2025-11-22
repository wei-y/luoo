import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTags, getJournals, getSongsByJournalId } from '../api';

const TagList = ({ onPlay }) => {
    const [tags, setTags] = useState([]);
    const [journals, setJournals] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [inputPage, setInputPage] = useState(1);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        setInputPage(page);
    }, [page]);

    const selectedTagIds = searchParams.get('tags')
        ? [...new Set(searchParams.get('tags').split(',').map(Number).filter(n => !isNaN(n)))]
        : [];

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const data = await getTags();
                setTags(data);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const data = await getJournals(page, 9, selectedTagIds);
                setJournals(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.total);
            } catch (error) {
                console.error("Failed to fetch journals:", error);
            }
        };
        fetchJournals();
    }, [page, searchParams]); // Re-fetch when page or params change

    // Reset page to 1 when tags change
    useEffect(() => {
        setPage(1);
    }, [searchParams.get('tags')]);

    const noTag = tags.find(t => t.name === 'No Tag');
    const otherTags = tags.filter(t => t.name !== 'No Tag');

    const getTagLink = (tagId) => {
        let newTags = [...selectedTagIds];

        // If "No Tag" is currently selected and we click it again (to remove)
        if (noTag && tagId === noTag.id && newTags.includes(noTag.id)) {
            return '/';
        }

        // If clicking "No Tag" to select it
        if (noTag && tagId === noTag.id) {
            return `/?tags=${tagId}`;
        }

        // If "No Tag" was previously selected, clear it (since we are selecting something else)
        if (noTag && newTags.includes(noTag.id)) {
            newTags = [];
        }

        if (newTags.includes(tagId)) {
            newTags = newTags.filter(id => id !== tagId);
        } else {
            newTags.push(tagId);
        }

        if (newTags.length === 0) return '/';
        return `/?tags=${newTags.join(',')}`;
    };

    const isSelected = (tagId) => selectedTagIds.includes(tagId);

    const handlePlayClick = async (e, journal) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const songs = await getSongsByJournalId(journal.id);
            if (songs && songs.length > 0) {
                onPlay(songs[0], songs, journal);
            }
        } catch (error) {
            console.error("Failed to play journal:", error);
        }
    };

    const getHeaderText = () => {
        if (selectedTagIds.length === 0) return 'All Journals';

        if (noTag && selectedTagIds.includes(noTag.id)) {
            return 'Journals without tag';
        }

        const selectedNames = selectedTagIds.map(id => {
            const tag = tags.find(t => t.id === id);
            return tag ? tag.name : '';
        }).filter(Boolean);

        if (selectedNames.length > 0) {
            return `Journals tagged with ${selectedNames.join(', ')}`;
        }

        return 'Journals';
    };

    return (
        <div className="container" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
                <div style={{ width: '250px', flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
                    <div style={{ flexShrink: 0 }}>
                        <h3>Tags</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Link
                                to="/"
                                className={`sidebar-tag ${selectedTagIds.length === 0 ? 'active' : ''}`}
                            >
                                All Tags
                            </Link>
                            {noTag && (
                                <Link
                                    key={noTag.id}
                                    to={`/?tags=${noTag.id}`}
                                    className={`sidebar-tag ${isSelected(noTag.id) ? 'active' : ''}`}
                                    style={{ display: 'flex', justifyContent: 'space-between' }}
                                >
                                    <span>{noTag.name}</span>
                                    <span style={{ opacity: 0.6, fontSize: '0.9em' }}>{noTag.count}</span>
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="hide-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        {otherTags.map(tag => (
                            <Link
                                key={tag.id}
                                to={getTagLink(tag.id)}
                                className={`sidebar-tag ${isSelected(tag.id) ? 'active' : ''}`}
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                            >
                                <span>{tag.name}</span>
                                <span style={{ opacity: 0.6, fontSize: '0.9em' }}>{tag.count}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="hide-scrollbar" style={{ flex: 1, height: '100%', overflowY: 'auto', position: 'relative' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--color-bg)',
                        zIndex: 100,
                        padding: '1rem 0',
                        borderBottom: '1px solid var(--color-border)'
                    }}>
                        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            {selectedTagIds.length === 0 ? (
                                <h3 style={{ margin: 0 }}>All Journals</h3>
                            ) : (
                                <>
                                    {selectedTagIds.map(id => {
                                        const tag = tags.find(t => t.id === id);
                                        if (!tag) return null;
                                        return (
                                            <Link
                                                key={tag.id}
                                                to={getTagLink(tag.id)}
                                                className="selected-tag-chip"
                                                title="Remove tag"
                                            >
                                                <span>{tag.name}</span>
                                                <span>×</span>
                                            </Link>
                                        );
                                    })}
                                    {selectedTagIds.length > 1 && (
                                        <Link
                                            to="/"
                                            style={{
                                                fontSize: '0.9em',
                                                color: 'var(--color-text-muted)',
                                                textDecoration: 'underline',
                                                marginLeft: '0.5rem'
                                            }}
                                        >
                                            Clear all
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text)',
                                    cursor: 'pointer',
                                    opacity: page === 1 ? 0.3 : 1,
                                    fontSize: '1.2em',
                                    padding: '0 0.5rem'
                                }}
                            >
                                ❮
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={inputPage}
                                onChange={(e) => setInputPage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const newPage = parseInt(inputPage);
                                        if (newPage >= 1 && newPage <= totalPages) {
                                            setPage(newPage);
                                        } else {
                                            setInputPage(page); // Revert if invalid
                                        }
                                    }
                                }}
                                onBlur={() => {
                                    const newPage = parseInt(inputPage);
                                    if (newPage >= 1 && newPage <= totalPages) {
                                        setPage(newPage);
                                    } else {
                                        setInputPage(page); // Revert
                                    }
                                }}
                                style={{
                                    width: '50px',
                                    textAlign: 'center',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text)',
                                    borderRadius: '4px',
                                    padding: '0.2rem',
                                    fontSize: '1em',
                                    fontWeight: 'bold'
                                }}
                            />
                            <span style={{ fontSize: '1.2em', fontWeight: 'bold', opacity: 0.8 }}>
                                / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page === totalPages}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text)',
                                    cursor: 'pointer',
                                    opacity: page === totalPages ? 0.3 : 1,
                                    fontSize: '1.2em',
                                    padding: '0 0.5rem'
                                }}
                            >
                                ❯
                            </button>
                            <span style={{ fontSize: '1.2em', fontWeight: 'bold', opacity: 0.8 }}>
                                <span style={{ margin: '0 0.5rem' }}>·</span> {totalCount} volumes
                            </span>
                        </div>
                    </div>
                    <div className="grid" style={{ paddingBottom: '120px' }}>
                        {journals.map(journal => (
                            <div key={journal.id} className="card">
                                <div style={{ position: 'relative' }}>
                                    <Link to={`/journal/${journal.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                        <div style={{ width: '100%', height: '250px', background: '#333', overflow: 'hidden', position: 'relative' }}>
                                            <img
                                                src={journal.cover}
                                                alt={journal.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/300?text=No+Cover';
                                                }}
                                            />
                                            <div className="play-overlay" onClick={(e) => handlePlayClick(e, journal)}>
                                                <div className="play-btn-large">▶</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        to={`/journal/${journal.id}`}
                                        className="details-btn"
                                        title="View Details"
                                    >
                                        ↗
                                    </Link>
                                </div>
                                <div className="card-content">
                                    <Link to={`/journal/${journal.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        <h3>Vol.{journal.vol} {journal.title}</h3>
                                    </Link>
                                    <div className="tags-container">
                                        {journal.tags && journal.tags.filter(t => t.name !== 'No Tag').map(tag => (
                                            <Link
                                                key={tag.id}
                                                to={getTagLink(tag.id)}
                                                className="tag-link"
                                            >
                                                {tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                    <div
                                        className="journal-desc"
                                        dangerouslySetInnerHTML={{ __html: journal.descs }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagList;
