import React, { useEffect, useState, useCallback } from 'react';
import RinaChatPanel from '../RinaChat/RinaChatPanel';
import './terminal-shell.css';

export default function TerminalShell({ TerminalView }) {
  const [isRinaOpen, setIsRinaOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);

  // Load layout from main via preload
  useEffect(() => {
    let cancelled = false;

    async function loadLayout() {
      try {
        const layout =
          window.electronAPI && window.electronAPI.getRinaLayout
            ? await window.electronAPI.getRinaLayout()
            : { isOpen: true, sidebarWidth: 360 };

        if (!cancelled) {
          setIsRinaOpen(layout.isOpen ?? true);
          setSidebarWidth(layout.sidebarWidth ?? 360);
        }
      } catch {
        // fallback defaults
      }
    }

    loadLayout();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist layout
  useEffect(() => {
    if (!window.electronAPI || !window.electronAPI.setRinaLayout) return;
    window.electronAPI.setRinaLayout({
      isOpen: isRinaOpen,
      sidebarWidth,
    });
  }, [isRinaOpen, sidebarWidth]);

  // Sidebar toggle (button + keyboard shortcut)
  const toggleRina = useCallback(() => {
    setIsRinaOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    function onKey(e) {
      // Ctrl+\ or Cmd+\ toggles Rina
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        toggleRina();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleRina]);

  // Drag to resize
  useEffect(() => {
    function onMouseMove(e) {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      const clamped = Math.min(Math.max(newWidth, 260), 600);
      setSidebarWidth(clamped);
    }

    function onMouseUp() {
      if (isDragging) setIsDragging(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="ts-shell">
      <div className="ts-header">
        <div className="ts-left">
          <span className="ts-title">RinaWarp Terminal Pro</span>
        </div>
        <div className="ts-right">
          <button
            className={`ts-rina-toggle ${isRinaOpen ? 'active' : ''}`}
            onClick={toggleRina}
            title="Toggle Rina (Ctrl+\\)"
          >
            💖 Rina
          </button>
        </div>
      </div>

      <div className="ts-body">
        <div
          className="ts-main"
          style={{
            marginRight: isRinaOpen ? sidebarWidth : 0,
          }}
        >
          {/*
            TerminalView is your existing terminal component / router root.
            Could be <TerminalView /> or whatever you already render now.
          */}
          <TerminalView />
        </div>

        {/* Splitter + Sidebar */}
        <div
          className={`ts-rina-wrapper ${isRinaOpen ? 'open' : 'closed'}`}
          style={{
            width: isRinaOpen ? sidebarWidth : 0,
          }}
        >
          <div className="ts-splitter" onMouseDown={() => setIsDragging(true)} />
          <div className="ts-rina-panel">
            <RinaChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
