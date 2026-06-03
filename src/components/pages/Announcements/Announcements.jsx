import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";
import { apiGetAnnouncements, apiCreatePost, apiDeletePost } from "../../../lib/api";
import "./Announcements.css";

function Announcements() {
    const { user } = useAuth();
    const { t } = useConfig();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [text, setText] = useState("");
    const [image, setImage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        apiGetAnnouncements()
            .then(data => setAnnouncements(data))
            .catch(err => console.error("Failed to fetch announcements:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            const newAnnouncement = await apiCreatePost({
                username: user.name,
                text: text.trim(),
                image: image.trim() || null,
                isAnnouncement: true
            });
            setAnnouncements(prev => [newAnnouncement, ...prev]);
            setText("");
            setImage("");
        } catch (err) {
            console.error("Failed to create announcement:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAnnouncement = (id) => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this?")) return;
        
        apiDeletePost(id)
        .then(() => {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        })
        .catch(err => console.error("Failed to delete announcement:", err));
    };

    return (
        <section className="homepage">
            <Header title={t('announcements')} icon="fa-solid fa-bullhorn" />
            
            <section className="homepage_body">
                <div className="announcements_container">
                    
                    {/* Create Announcement Form (Admins Only) */}
                    {isAdmin && (
                        <Panel title={t('make_announcement') || "Crear Anuncio"} icon="fa-solid fa-bullhorn">
                            <form onSubmit={handleSubmit} className="create_announcement_form">
                                <textarea 
                                    placeholder={t('write_new_post') || "Escribe un nuevo anuncio..."}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    required
                                />
                                <input 
                                    type="text" 
                                    placeholder={t('add_image_url') || "URL de imagen opcional..."}
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                />
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (t('uploading') || "Publicando...") : (t('publish') || "Publicar")}
                                </button>
                            </form>
                        </Panel>
                    )}

                    {/* Announcements List */}
                    <div className="announcements_list">
                        {loading && <p>{t('loading') || "Cargando..."}</p>}
                        {!loading && announcements.length === 0 && (
                            <p>{t('no_posts') || "No hay anuncios aún."}</p>
                        )}
                        {!loading && announcements.map(announcement => (
                            <div key={announcement.id} className="announcement_card">
                                <div className="announcement_badge">
                                    <i className="fa-solid fa-bullhorn"></i> Announcement
                                </div>
                                <div className="announcement_header">
                                    <NavLink to={`/profile/${announcement.user?.name}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit' }}>
                                        <img src={announcement.user?.image || "/tempuser/temporary_pfp.png"} alt={announcement.user?.name} />
                                        <div>
                                            <h3>@{announcement.user?.name}</h3>
                                            <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                                        </div>
                                    </NavLink>
                                    {isAdmin && (
                                        <button 
                                            className="delete_btn"
                                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                                            title={t('delete') || "Delete"}
                                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginLeft: 'auto' }}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="announcement_content">
                                    <p>{announcement.text}</p>
                                    {announcement.images && announcement.images[0] && (
                                        <img src={announcement.images[0]} alt="Announcement" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </section>
    );
}

export default Announcements;
