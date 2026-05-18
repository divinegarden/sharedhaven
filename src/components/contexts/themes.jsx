import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { apiUpdateUserProfile } from "../../lib/api";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    
    const [theme, setTheme] = useState(() => {
        return user?.theme || localStorage.getItem('theme') || 'default';
    });
    const themes = ['default', 'dark', 'rave', 'strawberry', 'sunset', 'matcha', 'twilight', 'macchiato', 'synthwave', 'sakura', 'nord', 'honey', 'cyberpunk', 'rose', 'oceanic', 'amethyst', 'lavender', 'cottagecore', 'pixie', 'mocha', 'vintage'];

    // Update local state when user logs in with a saved theme
    useEffect(() => {
        if (user && user.theme && user.theme !== theme) {
            setTheme(user.theme);
        }
    }, [user?.theme]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.className = theme === 'default' ? '' : theme;
    }, [theme]);

    const changeTheme = async (newTheme) => {
        setTheme(newTheme);
        if (user) {
            updateUser({ theme: newTheme });
            try {
                await apiUpdateUserProfile(user.name, { theme: newTheme });
            } catch (e) {
                console.error("Failed to save theme to DB", e);
            }
        }
    };

    const nextTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        changeTheme(themes[nextIndex]);
    };

    const prevTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const prevIndex = (currentIndex - 1 + themes.length) % themes.length;
        changeTheme(themes[prevIndex]);
    };

    return (
        <ThemeContext.Provider value={{
            theme, setTheme: changeTheme, nextTheme, prevTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
