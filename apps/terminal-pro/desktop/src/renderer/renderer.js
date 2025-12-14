(function () {
  const $ = (id) => document.getElementById(id);

  const intentEl = $('intent'), planEl = $('plan'), outEl = $('output'), errEl = $('errors'),
        cwdEl = $('cwd'), btnCwd = $('btnCwd'), btnPlan = $('btnPlan'),
        btnDry = $('btnDry'), btnExec = $('btnExec'), btnRerun = $('btnRerun'), btnRollback = $('btnRollback'),
        capDocker = $('cap-docker'), capGit = $('cap-git'), capNpm = $('cap-npm'), capNetwork = $('cap-network'), saveCaps = $('saveCaps');

  // NEW refs
  const btnDiag = $('btnDiag'), diagStatus = $('diagStatus');
  const btnExport = $('btnExport'), btnFixPolicy = $('btnFixPolicy');
  const btnShowGraph = $('btnShowGraph'), graphModal = $('graphModal'), graphClose = $('graphClose'), graphSvg = $('graphSvg');
  const btnDrySel = $('btnDrySel'), btnExecSel = $('btnExecSel'), selSummary = $('selSummary');

  let lastPlan = []; // NEW: keep raw plan for visualization
  let selectedIds = new Set();

  function chipSet(el, on) { el.classList.toggle('tag-on', on); el.classList.toggle('tag-off', !on); }
  function getCwd() { return cwdEl.value && cwdEl.value.trim() ? cwdEl.value.trim() : process.cwd(); }
  function clearOutputs() { planEl.innerHTML = ''; outEl.textContent = ''; errEl.textContent = ''; }
  function updateSelSummary() {
    selSummary.textContent = selectedIds.size ? `Selected: ${Array.from(selectedIds).join(', ')}` : 'No steps selected';
  }

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
    lastPlan = plan || []; // keep for graph
    selectedIds.clear();
    planEl.innerHTML = '';
    lastPlan.forEach((s, i) => {
      const li = document.createElement('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.marginRight = '6px';
      cb.onchange = () => {
        if (cb.checked) selectedIds.add(s.id); else selectedIds.delete(s.id);
        updateSelSummary();
      };
      const text = document.createElement('span');
      text.textContent = `${i + 1}. ${s.id} — ${s.description}  [ ${s.command} ]`;
      text.title = 'Click to explain';
      text.style.cursor = 'help';
      text.onclick = async () => { const ex = await window.Rina.explain(s); alert(ex.text); };

      li.appendChild(cb);
      li.appendChild(text);
      planEl.appendChild(li);
    });
    updateSelSummary();
  }

  async function doPlan() {
    clearOutputs();
    const intent = intentEl.value.trim(); if (!intent) return;
    const res = await window.Rina.plan(intent, getCwd());
    if (res.status === 'ok') { renderPlan(res.plan); outEl.textContent = 'Review plan. Select steps if needed. F9=Dry-run · F10=Execute'; }
    else { errEl.textContent = res.message || 'Plan failed'; }
  }

  async function runSelected(dryRun) {
    const intent = intentEl.value.trim(); if (!intent) return;
    if (!selectedIds.size) { alert('Select at least one step.'); return; }
    // show closure preview count (done server-side too, but UX feedback)
    const res = await window.Rina.execSubset(intent, getCwd(), Array.from(selectedIds), dryRun);
    if (res.status === 'ok') {
      renderPlan(res.plan); // show the exact subset+deps that ran
      outEl.textContent = res.stdout || (dryRun ? 'Dry-run complete.' : 'Completed.');
      errEl.textContent = res.stderr || '';
    } else {
      renderPlan(res.plan || []);
      errEl.textContent = `[${res.status}] ${res.message}\n` + (res.stderr || '');
    }
  }

  // Diagnostics & Export (existing wiring assumed)
  btnExport.onclick = async () => {
    const cwd = getCwd();
    const planItems = lastPlan;
    const execDetail = { output: outEl.textContent, errors: errEl.textContent };
    const r = await window.Rina.exportReport(cwd, planItems, execDetail);
    alert(`Exported: ${r.file}`);
  };

  btnDiag.onclick = async () => {
    diagStatus.textContent = 'Running diagnostics…';
    const cwd = getCwd();
    const r = await window.Rina.diagRun({ cwd });
    document.getElementById('diagOut').textContent = r.report || '';
    diagStatus.textContent = 'Diagnostics complete';
    document.getElementById('diagModal').style.display = 'block';
  };

  // NEW: Quick-Fix policy
  btnFixPolicy.onclick = async () => {
    const r = await window.Rina.policyQuickFix(getCwd());
    alert(`${r.message}\n${r.file}`);
  };

  // === DAG GRAPH ===
  btnShowGraph.onclick = () => {
    drawGraph(lastPlan, graphSvg);
    graphModal.style.display = 'block';
  };
  graphClose.onclick = () => { graphModal.style.display = 'none'; };

  // Simple layered layout without deps
  function topoLayers(steps) {
    const id2Step = new Map(steps.map(s => [s.id, s]));
    const indeg = new Map(steps.map(s => [s.id, 0]));
    for (const s of steps) for (const d of (s.requires||[])) indeg.set(s.id, (indeg.get(s.id)||0)+1);
    const q = []; for (const [id, d] of indeg) if (d===0) q.push(id);
    const layers = [];
    const seen = new Set();
    while (q.length) {
      const layer = [...q]; q.length = 0; layers.push(layer);
      for (const id of layer) {
        seen.add(id);
        for (const s of steps) {
          if (!seen.has(s.id) && (s.requires||[]).includes(id)) {
            indeg.set(s.id, (indeg.get(s.id)||0)-1);
          }
        }
      }
      for (const [id, d] of indeg) if (d===0 && !seen.has(id) && !q.includes(id)) q.push(id);
    }
    // any remaining (cycles) – shove into last layer
    for (const s of steps) if (!layers.flat().includes(s.id)) {
      if (!layers.length) layers.push([]); layers[layers.length-1].push(s.id);
    }
    return { layers, id2Step };
  }

  function drawGraph(steps, svg) {
    const NS = 'http://www.w3.org/2000/svg';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const { layers, id2Step } = topoLayers(steps);
    const layerGap = 260, nodeW = 240, nodeH = 60, vGap = 24, margin = 40;

    // positions
    const pos = new Map();
    layers.forEach((layer, x) => {
      const totalH = layer.length*nodeH + (layer.length-1)*vGap;
      const yStart = margin + Math.max(0, (svg.height.baseVal.value - totalH)/2);
      layer.forEach((id, i) => {
        const y = yStart + i*(nodeH+vGap);
        const xPx = margin + x*layerGap;
        pos.set(id, { x:xPx, y });
      });
    });

    // edges
    for (const s of steps) {
      for (const d of (s.requires||[])) {
        const a = pos.get(d), b = pos.get(s.id);
        if (!a || !b) continue;
        const path = document.createElementNS(NS, 'path');
        const mx = (a.x + nodeW) + 40;
        const dStr = `M ${a.x+nodeW} ${a.y+nodeH/2} C ${mx} ${a.y+nodeH/2}, ${b.x-40} ${b.y+nodeH/2}, ${b.x} ${b.y+nodeH/2}`;
        path.setAttribute('d', dStr);
        path.setAttribute('fill','none');
        path.setAttribute('stroke','#555');
        path.setAttribute('stroke-width','2');
        svg.appendChild(path);
      }
    }

    // nodes
    for (const s of steps) {
      const p = pos.get(s.id); if (!p) continue;
      const g = document.createElementNS(NS, 'g');
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', p.x); r.setAttribute('y', p.y);
      r.setAttribute('width', nodeW); r.setAttribute('height', nodeH);
      r.setAttribute('rx','10'); r.setAttribute('ry','10');
      r.setAttribute('fill','#1a1a1a'); r.setAttribute('stroke','#444');
      const t1 = document.createElementNS(NS, 'text');
      t1.setAttribute('x', p.x+12); t1.setAttribute('y', p.y+22);
      t1.setAttribute('font-size','12'); t1.setAttribute('fill','#aaa');
      t1.textContent = s.id;
      const t2 = document.createElementNS(NS, 'text');
      t2.setAttribute('x', p.x+12); t2.setAttribute('y', p.y+40);
      t2.setAttribute('font-size','12'); t2.setAttribute('fill','#ddd');
      t2.textContent = s.description;
      g.appendChild(r); g.appendChild(t1); g.appendChild(t2);
      svg.appendChild(g);
    }
  }

  // rebind buttons (keep original bindings)
  btnCwd.onclick = () => { cwdEl.value = process.cwd(); loadCaps(); };
  btnPlan.onclick = doPlan;
  btnDrySel.onclick = () => runSelected(true);
  btnExecSel.onclick = () => {
    if (!confirm('Execute selected steps (with required dependencies)?')) return;
    runSelected(false);
  };
  btnDry.onclick = async () => { const intent = intentEl.value.trim(); if (!intent) return;
    const res = await window.Rina.dryrun(intent, getCwd());
    if (res.status === 'ok') { renderPlan(res.plan); outEl.textContent = res.stdout || ''; errEl.textContent = res.stderr || ''; }
    else { errEl.textContent = res.message || 'Dry-run failed'; }
  };
  btnExec.onclick = async () => { const intent = intentEl.value.trim(); if (!intent) return;
    if (!confirm('Execute the plan?')) return;
    const res = await window.Rina.execGraph(intent, getCwd(), true, false);
    if (res.status === 'ok') { renderPlan([]); outEl.textContent = res.stdout || 'Completed.'; errEl.textContent = res.stderr || ''; }
    else { renderPlan(res.plan || []); errEl.textContent = `[${res.status}] ${res.message}\n` + (res.stderr || ''); }
  };
  btnRerun.onclick = async () => {
    const intent = intentEl.value.trim(); if (!intent) return;
    if (!confirm('Rerun failed steps only?')) return;
    const res = await window.Rina.execGraph(intent, getCwd(), true, true);
    if (res.status === 'ok') { renderPlan([]); outEl.textContent = res.stdout || 'Completed.'; errEl.textContent = res.stderr || ''; }
    else { renderPlan(res.plan || []); errEl.textContent = `[${res.status}] ${res.message}\n` + (res.stderr || ''); }
  };
  btnRollback.onclick = async () => {
    if (!confirm('Rollback last successful steps?')) return;
    const r = await window.Rina.rollback();
    outEl.textContent = r.stdout || r.message || '';
    errEl.textContent = r.stderr || '';
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); doPlan(); }
    else if (e.key === 'F9') { e.preventDefault(); btnDry.click(); }
    else if (e.key === 'F10') { e.preventDefault(); btnExec.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); intentEl.value = ''; outEl.textContent=''; errEl.textContent=''; }
  });

  cwdEl.value = process.cwd(); loadCaps();

  // License Gate Modal
  const btnLicense = $('btnLicense'), btnBilling = $('btnBilling');
  const modal = $('licenseModal'), licEmail = $('licEmail'), licKey = $('licKey'), licCancel = $('licCancel'), licVerify = $('licVerify'), licMsg = $('licMsg');

  // Open modal
  btnLicense.onclick = async () => {
    const curr = await window.rinawarp.licenseGet();
    if (curr?.data?.email) licEmail.value = curr.data.email;
    if (curr?.data?.key) licKey.value = curr.data.key;
    licMsg.textContent = '';
    modal.style.display = 'block';
  };
  licCancel.onclick = () => { modal.style.display = 'none'; };

  // Verify
  licVerify.onclick = async () => {
    licMsg.textContent = 'Verifying…';
    const r = await window.rinawarp.licenseVerify(licEmail.value.trim(), licKey.value.trim());
    if (r.status === 'ok') {
      licMsg.textContent = 'License verified. Pro features unlocked.';
      setTimeout(() => modal.style.display = 'none', 700);
    } else {
      licMsg.textContent = 'Invalid or failed to verify. Check email/key.';
    }
  };

  // Manage billing (opens portal in system browser)
  btnBilling.onclick = async () => {
    const e = (await window.rinawarp.licenseGet())?.data?.email || '';
    const email = prompt('Billing email for Portal:', e || '');
    if (!email) return;
    const res = await window.rinawarp.billingPortal(email.trim());
    if (res.status !== 'ok') alert(res.message || 'Portal unavailable');
  };

  // Simple gate helper you can use around Pro-only actions:
  async function requireProOrToast() {
    const lic = await window.rinawarp.licenseGet();
    if (lic.valid) return true;
    alert('Pro feature. Please verify your license in Settings.');
    return false;
  }
})();
