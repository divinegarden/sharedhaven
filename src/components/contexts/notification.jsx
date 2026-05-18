import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

/**
 * NotificationProvider Component
 * Provides a global notification system for the application.
 * Renders the notification message at the top right of the screen.
 */
export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        // Auto-clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div className={`status_notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};
