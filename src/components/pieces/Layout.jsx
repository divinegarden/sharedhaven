import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import "./pieceStyles/Layout.css";

function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <main className="home">
            <button className="hamburger_btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <i className="fa-solid fa-bars"></i>
            </button>
            <Sidebar isOpen={isSidebarOpen} />
            <div className="content_area" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
                <Outlet />
            </div>
        </main>
    );
}

export default Layout;
