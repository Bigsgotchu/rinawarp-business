import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import { usePty } from '../hooks/usePty';

type Props = {
  cwd?: string;
  shell?: string;
};

export const TerminalView: React.FC<Props> = ({ cwd, shell }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal>();
  const fitRef = useRef<FitAddon>();
  const { id, terminal, fit } = usePty(containerRef, { id: undefined });

  useEffect(() => {
    if (!containerRef.current || termRef.current) return;

    termRef.current = terminal!;
    fitRef.current = fit!;

    // Add additional xterm addons
    termRef.current.loadAddon(new WebLinksAddon());
    termRef.current.loadAddon(new SearchAddon());

    // Handle keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to clear terminal
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        termRef.current?.clear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [terminal, fit]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
