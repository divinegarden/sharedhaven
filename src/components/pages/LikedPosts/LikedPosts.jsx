import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";

function LikedPosts() {
    const { user } = useAuth();
    const { t, likedPosts, togglePostLike } = useConfig();

    // Map Prisma Post models to component format
    const favoritePosts = (likedPosts || []).map(p => ({
        id: p.id,
        username: p.user?.name || "usuario",
        userPfp: p.user?.image || "/tempuser/temporary_pfp.png",
        text: p.text,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        date: new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }));

    return (
        <section className="homepage">
            <Header title={t('favorite_posts')} icon="fa-solid fa-heart" />

            <section className="homepage_body">
                {favoritePosts.length === 0 ? (
                    <p className="empty_state_text">
                        {t('no_favorite_posts')}
                    </p>
                ) : (
                    favoritePosts.map((post) => (
                        <Panel 
                            key={post.id} 
                            title={post.username} 
                            image={post.id.startsWith("user-post-") ? user?.pfp : post.userPfp} 
                            className="post"
                            titleLink={`/profile/${post.username}`}
                        >
                            {post.image && (
                                <img src={post.image} alt="Post media" className="post_image" />
                            )}
                            <p>{post.text}</p>
                            <div className="post_options">
                                <span className="post_date">{post.date}</span>
                                <button 
                                    className="liked" 
                                    onClick={() => togglePostLike(post.id)}
                                    title={t('remove_favorite')}
                                >
                                    <i className="fa-solid fa-heart"></i>
                                </button>
                            </div>
                        </Panel>
                    ))
                )}
            </section>
        </section>
    );
}

export default LikedPosts;

