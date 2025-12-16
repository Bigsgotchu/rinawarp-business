import './terminal-pro-section.css';

export function TerminalProSection() {
  return (
    <section className="tp-hero">
      <div className="tp-hero-left">
        <h1>RinaWarp Terminal Pro</h1>
        <p className="tp-subtitle">
          An AI-enhanced terminal that thinks like a senior engineer sitting next to you.
        </p>

        <ul className="tp-bullets">
          <li>⚡ Multi-tab xterm.js terminal with real PTY sessions</li>
          <li>🧠 Rina Agent: explain errors, fix commands, suggest next steps</li>
          <li>🎤 Voice Mode: hands-free terminal control</li>
          <li>🔄 Auto-updates with signed installers for Windows, macOS, and Linux</li>
        </ul>

        <div className="tp-cta-row">
          <a href="/download" className="tp-btn tp-btn-primary">
            Download Terminal Pro
          </a>
          <button
            type="button"
            className="tp-btn tp-btn-ghost"
            onClick={() => {
              const el = document.getElementById('tp-demo-script');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Watch a 3-minute demo
          </button>
        </div>

        <p className="tp-meta">
          Free tier available • Keep your stack • No lock-in • Built for real builders.
        </p>
      </div>

      <div className="tp-hero-right">
        <div className="tp-window">
          <div className="tp-window-header">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="tp-window-title">RinaWarp Terminal Pro</span>
          </div>
          <div className="tp-window-body">
            <pre>
              <code>
                {`$ git status
On branch main
nothing to commit, working tree clean

$ # 🧠 Rina: "Want me to review your project health?"`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TerminalProDemoScript() {
  return (
    <section id="tp-demo-script" className="tp-demo">
      <h2>Terminal Pro Demo Script (3 minutes)</h2>
      <ol className="tp-demo-list">
        <li>
          <strong>Start with voice:</strong> “Hey Rina, what can you do in this project?”
        </li>
        <li>
          <strong>Show an error:</strong> Run a failing command in the terminal.
        </li>
        <li>
          <strong>AI explain:</strong> Use Command Palette → “Explain last error”.
        </li>
        <li>
          <strong>AI fix:</strong> “Fix this command and give me the exact line to run.”
        </li>
        <li>
          <strong>Next steps:</strong> “What should I do next to clean this repo?”
        </li>
        <li>
          <strong>Upgrade path:</strong> Show the in-app upgrade bar and mention Free → Pro →
          Enterprise.
        </li>
      </ol>
      <p className="tp-demo-note">
        Script is designed for Loom, YouTube, or live calls — just follow the numbered sequence and
        let Rina do the rest.
      </p>
    </section>
  );
}
