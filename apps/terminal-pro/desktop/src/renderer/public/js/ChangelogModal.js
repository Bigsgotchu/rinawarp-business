export class ChangelogModal {
  constructor() {
    this.modal = document.getElementById('changelog-modal');
    this.versionEl = document.getElementById('cl-version');
    this.bodyEl = document.getElementById('cl-body');
    this.closeBtn = document.getElementById('cl-close');

    this.closeBtn.addEventListener('click', () => {
      this.hide();
    });
  }

  show(version, changelogText) {
    this.versionEl.textContent = version;
    this.bodyEl.textContent = changelogText;
    this.modal.classList.remove('changelog-hidden');
  }

  hide() {
    this.modal.classList.add('changelog-hidden');
  }

  // Method to show changelog for manual triggering
  async showLatestChangelog() {
    try {
      const version = await window.electronAPI.getAppVersion();
      const releaseNotes = await window.electronAPI.getReleaseNotes();
      this.show(version, releaseNotes);
    } catch (error) {
      console.error("Failed to show changelog:", error);
      this.show("Latest Version", "Failed to load release notes.");
    }
  }
}

export const changelogModal = new ChangelogModal();