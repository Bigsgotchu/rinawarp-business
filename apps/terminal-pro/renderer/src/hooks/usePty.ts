import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import 'xterm/css/xterm.css';

export function usePty(containerRef: React.RefObject<HTMLDivElement>, opts?: { id?: string }) {
  const idRef = useRef(opts?.id ?? crypto.randomUUID());
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initialize terminal with enhanced options
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, Menlo, monospace',
    });

    // Load addons for unicode width and fit
    const unicodeAddon = new Unicode11Addon();
    const fitAddon = new FitAddon();

    term.loadAddon(unicodeAddon);
    term.loadAddon(fitAddon);

    term.open(el);
    fitAddon.fit();

    termRef.current = term;
    fitRef.current = fitAddon;

    window.terminal.spawn({ id: idRef.current, cols: term.cols, rows: term.rows });

    const disposeData = window.terminal.onData(({ id, data }) => {
      if (id === idRef.current) term.write(data);
    });

    const onKey = term.onData((data) => {
      window.terminal.write({ id: idRef.current, data });
    });

    // Enhanced resize with fit addon for precise cols/rows computation
    const onResize = () => {
      fitAddon.fit();
      const cols = term.cols,
        rows = term.rows;
      window.terminal.resize({ id: idRef.current, cols, rows });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    const disposeExit = window.terminal.onExit(({ id }) => {
      if (id === idRef.current) term.writeln('\r\n\x1b[31m[session ended]\x1b[0m');
    });

    return () => {
      onKey.dispose();
      disposeData();
      disposeExit();
      ro.disconnect();
      window.terminal.kill({ id: idRef.current });
      term.dispose();
    };
  }, [containerRef]);

  return { id: idRef.current, terminal: termRef.current, fit: fitRef.current };
}
