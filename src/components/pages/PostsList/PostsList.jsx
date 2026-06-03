import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";
import { apiGetPosts, apiCreatePost, apiDeletePost } from "../../../lib/api";

function PostsList() {
    const { user } = useAuth();
    const { t, likedPosts, togglePostLike } = useConfig();

    const [dbPosts, setDbPosts] = useState([]);

    const [newPostText, setNewPostText] = useState("");
    const [newPostImage, setNewPostImage] = useState("");

    // Load posts from PostgreSQL
    useEffect(() => {
        apiGetPosts()
            .then(data => setDbPosts(data))
            .catch(err => console.error("Error loading posts:", err));
    }, []);

    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        apiCreatePost({
            username: user?.name,
            text: newPostText,
            image: newPostImage.trim() || null
        })
        .then(newPost => {
            setDbPosts(prev => [newPost, ...prev]);
            setNewPostText("");
            setNewPostImage("");
        })
        .catch(err => console.error("Error creating post:", err));
    };

    const handleDeletePost = (id) => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this?")) return;
        
        apiDeletePost(id)
        .then(() => {
            setDbPosts(prev => prev.filter(p => p.id !== id));
        })
        .catch(err => console.error("Error deleting post:", err));
    };

    // Format database posts for display
    const allPosts = dbPosts.map(p => ({
        id: p.id,
        username: p.user?.name || "usuario",
        userPfp: p.user?.image || "/tempuser/temporary_pfp.png",
        text: p.text,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        date: new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }));

    return (
        <section className="homepage">
            <Header title={t('welcome') + " " + t('home')} icon="fa-solid fa-list" />

            <section className="homepage_body">
                {/* Create Post Form */}
                <Panel title={t('share_thoughts')} icon="fa-solid fa-pen-nib" className="create_post_panel">
                    <form onSubmit={handleCreatePost}>
                        <textarea 
                            placeholder={t('write_new_post')}
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            maxLength={1000}
                            required
                        />
                        <div className="post_actions">
                            <div className="image_input_container">
                                <i className="fa-solid fa-image" title={t('add_image_url')}></i>
                                <input 
                                    type="text" 
                                    placeholder={t('optional_image_url')}
                                    value={newPostImage}
                                    onChange={(e) => setNewPostImage(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="submit_btn">
                                {t('publish')}
                            </button>
                        </div>
                    </form>
                </Panel>

                {/* Posts Feed using flex-wrap */}
                {allPosts.map((post) => {
                    const isLiked = likedPosts?.some(p => p.id === post.id);
                    return (
                        <Panel 
                            key={post.id} 
                            title={`@${post.username}`} 
                            image={post.userPfp} 
                            className="post"
                            titleLink={`/profile/${post.username}`}
                        >
                            {post.image && (
                                <img src={post.image} alt="Post media" className="post_image" />
                            )}
                            <p>{post.text}</p>
                            <div className="post_options">
                                <span className="post_date">{post.date}</span>
                                <div className="post_buttons">
                                    {user?.name === post.username && (
                                        <button 
                                            className="delete_btn"
                                            onClick={() => handleDeletePost(post.id)}
                                            title={t('delete') || "Delete"}
                                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginRight: '10px' }}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                    <button 
                                        className={isLiked ? "liked" : ""} 
                                        onClick={() => togglePostLike(post.id)}
                                        title={isLiked ? t('unlike') : t('like')}
                                    >
                                        <i className="fa-solid fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                        </Panel>
                    );
                })}
            </section>
        </section>
    );
}

export default PostsList;
