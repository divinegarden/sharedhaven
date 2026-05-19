import { useParams, NavLink } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";
import { apiGetUsers, apiGetPosts, apiCreatePost, apiDeletePost } from "../../../lib/api";
import "./UserProfile.css";

function UserProfile() {
    const { user } = useAuth();
    const { t } = useConfig();
    const { username } = useParams();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // User profile posts state
    const [posts, setPosts] = useState([]);
    const [newPostText, setNewPostText] = useState("");
    const [newPostImage, setNewPostImage] = useState("");

    // Determine if we are looking at our own profile
    const isOwnProfile = !username || username === user?.name;

    const handleDeletePost = (id) => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this?")) return;
        
        apiDeletePost(id)
        .then(() => {
            setPosts(prev => prev.filter(p => p.id !== id));
        })
        .catch(err => console.error("Error deleting post:", err));
    };

    useEffect(() => {
        if (!isOwnProfile) {
            setLoading(true);
            apiGetUsers()
                .then(users => {
                    const found = users.find(u => u.name === username);
                    if (found) {
                        setProfileData(found);
                    } else {
                        setProfileData(null);
                    }
                })
                .catch(err => console.error("Error loading user profile:", err))
                .finally(() => setLoading(false));
        } else {
            setProfileData(null);
        }
    }, [username, isOwnProfile]);

    const activeUser = isOwnProfile ? {
        name: user?.name,
        pfp: user?.pfp,
        banner: user?.banner,
        role: user?.role,
        description: user?.description
    } : {
        name: profileData?.name,
        pfp: profileData?.image,
        banner: profileData?.banner || "/tempuser/temporary_banner.png",
        role: profileData?.role,
        description: profileData?.description
    };

    // Load active profile posts from PostgreSQL
    useEffect(() => {
        if (activeUser.name) {
            apiGetPosts(activeUser.name)
                .then(data => setPosts(data))
                .catch(err => console.error("Error loading user posts:", err));
        }
    }, [activeUser.name]);

    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;

        apiCreatePost({
            username: activeUser.name,
            text: newPostText,
            image: newPostImage.trim() || null
        })
        .then(newPost => {
            setPosts(prev => [newPost, ...prev]);
            setNewPostText("");
            setNewPostImage("");
        })
        .catch(err => console.error("Error creating post:", err));
    };

    if (loading) {
        return (
            <section className="homepage">
                <Header title={t('my_profile')} icon="fa-solid fa-user" />
                <section className="homepage_body">
                    <p className="profile_loading_text">
                        {t('loading_profile')}
                    </p>
                </section>
            </section>
        );
    }

    if (!isOwnProfile && !profileData) {
        return (
            <section className="homepage">
                <Header title={t('user_profile')} icon="fa-solid fa-user" />
                <section className="homepage_body">
                    <Panel title={t('user_not_found')}>
                        <p className="profile_not_found_text">
                            {t('profile_not_exist')}
                        </p>
                        <NavLink to="/home" className="profile_return_home">
                            {t('return_home')}
                        </NavLink>
                    </Panel>
                </section>
            </section>
        );
    }

    return (
        <section className="homepage">
            <Header title={isOwnProfile ? t('my_profile') : (t('users_profile') + activeUser.name)} icon="fa-solid fa-user" />

            <section className="homepage_body">
                <Panel title={isOwnProfile ? t('my_profile') : t('user_profile')} image={activeUser.pfp} className="user_profile">
                    <div className="profile_banner" style={{ backgroundImage: `url(${activeUser.banner || "/tempuser/temporary_banner.png"})` }}>
                        <img src={activeUser.pfp || "/tempuser/temporary_pfp.png"} alt="" className="pfp" />
                    </div>
                    <div className="profile_info">
                        <h1>@{activeUser.name}</h1>
                        <p className="profile_description">{activeUser.description || t('description')}</p>
                        {isOwnProfile && (
                            <div className="profile_options">
                                <NavLink to="/settings">
                                    <button title={t('settings')}><i className="fa-solid fa-gear"></i></button>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* Make a Post if viewing own profile */}
                {isOwnProfile && (
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
                )}

                {/* User's Posts Feed */}
                <h3 className="profile_section_title">
                    <i className="fa-solid fa-feather-pointed"></i>
                    {t('users_posts') + activeUser.name}
                </h3>

                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Panel 
                            key={post.id} 
                            title={`@${post.user?.name || activeUser.name}`} 
                            image={post.user?.image || activeUser.pfp || "/tempuser/temporary_pfp.png"} 
                            className="post"
                        >
                            {post.images && post.images.length > 0 && (
                                <img src={post.images[0]} alt="Post media" className="profile_post_image" />
                            )}
                            <p className="profile_post_text">{post.text}</p>
                            <div className="profile_post_options">
                                <span className="post_date">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                {isOwnProfile && (
                                    <button 
                                        className="delete_btn"
                                        onClick={() => handleDeletePost(post.id)}
                                        title={t('delete') || "Delete"}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginLeft: '10px' }}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </Panel>
                    ))
                ) : (
                    <div className="profile_no_posts">
                        <i className="fa-solid fa-face-smile"></i>
                        <p>{t('no_posts')}</p>
                    </div>
                )}
            </section>
        </section>
    );
}

export default UserProfile;