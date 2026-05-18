import { ThemeProvider, useTheme } from "./themes";
import { LanguageProvider, useLanguage } from "./language";
import { FavoritesProvider, useFavorites } from "./favorites";
import { NotificationProvider, useNotification } from "./notification";

/**
 * ConfigProvider Component
 * Wrapper provider that combines Theme, Language, Favorites, and Notification providers.
 */
export const ConfigProvider = ({ children }) => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <FavoritesProvider>
                    {children}
                </FavoritesProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

/**
 * Custom hook to access all config contexts at once.
 */
export const useConfig = () => {
    const themeContext = useTheme();
    const languageContext = useLanguage();
    const favoritesContext = useFavorites();
    const notificationContext = useNotification();
    
    return {
        ...themeContext,
        ...languageContext,
        ...favoritesContext,
        ...notificationContext
    };
};

export { useTheme, useLanguage, useFavorites, useNotification };
