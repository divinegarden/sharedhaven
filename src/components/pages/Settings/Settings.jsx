import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";
import CustomSelect from "../../pieces/CustomSelect";
import { apiGetUsers, apiCreateUser, apiUpdateUserProfile } from "../../../lib/api";
import "./Settings.css";

/**
 * Settings Page Component
 * Allows users to change their profile info, site theme, and language.
 * Admins can also register new users and view the user roster.
 */
function Settings() {
    // Contexts
    const { user, logout, updateUser } = useAuth();
    const { theme, nextTheme, prevTheme, language, nextLanguage, prevLanguage, t } = useConfig();
    
    // UI State
    const [notification, setNotification] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, isClosing: false, field: "", value: "", value2: "" });

    // Admin State Management
    const [usersList, setUsersList] = useState([]);
    const [adminForm, setAdminForm] = useState({ name: '', password: '', role: 'USER', image: '' });

    // Options for the custom select role dropdown
    const roleOptions = [
        { value: "USER", label: t('role_user') },
        { value: "ADMIN", label: t('role_admin') }
    ];

    // Fetch user list for admin view
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            apiGetUsers()
                .then(data => {
                    if (Array.isArray(data)) {
                        setUsersList(data);
                    }
                })
                .catch(err => console.error("Admin user list fetch error:", err));
        }
    }, [user]);

    /**
     * Handles the creation of a new user by an admin.
     */
    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!adminForm.name || !adminForm.password) {
            alert(t('user_pass_required'));
            return;
        }
        try {
            const newUser = await apiCreateUser(adminForm);
            showNotification(t('account_created') + " @" + newUser.name);
            
            // Refresh Roster List after creation
            const refreshed = await apiGetUsers();
            if (Array.isArray(refreshed)) {
                setUsersList(refreshed);
            }
            // Reset Form
            setAdminForm({ name: '', password: '', role: 'USER', image: '' });
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error creating user');
        }
    };

    /**
     * Shows a temporary status notification.
     */
    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    /**
     * Opens the modal for editing a specific field.
     */
    const openModal = (field, initialValue = "", initialValue2 = "") => {
        let val = initialValue;
        let val2 = initialValue2;
        if (field === "imágenes") {
            if (val === "/tempuser/temporary_pfp.png") val = "";
            if (val2 === "/tempuser/temporary_banner.png") val2 = "";
        }
        setModal({ isOpen: true, isClosing: false, field, value: val, value2: val2 });
    };

    /**
     * Closes the modal with a fade-out animation.
     */
    const closeModal = () => {
        setModal(prev => ({ ...prev, isClosing: true }));
        setTimeout(() => {
            setModal({ isOpen: false, isClosing: false, field: "", value: "", value2: "" });
        }, 300);
    };

    /**
     * Handles file input changes and converts files to base64 strings.
     */
    const handleFileChange = (e, targetField) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (targetField === "pfp") {
                    setModal(prev => ({ ...prev, value: reader.result }));
                } else {
                    setModal(prev => ({ ...prev, value2: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Saves the changes made in the modal based on the active field.
     */
    const handleSave = () => {
        if (modal.field === "usuario") {
            updateUser({ name: modal.value });
            showNotification(t('username_updated'));
        } else if (modal.field === "correo") {
            updateUser({ email: modal.value });
            showNotification(t('email_updated'));
        } else if (modal.field === "contraseña") {
            showNotification(t('password_updated'));
        } else if (modal.field === "imágenes") {
            apiUpdateUserProfile(user.name, { pfp: modal.value, banner: modal.value2 })
                .then(updatedUser => {
                    updateUser({ pfp: updatedUser.pfp, banner: updatedUser.banner });
                    showNotification(t('images_updated'));
                })
                .catch(err => {
                    console.error("Failed to update profile images:", err);
                    alert("Failed to update profile images: " + err.message);
                });
        } else if (modal.field === "descripción") {
            apiUpdateUserProfile(user.name, { description: modal.value })
                .then(updatedUser => {
                    updateUser({ description: updatedUser.description });
                    showNotification(t('description_updated'));
                })
                .catch(err => {
                    console.error("Failed to update profile description:", err);
                    alert("Failed to update profile description: " + err.message);
                });
        }
        closeModal();
    };

    return (
        <section className="homepage">
            <Header title={t('settings')} icon="fa-solid fa-gear" />

            <section className="homepage_body">
                {notification && (
                    <div className="status_notification">
                        {notification}
                    </div>
                )}

                {modal.isOpen && (
                    <div className={`modal_overlay ${modal.isClosing ? 'closing' : ''}`}>
                        <div className={`modal_content ${modal.isClosing ? 'closing' : ''}`}>
                            <h3>{t('change')} {modal.field}</h3>
                            
                            {modal.field === "imágenes" ? (
                                <div className="settings_images_modal_body" onClick={(e) => e.stopPropagation()}>
                                    <div className="file_input_group">
                                        <p>{t('profile_picture')}</p>
                                        <input 
                                            type="text" 
                                            value={modal.value.startsWith("data:") ? t('image_loaded') : modal.value} 
                                            onChange={(e) => setModal({ ...modal, value: e.target.value })}
                                            placeholder="URL"
                                        />
                                        <div className="settings_upload_hint">{t('upload_file')}</div>
                                        <label className="file_label">
                                            {modal.value.startsWith("data:") ? t('file_selected') : t('choose_file')}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "pfp")}
                                            />
                                        </label>
                                    </div>

                                    <hr className="settings_divider" />

                                    <div className="file_input_group">
                                        <p>{t('banner')}</p>
                                        <input 
                                            type="text" 
                                            value={modal.value2.startsWith("data:") ? t('image_loaded') : modal.value2} 
                                            onChange={(e) => setModal({ ...modal, value2: e.target.value })}
                                            placeholder="URL"
                                        />
                                        <div className="settings_upload_hint">{t('upload_file')}</div>
                                        <label className="file_label">
                                            {modal.value2.startsWith("data:") ? t('file_selected') : t('choose_file')}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "banner")}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : modal.field === "descripción" ? (
                                <textarea
                                    value={modal.value}
                                    onChange={(e) => setModal({ ...modal, value: e.target.value })}
                                    placeholder={t('new_field') + modal.field}
                                    autoFocus
                                    maxLength={300}
                                    className="description_textarea"
                                />
                            ) : (
                                <input 
                                    type={modal.field === "contraseña" ? "password" : "text"} 
                                    value={modal.value} 
                                    onChange={(e) => setModal({ ...modal, value: e.target.value })}
                                    placeholder={t('new_field') + modal.field}
                                    autoFocus
                                />
                            )}

                            <div className="modal_actions">
                                <button onClick={closeModal} className="cancel_btn">{t('cancel')}</button>
                                <button onClick={handleSave} className="save_btn">{t('save')}</button>
                            </div>
                        </div>
                    </div>
                )}

                <Panel title={`${t('user_settings')}${user?.name || t('username').toLowerCase()}`} image={user?.pfp} className="usersettings">
                    <div className="user">
                        <img 
                            src={user?.pfp || "/tempuser/temporary_pfp.png"} 
                            alt="" 
                            className="pfp settings_cursor_pointer" 
                            onClick={() => openModal("imágenes", user?.pfp, user?.banner)}
                            title={t('change_images')}
                        />
                        <div className="userinfo">
                            <h2>{user?.name || t('username')}</h2>
                            <p>{user?.email || t('no_email')}</p>
                            <p className="user_description">{user?.description || t('no_description')}</p>
                        </div>
                    </div>
                    <div className="useractions">
                        <button onClick={() => openModal("usuario", user?.name)}>{t('change_user')}</button>
                        <button onClick={() => openModal("correo", user?.email)}>{t('change_email')}</button>
                        <button onClick={() => openModal("contraseña")}>{t('change_pass')}</button>
                        <button onClick={() => openModal("descripción", user?.description)}>{t('change_description')}</button>
                        <button className="settings_logout_btn" onClick={logout}>{t('logout')}</button>
                    </div>
                </Panel>

                <Panel title={t('site_settings')} icon="fa-solid fa-gear" className="sitesettings">
                    <div className="option">
                        {t('change_theme')}
                        <div className="optionPicker">
                            <i className="fa-solid fa-circle-left settings_cursor_pointer" onClick={prevTheme}></i>
                            <p className="settings_capitalize_text">{theme === 'default' ? 'Cloud 9' : theme}</p>
                            <i className="fa-solid fa-circle-right settings_cursor_pointer" onClick={nextTheme}></i>
                        </div>
                    </div>
                    <div className="option">
                        {t('change_lang')}
                        <div className="optionPicker">
                            <i className="fa-solid fa-circle-left settings_cursor_pointer" onClick={prevLanguage}></i>
                            <p>{language}</p>
                            <i className="fa-solid fa-circle-right settings_cursor_pointer" onClick={nextLanguage}></i>
                        </div>
                    </div>
                </Panel>

                {user?.role === 'ADMIN' && (
                    <Panel title={t('admin_settings')} icon="fa-solid fa-users-gear" className="adminsettings">
                        <div className="admin_panel_layout">
                            {/* Form Column */}
                            <div className="admin_column form_section">
                                <h3 className="admin_title">
                                    <i className="fa-solid fa-user-plus"></i>
                                    {t('register_account')}
                                </h3>
                                <form onSubmit={handleCreateUser} className="admin_form">
                                    <div className="input_group">
                                        <label>{t('username')}</label>
                                        <div className="input_wrapper">
                                            <i className="fa-solid fa-user icon_decor"></i>
                                            <input 
                                                type="text" 
                                                placeholder={t('enter_username')}
                                                value={adminForm.name}
                                                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="input_group">
                                        <label>{t('password')}</label>
                                        <div className="input_wrapper">
                                            <i className="fa-solid fa-key icon_decor"></i>
                                            <input 
                                                type="password" 
                                                placeholder={t('choose_password')}
                                                value={adminForm.password}
                                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="input_group">
                                        <label>{t('avatar_url_optional')}</label>
                                        <div className="input_wrapper">
                                            <i className="fa-solid fa-image icon_decor"></i>
                                            <input 
                                                type="text" 
                                                placeholder="https://..."
                                                value={adminForm.image}
                                                onChange={(e) => setAdminForm({ ...adminForm, image: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="input_group settings_select_group">
                                        <label>{t('system_role')}</label>
                                        <div className="input_wrapper settings_select_wrapper">
                                            <i className="fa-solid fa-shield-halved icon_decor settings_select_icon"></i>
                                            <CustomSelect 
                                                options={roleOptions}
                                                value={adminForm.role}
                                                onChange={(val) => setAdminForm({ ...adminForm, role: val })}
                                                label={t('select_role')}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="admin_submit_btn">
                                        <i className="fa-solid fa-paw btn_paw"></i>
                                        {t('register_db_account')}
                                    </button>
                                </form>
                            </div>

                            {/* Roster Column */}
                            <div className="admin_column roster_section">
                                <h3 className="admin_title">
                                    <i className="fa-solid fa-id-card"></i>
                                    {t('db_user_roster')}
                                </h3>
                                <div className="admin_user_grid">
                                    {usersList.length > 0 ? (
                                        usersList.map((u) => (
                                            <div key={u.id} className="admin_user_card">
                                                <div className="card_left">
                                                    <img 
                                                        src={u.image || "/tempuser/temporary_pfp.png"} 
                                                        alt={u.name} 
                                                        className="card_avatar"
                                                    />
                                                    <div className="card_details">
                                                        <span className="card_username">@{u.name}</span>
                                                        <span className="card_uid">ID: {u.id}</span>
                                                    </div>
                                                </div>
                                                <div className="card_right">
                                                    <span className={`role_badge ${u.role === 'ADMIN' ? 'role_admin' : 'role_user'}`}>
                                                        {u.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                                                    </span>
                                                    <span className="status_indicator" title="Active Account"></span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty_roster">
                                            <i className="fa-solid fa-ghost empty_icon"></i>
                                            <p>{t('no_users')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Panel>
                )}
            </section>
        </section>
    );
}

export default Settings;
