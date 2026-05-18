import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";
import { apiGetAgenda, apiCreateAgendaEvent, apiDeleteAgendaEvent } from "../../../lib/api";
import "./Agenda.css";

function Agenda() {
    const { user } = useAuth();
    const { t } = useConfig();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        apiGetAgenda()
            .then(data => setEvents(data))
            .catch(err => console.error("Failed to fetch agenda:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !date) return;

        apiCreateAgendaEvent({
            username: user.name,
            title,
            description,
            date,
            time
        })
        .then(newEvent => {
            setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
            setTitle("");
            setDescription("");
            setDate("");
            setTime("");
        })
        .catch(err => console.error("Failed to create event:", err));
    };

    const handleDeleteEvent = (id) => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this?")) return;
        
        apiDeleteAgendaEvent(id)
        .then(() => {
            setEvents(prev => prev.filter(e => e.id !== id));
        })
        .catch(err => console.error("Failed to delete event:", err));
    };

    return (
        <section className="homepage">
            <Header title={t('agenda')} icon="fa-solid fa-calendar" />
            
            <section className="homepage_body">
                <div className="agenda_container">
                    
                    {/* Create Event Form */}
                    <Panel title={t('add_event') || "Añadir Evento"} icon="fa-solid fa-plus">
                        <form onSubmit={handleSubmit} className="create_event_form">
                            <input 
                                type="text" 
                                placeholder={t('event_title') || "Título del evento"}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea 
                                placeholder={t('event_description') || "Descripción (opcional)"}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="form_row">
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                                <input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                            <button type="submit">{t('publish') || "Publicar"}</button>
                        </form>
                    </Panel>

                    {/* Events List */}
                    <div className="agenda_list">
                        {loading && <p>{t('loading') || "Cargando..."}</p>}
                        {!loading && events.length === 0 && (
                            <p>{t('no_events') || "No hay eventos programados."}</p>
                        )}
                        {!loading && events.map(event => (
                            <div key={event.id} className="event_card">
                                <div className="event_info">
                                    <h3>{event.title}</h3>
                                    {event.description && <p>{event.description}</p>}
                                    <div className="event_creator">
                                        <img src={event.user?.image || "/tempuser/temporary_pfp.png"} alt={event.user?.name} />
                                        <span>@{event.user?.name}</span>
                                    </div>
                                </div>
                                <div className="event_date_time">
                                    <span className="date">{event.date}</span>
                                    {event.time && <span className="time">{event.time}</span>}
                                    {user?.role === 'ADMIN' && (
                                        <button 
                                            className="delete_btn"
                                            onClick={() => handleDeleteEvent(event.id)}
                                            title={t('delete') || "Delete"}
                                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginTop: '10px' }}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </section>
    );
}

export default Agenda;
