import "./pieceStyles/Panel.css";

function Panel({ title, icon, image, children, className = "" }) {
    return (
        <article className={`panel ${className}`}>
            <div className="panel_header">
                <div className="info">
                    {image ? (
                        <img src={image} alt={title} />
                    ) : (
                        icon && <i className={icon}></i>
                    )}
                    <p>{title}</p>
                </div>
            </div>
            <div className="panel_body">
                {children}
            </div>
        </article>
    );
}

export default Panel;