import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { apiGetFavoritePosts, apiToggleFavoritePost, apiGetFavoriteMedia, apiToggleFavoriteMedia } from '../../lib/api';

/**
 * Context to manage user's database-backed favorite posts and media.
 */
const FavoritesContext = createContext();

/**
 * Provides state and functions to interact with user favorites.
 * Automatically synchronizes with the PostgreSQL database.
 * 
 * @param {Object} props - React props
 * @param {React.ReactNode} props.children - Child components
 */
export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [likedPosts, setLikedPosts] = useState([]);
    const [likedMedia, setLikedMedia] = useState([]);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setLikedPosts([]);
            setLikedMedia([]);
        }
    }, [user]);

    /**
     * Loads the user's favorite posts and media from the database.
     */
    const loadFavorites = async () => {
        if (!user) return;
        try {
            const posts = await apiGetFavoritePosts(user.name);
            setLikedPosts(posts);
            const media = await apiGetFavoriteMedia(user.name);
            setLikedMedia(media);
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    };

    /**
     * Toggles the like status of a specific post.
     * Updates the database relation and refreshes the local state.
     * 
     * @param {string} postId - The ID of the post to toggle
     */
    const togglePostLike = async (postId) => {
        if (!user) return;
        try {
            const res = await apiToggleFavoritePost(user.name, postId);
            if (res.success) {
                loadFavorites();
            }
        } catch (e) {
            console.error("Failed to toggle post like", e);
        }
    };

    /**
     * Toggles the starred status of a media item (game/movie).
     * Creates or deletes a FavoriteMedia record in the database.
     * 
     * @param {Object} mediaData - The data of the media to star/unstar
     * @param {string} mediaData.id - External identifier of the media
     * @param {string} mediaData.type - "game" or "movie"
     * @param {string} [mediaData.title] - Title of the media
     * @param {string} [mediaData.image] - Thumbnail URL
     * @param {string} [mediaData.developer] - Developer or publisher
     * @param {string} [mediaData.genre] - Primary genre
     */
    const toggleMediaStar = async (mediaData) => {
        if (!user) return;
        try {
            const res = await apiToggleFavoriteMedia(user.name, mediaData);
            if (res.success) {
                loadFavorites();
            }
        } catch (e) {
            console.error("Failed to toggle media star", e);
        }
    };

    return (
        <FavoritesContext.Provider value={{ likedPosts, likedMedia, togglePostLike, toggleMediaStar }}>
            {children}
        </FavoritesContext.Provider>
    );
};

/**
 * Custom hook to access the FavoritesContext.
 * Returns { likedPosts, likedMedia, togglePostLike, toggleMediaStar }
 */
export const useFavorites = () => useContext(FavoritesContext);
