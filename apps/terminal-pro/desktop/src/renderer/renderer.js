(function () {
  const $ = (id) => document.getElementById(id);
  const intentEl = $('intent'), planEl = $('plan'), outEl = $('output'), errEl = $('errors'),
        cwdEl = $('cwd'), btnCwd = $('btnCwd'), btnPlan = $('btnPlan'),
        btnDry = $('btnDry'), btnExec = $('btnExec'), btnRerun = $('btnRerun'), btnRollback = $('btnRollback'),
        capDocker = $('cap-docker'), capGit = $('cap-git'), capNpm = $('cap-npm'), capNetwork = $('cap-network'), saveCaps = $('saveCaps'),
        btnDiag = $('btnDiag'), btnExport = $('btnExport'), diagStatus = $('diagStatus'), diagModal = $('diagModal'), diagOut = $('diagOut'), diagClose = $('diagClose');

  function chipSet(el, on) { el.classList.toggle('tag-on', on); el.classList.toggle('tag-off', !on); }
  function getCwd() { return cwdEl.value && cwdEl.value.trim() ? cwdEl.value.trim() : process.cwd(); }
  function clearOutputs() { planEl.innerHTML = ''; outEl.textContent = ''; errEl.textContent = ''; }

  async function loadCaps() {
    const { caps } = await window.Rina.capsGet(getCwd());
    chipSet(capDocker, !!caps.docker); chipSet(capGit, !!caps.git); chipSet(capNpm, !!caps.npm); chipSet(capNetwork, !!caps.network);
  }
  async function saveCapsNow() {
    const caps = {
      docker: capDocker.classList.contains('tag-on'),
      git: capGit.classList.contains('tag-on'),
      npm: capNpm.classList.contains('tag-on'),
      network: capNetwork.classList.contains('tag-on')
    };
    await window.Rina.capsSet(getCwd(), caps);
    outEl.textContent = 'Capabilities saved.';
  }
  capDocker.onclick = () => chipSet(capDocker, !capDocker.classList.contains('tag-on'));
  capGit.onclick = () => chipSet(capGit, !capGit.classList.contains('tag-on'));
  capNpm.onclick = () => chipSet(capNpm, !capNpm.classList.contains('tag-on'));
  capNetwork.onclick = () => chipSet(capNetwork, !capNetwork.classList.contains('tag-on'));
  saveCaps.onclick = saveCapsNow;

  function renderPlan(plan) {
    planEl.innerHTML = '';
    plan.forEach((s, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${s.description}  [ ${s.command} ]`;
      li.title = 'Click to explain';
      li.style.cursor = 'help';
      li.onclick = async () => {
        const ex = await window.Rina.explain(s);
        alert(ex.text);
      };
      planEl.appendChild(li);
    });
  }

  async function doPlan() {
    clearOutputs();
    const intent = intentEl.value.trim(); if (!intent) return;
    const res = await window.Rina.plan(intent, getCwd());
    if (res.status === 'ok') { renderPlan(res.plan); outEl.textContent = 'Review plan. F9=Dry-run · F10=Execute'; }
    else { errEl.textContent = res.message || 'Plan failed'; }
  }
  async function doDry() {
    const intent = intentEl.value.trim(); if (!intent) return;
    const res = await window.Rina.dryrun(intent, getCwd());
    if (res.status === 'ok') { renderPlan(res.plan); outEl.textContent = res.stdout || ''; errEl.textContent = res.stderr || ''; }
    else { errEl.textContent = res.message || 'Dry-run failed'; }
  }
  async function doExec(resetFailed=false) {
    const intent = intentEl.value.trim(); if (!intent) return;
    if (!confirm(resetFailed ? 'Rerun failed steps only? (will keep successful steps skipped)' : 'Execute the plan?')) return;
    const res = await window.Rina.execGraph(intent, getCwd(), true, resetFailed);
    if (res.status === 'ok') { renderPlan([]); outEl.textContent = res.stdout || 'Completed.'; errEl.textContent = res.stderr || ''; }
    else { renderPlan(res.plan || []); errEl.textContent = `[${res.status}] ${res.message}\n` + (res.stderr || ''); }
  }
  async function doRollback() {
    if (!confirm('Rollback last successful steps?')) return;
    const r = await window.Rina.rollback();
    outEl.textContent = r.stdout || r.message || '';
    errEl.textContent = r.stderr || '';
  }

  btnCwd.onclick = () => { cwdEl.value = process.cwd(); loadCaps(); };
  btnPlan.onclick = doPlan; btnDry.onclick = doDry; btnExec.onclick = () => doExec(false); btnRerun.onclick = () => doExec(true); btnRollback.onclick = doRollback;
  btnDiag.onclick = async () => {
    diagStatus.textContent = 'Running diagnostics…';
    const r = await window.Rina.diagRun();
    diagOut.textContent = r.report || '';
    diagStatus.textContent = 'Diagnostics complete';
    diagModal.style.display = 'block';
  };
  btnExport.onclick = async () => {
    const cwd = getCwd();
    // Collect last shown plan/output if available
    const planItems = Array.from(planEl.querySelectorAll('li')).map(li => li.textContent);
    const execDetail = { output: outEl.textContent, errors: errEl.textContent };
    const r = await window.Rina.exportReport(cwd, planItems, execDetail);
    alert(`Exported: ${r.file}`);
  };
  diagClose.onclick = () => { diagModal.style.display = 'none'; };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); doPlan(); }
    else if (e.key === 'F9') { e.preventDefault(); doDry(); }
    else if (e.key === 'F10') { e.preventDefault(); doExec(false); }
    else if (e.key === 'Escape') { e.preventDefault(); intentEl.value = ''; clearOutputs(); }
  });

  // boot
  cwdEl.value = process.cwd(); loadCaps();
})();
