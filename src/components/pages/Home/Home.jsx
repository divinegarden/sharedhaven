import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Media from "../../pieces/Media";
import "./Home.css";

const defaultGame = {
    id: "stardew-valley-default",
    title: "Stardew Valley",
    developer: "ConcernedApe",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    genre: "Cozy RPG / Farming Sim"
};

function Home() {
    const { t } = useConfig();
    const [game, setGame] = useState(defaultGame);
    const [creditsOpen, setCreditsOpen] = useState(false);

    useEffect(() => {
        fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://www.freetogame.com/api/games"))
            .then(res => {
                if (!res.ok) throw new Error("CORS proxy error");
                return res.json();
            })
            .then(data => {
                const gamesList = JSON.parse(data.contents);
                if (gamesList && gamesList.length > 0) {
                    const randomIdx = Math.floor(Math.random() * gamesList.length);
                    const selected = gamesList[randomIdx];
                    setGame({
                        id: selected.id || `random-${Math.random()}`,
                        title: selected.title,
                        developer: selected.developer || "Unknown",
                        thumbnail: selected.thumbnail,
                        genre: selected.genre || "Game"
                    });
                }
            })
            .catch(err => {
                console.warn("Home page failed to fetch random games, using default cozy game:", err);
            });
    }, []);

    return (
        <section className="homepage">
            <Header title={t('home')} icon="fa-solid fa-house" />

            <section className="homepage_body">
                <h2 className="home_heading">
                    {t('today_recommendation')}
                </h2>

                <Media 
                    id={game.id}
                    type="game"
                    title={game.title}
                    image={game.thumbnail}
                    developer={game.developer}
                    genre={game.genre}
                />

                <div className="areas">
                    <NavLink to="/posts">
                        <button>
                            <i className="fa-solid fa-lightbulb"></i>
                            {t('what_people_think')}
                        </button>
                    </NavLink>
                    <button onClick={() => setCreditsOpen(true)}>
                        <i className="fa-solid fa-clapperboard"></i>
                        {t('credits')}
                    </button>
                </div>
            </section>

            {creditsOpen && (
                <div className="modal_overlay" onClick={() => setCreditsOpen(false)}>
                    <div className="home_modal_content modal_content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="home_modal_title">
                            {t('credits_title')}
                        </h3>
                        <p className="home_modal_desc">
                            {t('credits_desc')}
                        </p>
                        <div className="home_modal_actions modal_actions">
                            <a 
                                href="https://github.com/divinegarden/sharedhaven" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="cancel_btn"
                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <i className="fa-brands fa-github"></i> GitHub
                            </a>
                            <button className="home_modal_save_btn save_btn" onClick={() => setCreditsOpen(false)}>
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Home;