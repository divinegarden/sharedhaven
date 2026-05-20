import { useState, useEffect, useRef } from "react";
import Header from "../../pieces/Header";
import Panel from "../../pieces/Panel";
import { useAuth } from "../../contexts/auth";
import { useConfig } from "../../contexts/config";
import { apiGetDownloads, apiUploadDownload, apiDeleteDownload } from "../../../lib/api";
import "./Downloads.css";

function Downloads() {
    const { user } = useAuth();
    const { t } = useConfig();
    const [downloads, setDownloads] = useState([]);
    
    // Drag & Drop state
    const [isDragging, setIsDragging] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileBase64, setFileBase64] = useState("");
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = async () => {
        try {
            const data = await apiGetDownloads();
            setDownloads(data);
        } catch (err) {
            console.error("Failed to load downloads", err);
        }
    };

    const handleDeleteDownload = (id) => {
        if (!window.confirm(t('confirm_delete') || "Are you sure you want to delete this?")) return;
        
        apiDeleteDownload(id)
        .then(() => {
            setDownloads(prev => prev.filter(d => d.id !== id));
        })
        .catch(err => console.error("Failed to delete download:", err));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            processFile(file);
        }
    };

    const processFile = (file) => {
        // Size check (e.g. 50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            alert(t('file_too_large') || "File is too large! Maximum 50MB.");
            return;
        }

        setFileToUpload(file);
        setTitle(file.name);

        const reader = new FileReader();
        reader.onloadend = () => {
            setFileBase64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const cancelUpload = () => {
        setFileToUpload(null);
        setFileBase64("");
        setTitle("");
        setDescription("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const submitUpload = async (e) => {
        e.preventDefault();
        if (!user) {
            alert(t('login_required') || "You must be logged in to share files.");
            return;
        }
        if (!fileBase64 || !title.trim()) return;

        setIsUploading(true);
        try {
            const newDownload = await apiUploadDownload({
                username: user.name,
                title: title.trim(),
                description: description.trim(),
                base64: fileBase64
            });
            setDownloads([newDownload, ...downloads]);
            cancelUpload();
        } catch (err) {
            console.error("Upload failed", err);
            alert((t('upload_failed') || "Upload failed: ") + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <section className="homepage">
            <Header title={t('downloads') || "Downloads"} icon="fa-solid fa-download" />
            
            <section className="homepage_body downloads_feed">
                
                {/* Upload Panel */}
                <Panel title={t('share_file') || "Share a File"} icon="fa-solid fa-cloud-arrow-up">
                    {!fileToUpload ? (
                        <div 
                            className={`drop_zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <i className="fa-solid fa-file-arrow-up"></i>
                            <p>{isDragging ? (t('drop_here') || "💖 Drop it right here! 💖") : (t('drag_drop_file') || "✨ Drag & drop a cute file here, or click to browse ✨")}</p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                style={{ display: 'none' }} 
                                onChange={handleFileInput}
                            />
                        </div>
                    ) : (
                        <form className="upload_form" onSubmit={submitUpload}>
                            <p className="file_name_display">
                                <i className="fa-solid fa-file"></i> {fileToUpload.name} ({(fileToUpload.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                            
                            <input 
                                type="text" 
                                placeholder={t('file_title') || "File Title (Optional)"}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                            
                            <input 
                                type="text" 
                                placeholder={t('file_description') || "Short Description (Optional)"}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />

                            <div className="upload_actions">
                                <button type="button" className="cancel_btn" onClick={cancelUpload}>
                                    {t('cancel') || "Cancel"}
                                </button>
                                <button type="submit" className="share_btn" disabled={isUploading || !fileBase64}>
                                    {isUploading ? (t('uploading') || "Uploading...") : (t('share') || "Share")}
                                </button>
                            </div>
                        </form>
                    )}
                </Panel>

                {/* Downloads Feed */}
                {downloads.length === 0 ? (
                    <p className="empty_state_text">
                        {t('no_downloads') || "No files have been shared yet."}
                    </p>
                ) : (
                    downloads.map(item => (
                        <div key={item.id} className="download_item panel">
                            <div className="download_info">
                                <h3>{item.title}</h3>
                                {item.description && <p>{item.description}</p>}
                                <span className="download_meta">
                                    {t('uploaded_by') || "Shared by"} @{item.user?.name || "unknown"} • {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                {user?.role === 'ADMIN' && (
                                    <button 
                                        className="delete_btn"
                                        onClick={() => handleDeleteDownload(item.id)}
                                        title={t('delete') || "Delete"}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', marginTop: '10px' }}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                )}
                            </div>
                            <a href={item.fileUrl} download={item.title} className="download_btn">
                                <i className="fa-solid fa-download"></i> {t('download') || "Download"}
                            </a>
                        </div>
                    ))
                )}
            </section>
        </section>
    );
}

export default Downloads;
