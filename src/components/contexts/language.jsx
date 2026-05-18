import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { apiUpdateUserProfile } from "../../lib/api";

const LanguageContext = createContext();

const translations = {
    Español: {
        welcome: "Bienvenido",
        agenda: "Agenda",
        media: "Media",
        downloads: "Descargas",
        profile: "Perfil",
        home: "Inicio",
        favorites: "Favoritos",
        settings: "Configuración",
        logout: "Cerrar sesión",
        change_user: "Cambiar usuario",
        change_email: "Cambiar correo",
        change_pass: "Cambiar contraseña",
        site_settings: "Configuración del sitio",
        user_settings: "Configuración de @",
        change_theme: "Cambiar tema",
        change_lang: "Cambiar idioma",
        cancel: "Cancelar",
        save: "Guardar",
        change: "Cambiar",
        no_email: "Sin correo asociado",
        announcements: "Anuncios",
        make_announcement: "Crear Anuncio",
        confirm_delete: "¿Estás seguro de que quieres eliminar esto?",
        back: "Volver",
        description: "Descripción del usuario...",
        my_profile: "Mi perfil",
        game: "Juego",
        movie: "Película",
        today_recommendation: "Recomendación de hoy",
        what_people_think: "¿Qué piensa la gente de hoy?",
        credits: "Créditos",
        credits_title: "💖 Créditos de Shared Haven 💖",
        credits_desc: "Shared Haven fue creado con mucho amor para que lo disfrutes con tus amigos. ¡Gracias por visitarnos!",
        close: "Cerrar",
        platform: "Plataforma:",
        sort_by: "Ordenar por:",
        loading_games: "Cargando juegos...",
        share_thoughts: "¿Qué estás pensando?",
        write_new_post: "Escribe un nuevo post...",
        add_image_url: "Añadir URL de Imagen",
        optional_image_url: "URL de imagen opcional...",
        publish: "Publicar",
        no_posts: "No hay publicaciones aún.",
        loading_profile: "Cargando perfil...",
        user_profile: "Perfil de Usuario",
        user_not_found: "Usuario No Encontrado",
        profile_not_exist: "El perfil de usuario solicitado no existe.",
        return_home: "Volver al Inicio",
        users_profile: "Perfil de @",
        users_posts: "Publicaciones de ",
        role_user: "USER (Cuenta Estándar)",
        role_admin: "ADMIN (Gestor de BD)",
        user_pass_required: "Nombre de usuario y Contraseña son obligatorios",
        account_created: "¡Cuenta creada correctamente!",
        username_updated: "¡Nombre de usuario actualizado!",
        email_updated: "¡Correo electrónico actualizado!",
        password_updated: "¡Contraseña actualizada correctamente!",
        images_updated: "¡Imágenes de perfil actualizadas!",
        profile_picture: "Foto de Perfil:",
        image_loaded: "Imagen cargada",
        upload_file: "O sube un archivo:",
        file_selected: "Archivo seleccionado",
        choose_file: "Elegir archivo",
        new_field: "Nuevo ",
        admin_settings: "Panel de Administración",
        register_account: "Registrar Nueva Cuenta",
        username: "Usuario",
        enter_username: "Nombre de usuario...",
        password: "Contraseña",
        choose_password: "Contraseña...",
        avatar_url_optional: "URL de Avatar (Opcional)",
        system_role: "Rol de Permisos",
        register_db_account: "Registrar Cuenta en BD",
        db_user_roster: "Cuentas en Base de Datos",
        no_users: "No hay usuarios registrados aún.",
        favorite_posts: "Posts Favoritos",
        no_favorite_posts: "¡Aún no tienes posts favoritos! Ve al inicio para dar me gusta a algunas publicaciones.",
        remove_favorite: "Quitar de favoritos",
        favorite_media: "Medios Favoritos",
        no_favorite_media: "No hay medios favoritos aún.",
        unlike: "Quitar favorito",
        like: "Favorito",
        post1_text: "¡Hola a todos! Acabo de terminar de diseñar el nuevo banner del sitio. ¿Qué les parece? ¡Espero que les encanten los nuevos colores de otoño! 🎨🍂☕",
        post1_date: "Hace 2 horas",
        post2_text: "Pasando la tarde de lluvia con mi juego favorito y un buen chocolate caliente. ¡La mejor combinación del mundo! 🎮✨🍫",
        post2_date: "Hace 5 horas",
        post3_text: "He estado organizando la agenda comunitaria para esta semana. ¡No se olviden de revisar los próximos eventos en la sección de Agenda! Tenemos tardes de cine y torneos de juegos planeados. 📅🏡💻",
        post3_date: "Ayer",
        post4_text: "Una foto que tomé esta mañana durante mi caminata diaria. ¡El aire fresco y la tranquilidad de la naturaleza son increíbles para empezar el día con buena energía! 🌲☀️🦋",
        post4_date: "Hace 2 días",
        share_file: "Subir archivo",
        drop_here: "💖 ¡Suéltalo aquí! 💖",
        drag_drop_file: "✨ Arrastra y suelta un archivo aquí, o haz clic para buscar ✨",
        file_title: "Título del archivo (Opcional)",
        file_description: "Breve descripción (Opcional)",
        uploading: "Subiendo...",
        share: "Compartir",
        no_downloads: "Aún no se han compartido archivos.",
        uploaded_by: "Compartido por",
        download: "Descargar",
        file_too_large: "¡El archivo es demasiado grande! Máximo 50MB.",
        login_required: "Debes iniciar sesión para compartir archivos.",
        upload_failed: "Error al subir: ",
        add_event: "Añadir Evento",
        event_title: "Título del evento",
        event_description: "Descripción (opcional)",
        no_events: "No hay eventos programados.",
        loading: "Cargando...",
        banner: "Banner:",
        change_images: "Cambiar imágenes",
        select_role: "Seleccionar Rol",
        change_description: "Cambiar descripción",
        no_description: "Sin descripción",
        description_updated: "¡Descripción actualizada!"
    },
    English: {
        welcome: "Welcome",
        agenda: "Agenda",
        media: "Media",
        downloads: "Downloads",
        profile: "Profile",
        home: "Home",
        favorites: "Favorites",
        settings: "Settings",
        logout: "Logout",
        change_user: "Change user",
        change_email: "Change email",
        change_pass: "Change password",
        site_settings: "Site Settings",
        user_settings: "Settings for @",
        change_theme: "Change Theme",
        change_lang: "Change Language",
        cancel: "Cancel",
        save: "Save",
        change: "Change",
        no_email: "No email associated",
        announcements: "Announcements",
        make_announcement: "Make Announcement",
        confirm_delete: "Are you sure you want to delete this?",
        back: "Back",
        description: "User description...",
        my_profile: "My profile",
        game: "Game",
        movie: "Movie",
        today_recommendation: "Recommendation of today",
        what_people_think: "What do people think today?",
        credits: "Credits",
        credits_title: "💖 Shared Haven Credits 💖",
        credits_desc: "Shared Haven was created with lots of love for people to enjoy with your friends. Thank you for visiting us!",
        close: "Close",
        platform: "Platform:",
        sort_by: "Sort by:",
        loading_games: "Loading games...",
        share_thoughts: "Share your thoughts!",
        write_new_post: "Write a new post...",
        add_image_url: "Add Image URL",
        optional_image_url: "Optional image URL...",
        publish: "Publish",
        no_posts: "No posts published yet.",
        loading_profile: "Loading profile...",
        user_profile: "User Profile",
        user_not_found: "User Not Found",
        profile_not_exist: "The requested user profile does not exist.",
        return_home: "Return Home",
        users_profile: "Profile of @",
        users_posts: "Posts by ",
        role_user: "USER (Standard Account)",
        role_admin: "ADMIN (Database Manager)",
        user_pass_required: "Username and Password are required",
        account_created: "Account created successfully!",
        username_updated: "Username updated!",
        email_updated: "Email updated!",
        password_updated: "Password updated!",
        images_updated: "Images updated!",
        profile_picture: "Profile Picture:",
        image_loaded: "Image loaded",
        upload_file: "Or upload a file:",
        file_selected: "File selected",
        choose_file: "Choose file",
        new_field: "New ",
        admin_settings: "Admin Settings",
        register_account: "Register New Account",
        username: "Username",
        enter_username: "Enter username...",
        password: "Password",
        choose_password: "Choose password...",
        avatar_url_optional: "Avatar Image URL (Optional)",
        system_role: "System Permission Role",
        register_db_account: "Register Database Account",
        db_user_roster: "Database User Roster",
        no_users: "No users registered yet.",
        favorite_posts: "Favorite Posts",
        no_favorite_posts: "You don't have any favorite posts yet! Go to the home page to start liking posts.",
        remove_favorite: "Remove favorite",
        favorite_media: "Favorite Media",
        no_favorite_media: "No favorite media yet.",
        unlike: "Unlike",
        like: "Like",
        post1_text: "Hello everyone! Just finished designing the new autumn theme. What do you think? Hope you love these warm colors! 🎨🍂☕",
        post1_date: "2 hours ago",
        post2_text: "Spending this rainy afternoon playing my favorite game with a hot mug of chocolate. Best combination ever! 🎮✨🍫",
        post2_date: "5 hours ago",
        post3_text: "Working on the community agenda for this week. Remember to check out the upcoming events! Movie nights and game tournaments are coming! 📅🏡💻",
        post3_date: "Yesterday",
        post4_text: "A photo I took this morning during my daily walk. The crisp air and tranquility of nature is the perfect energy boost! 🌲☀️🦋",
        post4_date: "2 days ago",
        share_file: "Upload file",
        drop_here: "💖 Drop it right here! 💖",
        drag_drop_file: "✨ Drag & drop a file here, or click to browse ✨",
        file_title: "File Title (Optional)",
        file_description: "Short Description (Optional)",
        uploading: "Uploading...",
        share: "Share",
        no_downloads: "No files have been shared yet.",
        uploaded_by: "Shared by",
        download: "Download",
        file_too_large: "File is too large! Maximum 50MB.",
        login_required: "You must be logged in to share files.",
        upload_failed: "Upload failed: ",
        add_event: "Add Event",
        event_title: "Event Title",
        event_description: "Description (Optional)",
        no_events: "No events scheduled.",
        loading: "Loading...",
        banner: "Banner:",
        change_images: "Change images",
        select_role: "Select Role",
        change_description: "Change description",
        no_description: "No description",
        description_updated: "Description updated!"
    }
};

export const LanguageProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    
    const [language, setLanguage] = useState(() => {
        return user?.language || localStorage.getItem('language') || 'Español';
    });
    const languages = ['Español', 'English'];

    // Update local state when user logs in with a saved language
    useEffect(() => {
        if (user && user.language && user.language !== language) {
            setLanguage(user.language);
        }
    }, [user?.language]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const changeLanguage = async (newLanguage) => {
        setLanguage(newLanguage);
        if (user) {
            updateUser({ language: newLanguage });
            try {
                await apiUpdateUserProfile(user.name, { language: newLanguage });
            } catch (e) {
                console.error("Failed to save language to DB", e);
            }
        }
    };

    const nextLanguage = () => {
        const currentIndex = languages.indexOf(language);
        const nextIndex = (currentIndex + 1) % languages.length;
        changeLanguage(languages[nextIndex]);
    };

    const prevLanguage = () => {
        const currentIndex = languages.indexOf(language);
        const prevIndex = (currentIndex - 1 + languages.length) % languages.length;
        changeLanguage(languages[prevIndex]);
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{
            language, setLanguage: changeLanguage, nextLanguage, prevLanguage, t
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
