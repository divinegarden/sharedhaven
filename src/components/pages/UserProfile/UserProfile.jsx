// React & Router
import { useParams, NavLink } from "react-router";
import { useState, useEffect } from "react";

// Contexts & Hooks
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";

// Components
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";

// API
import { apiGetUsers, apiGetPosts, apiCreatePost, apiDeletePost, apiFollowUser } from "../../../lib/api";

// Styles
import "./UserProfile.css";

function UserProfile() {
    // Contexts
    const { user } = useAuth();
    const { t } = useConfig();
    const { username } = useParams();

    // Core Profile State
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // User Posts State
    const [posts, setPosts] = useState([]);
    const [newPostText, setNewPostText] = useState("");
    const [newPostImage, setNewPostImage] = useState("");

    // Follows Modal State
    const [followsModal, setFollowsModal] = useState({ isOpen: false, isClosing: false, type: "" });

    // Computed Values
    const isOwnProfile = !username || username === user?.name;

    const handleDeletePost = (id) => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this?")) return;
        
        apiDeletePost(id)
        .then(() => {
            setPosts(prev => prev.filter(p => p.id !== id));
        })
        .catch(err => console.error("Error deleting post:", err));
    };

    // ==========================================
    // Lifecycle & Data Fetching
    // ==========================================
    
    const loadUserData = () => {
        const targetName = isOwnProfile ? user?.name : username;
        if (!targetName) return;
        setLoading(true);
        apiGetUsers()
            .then(users => {
                const found = users.find(u => u.name === targetName);
                setProfileData(found || null);
            })
            .catch(err => console.error("Error loading user profile:", err))
            .finally(() => setLoading(false));
    };

    // Load user data on mount or when username changes
    useEffect(() => {
        loadUserData();
    }, [username, isOwnProfile, user?.name]);

    // Construct an active user object to fallback gracefully to logged-in user context
    const activeUser = {
        name: profileData?.name || (isOwnProfile ? user?.name : username),
        pfp: profileData?.image || (isOwnProfile ? user?.pfp : null),
        banner: profileData?.banner || (isOwnProfile ? user?.banner : "/tempuser/temporary_banner.png"),
        role: profileData?.role || (isOwnProfile ? user?.role : null),
        description: profileData?.description || (isOwnProfile ? user?.description : null),
        followers: profileData?.followers || [],
        following: profileData?.following || []
    };

    // Check if the current logged-in user is following this profile's user
    const isFollowingTarget = activeUser.followers.some(u => u.name === user?.name);

    // ==========================================
    // Follow/Unfollow Logic
    // ==========================================

    const handleFollowToggle = async () => {
        if (!user || isOwnProfile) return;
        try {
            await apiFollowUser(user.name, activeUser.name);
            loadUserData(); // Reload to get updated followers
        } catch (err) {
            console.error("Error toggling follow:", err);
        }
    };

    // ==========================================
    // Modals & Handlers
    // ==========================================

    const openFollowsModal = (type) => setFollowsModal({ isOpen: true, isClosing: false, type });
    const closeFollowsModal = () => {
        setFollowsModal(prev => ({ ...prev, isClosing: true }));
        // Wait for CSS animation to finish before unmounting
        setTimeout(() => setFollowsModal({ isOpen: false, isClosing: false, type: "" }), 300);
    };

    // Load active profile's posts whenever the active user changes
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

            {followsModal.isOpen && (
                <div className={`modal_overlay ${followsModal.isClosing ? 'closing' : ''}`}>
                    <div className={`modal_content ${followsModal.isClosing ? 'closing' : ''}`}>
                        <h3>{followsModal.type === 'followers' ? 'Followers' : 'Following'}</h3>
                        <div className="follows_list">
                            {(followsModal.type === 'followers' ? activeUser.followers : activeUser.following).length > 0 ? (
                                (followsModal.type === 'followers' ? activeUser.followers : activeUser.following).map(u => (
                                    <NavLink to={`/profile/${u.name}`} key={u.id} className="follows_item" onClick={closeFollowsModal}>
                                        <img src={u.image || "/tempuser/temporary_pfp.png"} alt={u.name} />
                                        <span>@{u.name}</span>
                                    </NavLink>
                                ))
                            ) : (
                                <p>No {followsModal.type} yet.</p>
                            )}
                        </div>
                        <div className="modal_actions">
                            <button onClick={closeFollowsModal} className="cancel_btn">{t('close') || 'Close'}</button>
                        </div>
                    </div>
                </div>
            )}

            <section className="homepage_body">
                <Panel title={isOwnProfile ? t('my_profile') : t('user_profile')} image={activeUser.pfp} className="user_profile">
                    <div className="profile_banner" style={{ backgroundImage: `url(${activeUser.banner || "/tempuser/temporary_banner.png"})` }}>
                        <img src={activeUser.pfp || "/tempuser/temporary_pfp.png"} alt="" className="pfp" />
                    </div>
                    <div className="profile_info">
                        <h1>@{activeUser.name}</h1>
                        <p className="profile_description">{activeUser.description || t('description')}</p>
                        
                        <div className="profile_follows">
                            <span onClick={() => openFollowsModal('followers')} className="follows_stat">
                                <strong>{activeUser.followers.length}</strong> Followers
                            </span>
                            <span onClick={() => openFollowsModal('following')} className="follows_stat">
                                <strong>{activeUser.following.length}</strong> Following
                            </span>
                        </div>

                        {isOwnProfile ? (
                            <div className="profile_options">
                                <NavLink to="/settings">
                                    <button title={t('settings')}><i className="fa-solid fa-gear"></i></button>
                                </NavLink>
                            </div>
                        ) : (
                            user && (
                                <div className="profile_actions">
                                    <button onClick={handleFollowToggle} className={isFollowingTarget ? "btn_unfollow" : "btn_follow"}>
                                        {isFollowingTarget ? (
                                            <><i className="fa-solid fa-user-check"></i> Unfollow</>
                                        ) : (
                                            <><i className="fa-solid fa-user-plus"></i> Follow</>
                                        )}
                                    </button>
                                </div>
                            )
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
                            titleLink={`/profile/${post.user?.name || activeUser.name}`}
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