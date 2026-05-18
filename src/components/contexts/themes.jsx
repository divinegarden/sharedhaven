import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');
    const themes = ['default', 'dark', 'rave', 'strawberry', 'sunset', 'matcha', 'twilight', 'macchiato', 'synthwave', 'sakura', 'nord', 'honey', 'cyberpunk', 'rose', 'oceanic', 'amethyst', 'lavender', 'cottagecore', 'pixie', 'mocha', 'vintage'];

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.className = theme === 'default' ? '' : theme;
    }, [theme]);

    const nextTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const prevTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const prevIndex = (currentIndex - 1 + themes.length) % themes.length;
        setTheme(themes[prevIndex]);
    };

    return (
        <ThemeContext.Provider value={{
            theme, setTheme, nextTheme, prevTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
