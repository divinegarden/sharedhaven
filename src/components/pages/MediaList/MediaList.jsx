import { useState, useEffect, useRef } from "react";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Media from "../../pieces/Media";
import CustomSelect from "../../pieces/CustomSelect";
import "./MediaList.css";

/**
 * MediaList Page Component
 * Displays a list of games fetched from an external API (or backend proxy).
 * Supports filtering by platform and sorting.
 */
function MediaList() {
    const { t } = useConfig();
    
    // State for games data and loading/error status
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for filters
    const [sortBy, setSortBy] = useState("relevance");
    const [platform, setPlatform] = useState("all");

    // Options for the platform filter dropdown
    const platformOptions = [
        { value: "all", label: "All Platforms" },
        { value: "pc", label: "PC (Windows)" },
        { value: "browser", label: "Web Browser" }
    ];

    // Options for the sort filter dropdown
    const sortOptions = [
        { value: "relevance", label: "Relevance" },
        { value: "alphabetical", label: "Alphabetical" },
        { value: "release-date", label: "Release Date" },
        { value: "popularity", label: "Popularity" }
    ];

    // Fetch games whenever filters change
    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                let url = "/api/games";
                const params = [];
                if (platform !== "all") params.push(`platform=${platform}`);
                if (sortBy !== "relevance") params.push(`sort-by=${sortBy}`);
                
                if (params.length > 0) {
                    url += `?${params.join("&")}`;
                }

                // Fetch from our backend proxy
                const response = await fetch(url);
                
                if (!response.ok) throw new Error("Network response was not ok");
                
                const gamesList = await response.json();
                
                // The API returns { status: 0 } if no games found
                if (gamesList.status === 0) {
                    setGames([]);
                } else {
                    // Limit to 24 games for better performance
                    setGames(gamesList.slice(0, 24));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching games:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGames();
    }, [sortBy, platform]);

    return (
        <section className="homepage">
            <Header title={t('media')} icon="fa-solid fa-circle-play" />
            
            <section className="homepage_body">
                
                <div className="media_filters">
                    <div className="filter_group">
                        <span>{t('platform')}</span>
                        <CustomSelect 
                            options={platformOptions}
                            value={platform}
                            onChange={setPlatform}
                        />
                    </div>

                    <div className="filter_group">
                        <span>{t('sort_by')}</span>
                        <CustomSelect 
                            options={sortOptions}
                            value={sortBy}
                            onChange={setSortBy}
                        />
                    </div>
                </div>

                <div className="media_column">
                    {loading && <p className="media_list_message">{t('loading_games')}</p>}
                    {error && <p className="media_list_error">Error: {error}</p>}
                    
                    {!loading && !error && games.length === 0 && (
                        <p className="media_list_message">No se encontraron juegos con estos filtros.</p>
                    )}

                    {!loading && !error && games.map(game => (
                        <Media 
                            key={game.id}
                            id={game.id}
                            type="game"
                            title={game.title}
                            image={game.thumbnail}
                            developer={game.developer}
                            genre={game.genre}
                        />
                    ))}
                </div>
            </section>
        </section>
    );
}

export default MediaList;
