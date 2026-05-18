export async function apiLogin(username, password) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to login');
    }
    return res.json();
}

export async function apiRegister(username, password) {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register');
    }
    return res.json();
}

export async function apiGetUsers() {
    const res = await fetch('/api/users');
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch users');
    }
    return res.json();
}

export async function apiCreateUser(userData) {
    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
}

export async function apiGetPosts(username = "") {
    const url = username ? `/api/posts?username=${encodeURIComponent(username)}` : '/api/posts';
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch posts');
    }
    return res.json();
}

export async function apiCreatePost(postData) {
    const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create post');
    }
    return res.json();
}

/**
 * Fetches the user's favorite posts from the database.
 * 
 * @param {string} username - The username to fetch favorites for
 * @returns {Promise<Array>} Array of Post objects
 */
export async function apiGetFavoritePosts(username) {
    const res = await fetch(`/api/favorites/posts?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch favorite posts');
    }
    return res.json();
}

/**
 * Toggles a post's favorited status for the user.
 * 
 * @param {string} username - The username toggling the favorite
 * @param {string} postId - The ID of the post to toggle
 * @returns {Promise<Object>} Object containing { success, isLiked }
 */
export async function apiToggleFavoritePost(username, postId) {
    const res = await fetch('/api/favorites/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, postId })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to toggle favorite post');
    }
    return res.json();
}

/**
 * Fetches the user's favorite media (games/movies) from the database.
 * 
 * @param {string} username - The username to fetch favorites for
 * @returns {Promise<Array>} Array of FavoriteMedia objects
 */
export async function apiGetFavoriteMedia(username) {
    const res = await fetch(`/api/favorites/media?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch favorite media');
    }
    return res.json();
}

/**
 * Toggles a media item's favorited status for the user.
 * 
 * @param {string} username - The username toggling the favorite
 * @param {Object} media - The media object data
 * @returns {Promise<Object>} Object containing { success, isLiked }
 */
export async function apiToggleFavoriteMedia(username, media) {
    const res = await fetch('/api/favorites/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, media })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to toggle favorite media');
    }
    return res.json();
}

/**
 * Fetches all available downloads.
 * 
 * @returns {Promise<Array>} Array of DownloadItem objects
 */
export async function apiGetDownloads() {
    const res = await fetch('/api/downloads');
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch downloads');
    }
    return res.json();
}

/**
 * Uploads a new file to the downloads board.
 * 
 * @param {Object} downloadData - { username, title, description, base64 }
 * @returns {Promise<Object>} The newly created DownloadItem
 */
export async function apiUploadDownload(downloadData) {
    const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(downloadData)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload file');
    }
    return res.json();
}

/**
 * Updates the user's profile picture, banner, and other settings.
 * 
 * @param {string} currentUsername - The username to update
 * @param {Object} data - { newUsername, pfp, banner, description, email, password, theme, language }
 * @returns {Promise<Object>} The updated user object
 */
export async function apiUpdateUserProfile(currentUsername, data) {
    const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername, ...data })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
    }
    return res.json();
}

/**
 * Fetches all agenda events.
 * 
 * @returns {Promise<Array>} List of events
 */
export async function apiGetAgenda() {
    const res = await fetch('/api/agenda');
    if (!res.ok) throw new Error('Failed to fetch agenda');
    return res.json();
}

/**
 * Creates a new agenda event.
 * 
 * @param {Object} data - { username, title, description, date, time }
 * @returns {Promise<Object>} The created event
 */
export async function apiCreateAgendaEvent(data) {
    const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create event');
    }
    return res.json();
}

/**
 * Fetches all announcements.
 * 
 * @returns {Promise<Array>} List of announcements
 */
export async function apiGetAnnouncements() {
    const res = await fetch('/api/posts?isAnnouncement=true');
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
}

/**
 * Deletes a post.
 */
export async function apiDeletePost(id) {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
}

/**
 * Deletes an agenda event.
 */
export async function apiDeleteAgendaEvent(id) {
    const res = await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete agenda event');
    return res.json();
}

/**
 * Deletes a download item.
 */
export async function apiDeleteDownload(id) {
    const res = await fetch(`/api/downloads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete download');
    return res.json();
}
