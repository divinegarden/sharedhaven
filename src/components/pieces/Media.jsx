import { useConfig } from "../contexts/config";
import "./pieceStyles/Media.css";

/**
 * Media Component
 * Displays a single game or movie card.
 * Handles adding/removing from LikedMedia favorites in the DB.
 */
function Media({ id, type, image, title, developer, genre }) {
    const { t, likedMedia, toggleMediaStar } = useConfig();
    const displayType = type === "game" ? t('game') : t('movie');
    
    const isStarred = likedMedia?.some(m => m.externalId === String(id));
    
    const handleStarClick = () => {
        toggleMediaStar({ id, type, image, title, developer, genre });
    };

    return (
        <article className="media">
            <div className="info" style={{ backgroundImage: `url(${image})` }}>
                <p className="type">{displayType}</p>
                <div className="details">
                    <div className="name">
                        <h1>{title}</h1>
                        <p>{developer || genre || ""}</p>
                    </div>
                    <button 
                        onClick={handleStarClick} 
                        style={{ color: isStarred ? 'gold' : 'var(--textColor)' }}
                        title="Toggle Favorite"
                    >
                        <i className="fa-solid fa-star"></i>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default Media;