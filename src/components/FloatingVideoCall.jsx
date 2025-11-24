import { useEffect, useState } from "react";

export default function FloatingVideoCall({ roomUrl, onClose }) {
  const [pos, setPos] = useState({ x: 24, y: 80 }); // стартовая позиция
  const [size, setSize] = useState({ width: 480, height: 270 }); // стартовый размер
  const [drag, setDrag] = useState(null);    // {startX, startY, origX, origY}
  const [resize, setResize] = useState(null); // {startX, startY, origW, origH}

  // обработка мыши для drag / resize
  useEffect(() => {
    function onMouseMove(e) {
      if (drag) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        setPos({
          x: drag.origX + dx,
          y: drag.origY + dy,
        });
      } else if (resize) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;
        setSize({
          width: Math.max(320, resize.origW + dx),
          height: Math.max(180, resize.origH + dy),
        });
      }
    }

    function onMouseUp() {
      if (drag) setDrag(null);
      if (resize) setResize(null);
    }

    if (drag || resize) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drag, resize]);

  if (!roomUrl) return null;

  return (
    <div
      className="floating-call"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height + 32, // + высота заголовка
        zIndex: 9999,
        background: "#000",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* верхняя панель — за неё двигаем окно */}
      <div
        className="floating-call-header"
        style={{
          height: 32,
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          cursor: drag ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={(e) => {
          setDrag({
            startX: e.clientX,
            startY: e.clientY,
            origX: pos.x,
            origY: pos.y,
          });
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.9 }}>
          Видеозвонок (перетащи за панель)
        </span>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* сам Jitsi-iframe */}
      <div style={{ flex: 1 }}>
        <iframe
          src={roomUrl}
          title="Skill2Skill Video Call"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>

      {/* уголок для изменения размера */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          setResize({
            startX: e.clientX,
            startY: e.clientY,
            origW: size.width,
            origH: size.height,
          });
        }}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 18,
          height: 18,
          cursor: "nwse-resize",
          background:
            "linear-gradient(135deg, transparent 0, transparent 40%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.7) 100%)",
        }}
      />
    </div>
  );
}
