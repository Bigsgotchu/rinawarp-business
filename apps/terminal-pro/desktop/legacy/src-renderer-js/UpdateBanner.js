import { changelogModal } from "./ChangelogModal.js";

export class UpdateBanner {
  constructor() {
    this.banner = document.createElement("div");
    this.banner.id = "update-banner";
    this.banner.innerHTML = `
      <span id="update-text">Checking for updates…</span>
      <span id="update-action"></span>
    `;

    document.body.prepend(this.banner);
    this.hide();

    window.electronAPI.onUpdateChecking(() => {
      this.show();
      this.setText("Checking for updates…");
    });

    window.electronAPI.onUpdateAvailable(() => {
      this.show();
      this.setText("Update available — preparing download…");
    });

    window.electronAPI.onUpdateNone(() => {
      this.hide();
    });

    window.electronAPI.onUpdateError((msg) => {
      this.show();
      this.setText("Update error — retry later");
    });

    window.electronAPI.onUpdateProgress((info) => {
      this.show();
      this.setText(`Downloading update… ${info.percent}%`);
    });

    window.electronAPI.onUpdateDownloaded((info) => {
      this.show();
      this.setText("Update ready — click to restart now");

      const action = document.getElementById("update-action");
      action.innerHTML = `<button id="restart-btn">Restart</button>`;
      document.getElementById("restart-btn").onclick = () => {
        window.electronAPI.restartUpdate();
      };

      // Show changelog modal with release notes
      const version = info?.version || app.getVersion();
      const releaseNotes = info?.releaseNotes || "No release notes available.";
      changelogModal.show(version, releaseNotes);
    });
  }

  setText(text) {
    document.getElementById("update-text").innerText = text;
  }

  show() {
    this.banner.style.display = "flex";
  }

  hide() {
    this.banner.style.display = "none";
  }
}