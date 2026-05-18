import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../contexts/auth";
import { useConfig } from "../contexts/config";
import { apiGetUsers } from "../../lib/api";
import "./pieceStyles/Sidebar.css";

function Sidebar({ isOpen }) {
    const { user } = useAuth();
    const { t } = useConfig();

    const [showUsers, setShowUsers] = useState(false);
    const [registeredUsers, setRegisteredUsers] = useState([]);

    // Fetch registered users from Postgres database whenever the user toggles the Sidebar View
    useEffect(() => {
        if (showUsers) {
            apiGetUsers()
                .then(data => {
                    if (Array.isArray(data)) {
                        setRegisteredUsers(data);
                    }
                })
                .catch(err => console.error("Error fetching db users:", err));
        }
    }, [showUsers]);

    // Filter out the active user session so they don't get duplicated in the list
    const otherUsers = registeredUsers.filter(u => u.name !== user?.name);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

            <h2>{t('welcome')}, @{user?.name || "usuario"}</h2>

            {!showUsers ? (
                <>
                    {/* Default View */}
                    <img 
                        src={user?.pfp || "/tempuser/temporary_pfp.png"} 
                        alt="User" 
                        className="pfp" 
                    />

                    <div className="pages">
                        <NavLink to="/agenda"><i className="fa-solid fa-calendar"></i> <span>{t('agenda')}</span></NavLink>
                        <NavLink to="/media"><i className="fa-solid fa-circle-play"></i> <span>{t('media')}</span></NavLink>
                        <NavLink to="/downloads"><i className="fa-solid fa-download"></i> <span>{t('downloads')}</span></NavLink>
                    </div>
                </>
            ) : (
                /* Registered Users View */
                <div className="online">
                    <div className="users">
                        {otherUsers.length > 0 ? (
                            otherUsers.map((u, i) => (
                                <NavLink to={`/profile/${u.name}`} className="user sidebar_user_link" key={i}>
                                    <img 
                                        src={u.image || "/tempuser/temporary_pfp.png"} 
                                        alt={u.name} 
                                    />
                                    <p>@{u.name}</p>
                                </NavLink>
                            ))
                        ) : (
                            <p className="sidebar_no_users">
                                No other users registered
                            </p>
                        )}
                    </div>

                    <hr />

                    {/* Current User Session separated from rest */}
                    <NavLink to="/profile" className="user current_session sidebar_user_link">
                        <img 
                            src={user?.pfp || "/tempuser/temporary_pfp.png"} 
                            alt={user?.name} 
                        />
                        <p>@{user?.name || "usuario"} ({t('profile')})</p>
                    </NavLink>
                </div>
            )}

            <div className="social">
                <NavLink 
                    to="/profile" 
                    title={t('profile')}
                    onClick={(e) => {
                        e.preventDefault();
                        setShowUsers(true);
                    }}
                    className={showUsers ? "active" : ""}
                >
                    <i className="fa-solid fa-user"></i>
                </NavLink>
                <NavLink 
                    to="/home" 
                    title={t('home')}
                    onClick={() => setShowUsers(false)}
                >
                    <i className="fa-solid fa-house"></i>
                </NavLink>
                <NavLink 
                    to="/favposts" 
                    title={t('favorites')}
                    onClick={() => setShowUsers(false)}
                >
                    <i className="fa-solid fa-heart"></i>
                </NavLink>
                <NavLink 
                    to="/favmedia" 
                    title={t('favorites')}
                    onClick={() => setShowUsers(false)}
                >
                    <i className="fa-solid fa-star"></i>
                </NavLink>
            </div>

        </aside>
    );
}

export default Sidebar;