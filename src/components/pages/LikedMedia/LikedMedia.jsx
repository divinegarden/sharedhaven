import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Media from "../../pieces/Media";
import "../MediaList/MediaList.css";

function LikedMedia() {
    const { t, likedMedia } = useConfig();

    return (
        <section className="homepage">
            <Header title={t('favorite_media') || "Favorite Media"} icon="fa-solid fa-star" />
            
            <section className="homepage_body">
                {(!likedMedia || likedMedia.length === 0) ? (
                    <p className="empty_state_text">
                        {t('no_favorite_media') || "No favorite media yet."}
                    </p>
                ) : (
                    <div className="media_column">
                        {likedMedia.map(media => (
                            <Media 
                                key={media.id}
                                id={media.externalId}
                                type={media.type}
                                title={media.title}
                                image={media.image}
                                developer={media.developer}
                                genre={media.genre}
                            />
                        ))}
                    </div>
                )}
            </section>
        </section>
    );
}

export default LikedMedia;
