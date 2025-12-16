const COURSES = [
  {
    id: 'first-steps',
    title: 'First Steps in RinaWarp',
    steps: [
      {
        id: 'open-terminal',
        title: 'Open your first terminal tab',
        actionHint: 'Press Ctrl+Shift+T',
        check: () => window.RinaTerminalState?.tabCount >= 1,
      },
      {
        id: 'run-command',
        title: 'Run your first command',
        actionHint: 'Type "ls" and press Enter',
        check: () => window.RinaTerminalState?.lastCommand,
      },
    ],
  },
  {
    id: 'ai-help',
    title: 'AI Terminal Help',
    steps: [
      {
        id: 'ai-explain',
        title: 'Ask AI to explain an error',
        actionHint: 'Use Command Palette → "Explain last error"',
        check: () => window.RinaAIState?.usedExplainLastError === true,
      },
    ],
  },
];

export class RinaAcademy {
  constructor() {
    this.currentCourseId = null;
    this.container = document.querySelector('.rina-academy-panel');
    this.listEl = this.container?.querySelector('.rina-academy-list');
    this.detailEl = this.container?.querySelector('.rina-academy-detail');
  }

  init() {
    if (!this.container) return;
    this.renderCourseList();
  }

  renderCourseList() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    COURSES.forEach((course) => {
      const btn = document.createElement('button');
      btn.className = 'rina-academy-course-item';
      btn.textContent = course.title;
      btn.addEventListener('click', () => {
        this.currentCourseId = course.id;
        this.renderCourseDetail(course);
      });
      this.listEl.appendChild(btn);
    });
  }

  renderCourseDetail(course) {
    if (!this.detailEl) return;
    this.detailEl.innerHTML = `
      <h3>${course.title}</h3>
      <ul class="rina-academy-steps">
        ${course.steps
          .map(
            (s) => `
          <li data-step-id="${s.id}">
            <div class="step-title">${s.title}</div>
            <div class="step-hint">${s.actionHint}</div>
            <div class="step-status">⏳ Pending</div>
          </li>`,
          )
          .join('')}
      </ul>
    `;

    this.monitorCourse(course);
  }

  monitorCourse(course) {
    const updateStatuses = () => {
      const items = this.detailEl.querySelectorAll('li[data-step-id]');
      items.forEach((li) => {
        const stepId = li.getAttribute('data-step-id');
        const step = course.steps.find((s) => s.id === stepId);
        if (!step) return;
        const statusEl = li.querySelector('.step-status');
        const done = !!step.check();
        statusEl.textContent = done ? '✅ Done' : '⏳ Pending';
      });
    };

    updateStatuses();
    setInterval(updateStatuses, 2000);
  }
}

export function initRinaAcademy() {
  const academy = new RinaAcademy();
  academy.init();
  window.RinaAcademy = academy;
}
