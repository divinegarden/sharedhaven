import { NavLink } from "react-router";
import "./pieceStyles/Header.css";

function Header({ title, icon }) {
    return (
        <header>
            <p><i className={icon}></i> {title}</p>
            <NavLink to="/announcements">
                <i className="fa-solid fa-bullhorn"></i>
            </NavLink>
        </header>
    )
}

export default Header;