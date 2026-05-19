import { useRef, useEffect, useState, useCallback } from "react";
import "./pieceStyles/ImageCropper.css";

/**
 * ImageCropper
 * A canvas-based interactive image cropper.
 *
 * Props:
 *   src      - base64 or URL of the source image
 *   aspectW  - width part of the crop aspect ratio (e.g. 1 for pfp, 5 for banner)
 *   aspectH  - height part of the crop aspect ratio (e.g. 1 for pfp, 1 for banner)
 *   outputW  - output canvas width in pixels
 *   outputH  - output canvas height in pixels
 *   label    - title shown in the cropper header
 *   onCrop   - callback(base64String) when the user confirms
 *   onCancel - callback() when the user cancels
 */
function ImageCropper({ src, aspectW, aspectH, outputW, outputH, label, onCrop, onCancel }) {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    const [imgError, setImgError] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [minZoom, setMinZoom] = useState(0.1);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const offsetRef = useRef({ x: 0, y: 0 });

    // Canvas display dimensions
    const CANVAS_W = 580;
    const CANVAS_H = 380;

    // Crop window dimensions inside the canvas (80% of canvas, capped to canvas height)
    const maxCropW = CANVAS_W * 0.85;
    const maxCropH = CANVAS_H * 0.8;
    const cropByW = { w: maxCropW, h: maxCropW * (aspectH / aspectW) };
    const cropByH = { h: maxCropH, w: maxCropH * (aspectW / aspectH) };
    const useByW = cropByW.h <= maxCropH;
    const CROP_W = useByW ? cropByW.w : cropByH.w;
    const CROP_H = useByW ? cropByW.h : cropByH.h;
    const CROP_LEFT = (CANVAS_W - CROP_W) / 2;
    const CROP_TOP = (CANVAS_H - CROP_H) / 2;

    // Load image and set initial position / zoom to cover the crop area
    useEffect(() => {
        setImgError(false);
        setImgLoaded(false);
        const img = new Image();
        // Required for cross-origin URLs to be usable on canvas
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imgRef.current = img;
            const scaleX = CROP_W / img.naturalWidth;
            const scaleY = CROP_H / img.naturalHeight;
            const initZoom = Math.max(scaleX, scaleY);
            const scaledW = img.naturalWidth * initZoom;
            const scaledH = img.naturalHeight * initZoom;
            const initOffset = {
                x: CROP_LEFT + (CROP_W - scaledW) / 2,
                y: CROP_TOP + (CROP_H - scaledH) / 2,
            };
            setMinZoom(initZoom);
            setZoom(initZoom);
            setOffset(initOffset);
            offsetRef.current = initOffset;
            setImgLoaded(true);
        };
        img.onerror = () => setImgError(true);
        img.src = src;
    }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

    // Redraw canvas whenever offset or zoom changes
    useEffect(() => {
        if (!imgLoaded || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;

        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Draw image
        const imgW = img.naturalWidth * zoom;
        const imgH = img.naturalHeight * zoom;
        ctx.drawImage(img, offset.x, offset.y, imgW, imgH);

        // Darken areas outside the crop window
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, CANVAS_W, CROP_TOP);
        ctx.fillRect(0, CROP_TOP + CROP_H, CANVAS_W, CANVAS_H - CROP_TOP - CROP_H);
        ctx.fillRect(0, CROP_TOP, CROP_LEFT, CROP_H);
        ctx.fillRect(CROP_LEFT + CROP_W, CROP_TOP, CANVAS_W - CROP_LEFT - CROP_W, CROP_H);

        // Crop border
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(CROP_LEFT, CROP_TOP, CROP_W, CROP_H);

        // Rule of thirds grid lines
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(CROP_LEFT + (CROP_W / 3) * i, CROP_TOP);
            ctx.lineTo(CROP_LEFT + (CROP_W / 3) * i, CROP_TOP + CROP_H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(CROP_LEFT, CROP_TOP + (CROP_H / 3) * i);
            ctx.lineTo(CROP_LEFT + CROP_W, CROP_TOP + (CROP_H / 3) * i);
            ctx.stroke();
        }

        // Corner handles
        const handleSize = 12;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = 3;
        const corners = [
            [CROP_LEFT, CROP_TOP, 1, 1],
            [CROP_LEFT + CROP_W, CROP_TOP, -1, 1],
            [CROP_LEFT, CROP_TOP + CROP_H, 1, -1],
            [CROP_LEFT + CROP_W, CROP_TOP + CROP_H, -1, -1],
        ];
        corners.forEach(([cx, cy, dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(cx, cy + dy * handleSize);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx + dx * handleSize, cy);
            ctx.stroke();
        });
    }, [imgLoaded, offset, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Mouse events ---
    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - offsetRef.current.x,
            y: e.clientY - offsetRef.current.y,
        };
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const newOffset = {
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
        };
        offsetRef.current = newOffset;
        setOffset(newOffset);
    }, [isDragging]);

    const handleMouseUp = () => setIsDragging(false);

    // --- Scroll to zoom ---
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.93;
        setZoom(prev => Math.max(minZoom, Math.min(prev * factor, minZoom * 6)));
    }, [minZoom]);

    // Attach wheel as non-passive to allow preventDefault
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, [handleWheel]);

    // --- Touch events ---
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            dragStartRef.current = {
                x: e.touches[0].clientX - offsetRef.current.x,
                y: e.touches[0].clientY - offsetRef.current.y,
            };
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            const newOffset = {
                x: e.touches[0].clientX - dragStartRef.current.x,
                y: e.touches[0].clientY - dragStartRef.current.y,
            };
            offsetRef.current = newOffset;
            setOffset(newOffset);
        }
    };

    const handleTouchEnd = () => setIsDragging(false);

    // --- Crop and output ---
    const handleCrop = () => {
        const img = imgRef.current;
        if (!img) return;

        const offscreen = document.createElement("canvas");
        offscreen.width = outputW;
        offscreen.height = outputH;
        const ctx = offscreen.getContext("2d");

        // Map the visible crop window back to source image coordinates
        const srcX = (CROP_LEFT - offset.x) / zoom;
        const srcY = (CROP_TOP - offset.y) / zoom;
        const srcW = CROP_W / zoom;
        const srcH = CROP_H / zoom;

        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);
        onCrop(offscreen.toDataURL("image/jpeg", 0.92));
    };

    return (
        <div className="cropper_overlay" onClick={onCancel}>
            <div className="cropper_modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="cropper_title">
                    <i className="fa-solid fa-crop-simple"></i>
                    {label}
                </h3>
                <p className="cropper_hint">
                    <i className="fa-solid fa-hand"></i> Drag to reposition &nbsp;·&nbsp;
                    <i className="fa-solid fa-magnifying-glass-plus"></i> Scroll to zoom
                </p>

                {imgError ? (
                    <div className="cropper_error">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <p>This image can't be cropped from a URL.</p>
                        <p className="cropper_error_sub">The image host doesn't allow cross-origin access.<br />Try downloading the image and uploading it as a file instead.</p>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_W}
                        height={CANVAS_H}
                        className={`cropper_canvas${isDragging ? " dragging" : ""}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                )}

                <div className="cropper_zoom_row">
                    <i className="fa-solid fa-magnifying-glass-minus cropper_zoom_icon"></i>
                    <input
                        type="range"
                        className="cropper_zoom_slider"
                        min={Math.round(minZoom * 100)}
                        max={Math.round(minZoom * 600)}
                        value={Math.round(zoom * 100)}
                        onChange={(e) => setZoom(Number(e.target.value) / 100)}
                    />
                    <i className="fa-solid fa-magnifying-glass-plus cropper_zoom_icon"></i>
                </div>

                <div className="cropper_actions">
                    <button className="cropper_cancel_btn" onClick={onCancel}>
                        <i className="fa-solid fa-xmark"></i> Cancel
                    </button>
                    <button className="cropper_apply_btn" onClick={handleCrop}>
                        <i className="fa-solid fa-check"></i> Crop & Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropper;
