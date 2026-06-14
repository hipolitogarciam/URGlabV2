/* ─────────────────────────────────────────────────────────────────────────
   URGlab · Motor de Escalas — ENGINE
   Renderiza cualquier objeto de escalas.js. Router por hash:
     #sub=<id>  → listado de escalas de una subcategoría
     #id=<id>   → calculadora de una escala
   ───────────────────────────────────────────────────────────────────────── */

const COLORES = {
    verde: { bg: '#e6f7ee', border: '#16a34a', text: '#136c33' },
    ambar: { bg: '#fff7e6', border: '#f59e0b', text: '#92600a' },
    rojo:  { bg: '#fdeaea', border: '#dc2626', text: '#a01818' },
    gris:  { bg: '#eef1f5', border: '#64748b', text: '#475569' },
};

const $app = () => document.getElementById('app');
const $title = () => document.getElementById('header-title');
const $back = () => document.getElementById('back-btn');

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

/* ── Router ─────────────────────────────────────────────────────────────── */
function route() {
    const h = location.hash.slice(1);
    const params = new URLSearchParams(h);
    if (params.has('id')) {
        const e = ESCALAS.find(x => x.id === params.get('id'));
        if (e) return renderCalc(e);
    }
    if (params.has('sub')) {
        const s = SUBCATS.find(x => x.id === params.get('sub'));
        if (s) return renderLista(s);
    }
    renderSubcats();
}

const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function subcatGridHTML() {
    return `<div class="menu-grid">` + SUBCATS.map(s =>
        `<a class="cat-card" href="#sub=${s.id}">
            <div class="cat-icon ${s.color}">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
                     fill="none" stroke="${s.stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.svg}</svg>
            </div>
            <div class="cat-text"><div class="cat-name">${esc(s.nombre)}</div></div>
            <div class="cat-arrow">${chevron()}</div>
        </a>`).join('') + `</div>`;
}

function escalaCard(e) {
    return `<a class="cat-card" href="#id=${e.id}">
        <div class="cat-text">
            <div class="cat-name">${esc(e.nombre)}</div>
            ${e.abrev ? `<div class="cat-desc">${esc(e.abrev)}</div>` : ''}
        </div>
        <div class="cat-arrow">${chevron()}</div>
    </a>`;
}

/* ── Vista: subcategorías (+ buscador interno) ──────────────────────────── */
function renderSubcats() {
    $title().textContent = 'Escalas';
    $back().href = '../index.html#menu';
    $app().innerHTML = `
        <div class="esc-search-wrap">
            <svg class="esc-search-ico" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="esc-search" class="esc-search" type="search" placeholder="Buscar escala o calculadora…" autocomplete="off">
        </div>
        <div id="esc-list">${subcatGridHTML()}</div>`;
    const inp = document.getElementById('esc-search');
    inp.addEventListener('input', () => filterEscalas(inp.value));
    window.scrollTo(0, 0);
}

function filterEscalas(q) {
    const list = document.getElementById('esc-list');
    if (!list) return;
    const nq = norm(q);
    if (!nq) { list.innerHTML = subcatGridHTML(); return; }
    const matches = ESCALAS.filter(e =>
        norm(e.nombre).includes(nq) || norm(e.abrev || '').includes(nq) || (e.kw || []).some(k => norm(k).includes(nq)));
    list.innerHTML = matches.length
        ? `<div class="menu-grid">${matches.map(escalaCard).join('')}</div>`
        : `<div class="esc-empty">Sin resultados para «${esc(q)}».</div>`;
}

/* ── Vista: listado de una subcategoría (ordenado por ORDEN) ────────────── */
function renderLista(s) {
    $title().textContent = s.nombre;
    $back().href = '#';
    const orden = (typeof ORDEN !== 'undefined' && ORDEN[s.id]) || [];
    const items = ESCALAS.filter(e => e.sub === s.id)
        .sort((a, b) => ((orden.indexOf(a.id) + 1) || 999) - ((orden.indexOf(b.id) + 1) || 999))
        .map(escalaCard).join('');
    $app().innerHTML = `<div class="menu-grid">${items}</div>`;
    window.scrollTo(0, 0);
}

/* ── Vista: asistente secuencial (wizard) — una pregunta a la vez ───────── */
function renderWizard(e) {
    $title().textContent = e.nombre;
    $back().href = `#sub=${e.sub}`;
    e._sel = {};
    const notaTop = e.nota ? `<p class="esc-nota">${esc(e.nota)}</p>` : '';
    $app().innerHTML = `
        ${notaTop}
        <div id="wizard"></div>
        <div id="resultado" class="esc-result placeholder"><span class="esc-result-hint">Responde para clasificar.</span></div>
        <p class="esc-fuente">Fuente: ${esc(e.fuente)}</p>
        <p class="esc-disclaimer">Herramienta de apoyo a la decisión. No sustituye el juicio clínico.</p>`;
    wizardRender(e);
    window.scrollTo(0, 0);
}

function resetResultPlaceholder() {
    const r = document.getElementById('resultado');
    if (!r) return;
    r.className = 'esc-result placeholder';
    r.style.background = ''; r.style.borderColor = '';
    r.innerHTML = '<span class="esc-result-hint">Responde para clasificar.</span>';
}

// Asistente acumulativo: los criterios respondidos «No» permanecen visibles; el primer
// «Sí» (o agotar todos en «No») fija la categoría, mostrada justo debajo del último criterio.
function wizardRender(e) {
    const wz = document.getElementById('wizard');
    let html = '', tier = null, lastGroup = null, stop = false;
    for (let i = 0; i < e.campos.length; i++) {
        const c = e.campos[i];
        if (c.grupo && c.grupo !== lastGroup) {        // cabecera de sección (mBIG 3 / mBIG 2)
            html += `<div class="wiz-group">${esc(c.grupo)}</div>`;
            lastGroup = c.grupo;
        }
        const ans = e._sel[c.id];
        if (ans === undefined) { html += campoHTML(c); stop = true; break; }   // criterio activo
        html += campoHTML(c, ans);                                             // respondido (permanece)
        if (ans > 1) { tier = ans; stop = true; break; }                       // primer «Sí» decide
    }
    if (!stop) tier = 1;                                                       // todos «No» → mBIG 1
    wz.innerHTML = html;
    wz.querySelectorAll('.opt-btn').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.campo;
        e._sel[id] = Number(btn.dataset.v);
        const idx = e.campos.findIndex(c => c.id === id);
        for (let j = idx + 1; j < e.campos.length; j++) delete e._sel[e.campos[j].id]; // recalcula desde aquí
        wizardRender(e);
    }));
    if (tier !== null) showResult(e, tier, e._sel);
    else resetResultPlaceholder();
}

/* ── Vista: calculadora ─────────────────────────────────────────────────── */
function renderCalc(e) {
    if (e.wizard) return renderWizard(e);
    $title().textContent = e.nombre;
    $back().href = `#sub=${e.sub}`;

    const notaTop = e.nota ? `<p class="esc-nota">${esc(e.nota)}</p>` : '';
    // 'formula' → solo inputs numéricos · 'puntos' → solo opciones ·
    // 'mixto' → campos que pueden ser opciones (botones) o numéricos (input).
    let body;
    if (e.tipo === 'formula') body = e.inputs.map(inputHTML).join('');
    else body = e.campos.map(c => c.input === 'numero' ? inputHTML(c) : campoHTML(c)).join('');

    const nota2 = e.nota2 ? `<p class="esc-caveat">⚠ ${esc(e.nota2)}</p>` : '';
    const hint = e.tipo === 'formula'     ? 'Introduce los valores para calcular.'
               : e.tipo === 'analizador'  ? 'Introduce la gasometría (pH, pCO₂, HCO₃, Na⁺, Cl⁻) para interpretarla.'
               : e.tipo === 'mixto'       ? 'Completa todos los campos para ver el resultado.'
               : 'Selecciona todas las opciones para ver el resultado.';

    $app().innerHTML = `
        ${notaTop}
        <div class="esc-form">${body}</div>
        <div id="resultado" class="esc-result placeholder">
            <span class="esc-result-hint">${hint}</span>
        </div>
        ${nota2}
        <p class="esc-fuente">Fuente: ${esc(e.fuente)}</p>
        <p class="esc-disclaimer">Herramienta de apoyo a la decisión. No sustituye el juicio clínico.</p>`;

    // Estado y listeners
    if (e.tipo === 'formula') {
        $app().querySelectorAll('input[type="number"]').forEach(inp => {
            inp.addEventListener('input', () => computeFormula(e));
        });
    } else {
        e._sel = {};
        const compute = () => (e.tipo === 'analizador' ? computeAnalizador(e)
                             : e.tipo === 'mixto' ? computeMixto(e)
                             : computePuntos(e));
        $app().querySelectorAll('.opt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const campo = btn.dataset.campo;
                e._sel[campo] = Number(btn.dataset.v);
                $app().querySelectorAll(`.opt-btn[data-campo="${campo}"]`)
                    .forEach(b => b.classList.toggle('sel', b === btn));
                compute();
            });
        });
        $app().querySelectorAll('input[type="number"]').forEach(inp => {
            inp.addEventListener('input', () => compute());
        });
    }
    applyPrefill(e);
    window.scrollTo(0, 0);
}

function campoHTML(c, selVal) {
    const sub = c.sublabel ? `<div class="campo-sub">${esc(c.sublabel)}</div>` : '';
    const opts = c.opciones.map(o =>
        `<button class="opt-btn${selVal !== undefined && Number(o.v) === Number(selVal) ? ' sel' : ''}" data-campo="${c.id}" data-v="${o.v}">
            <span class="opt-t">${esc(o.t)}</span>${c.noPoints ? '' : `<span class="opt-v">${o.v > 0 ? '+' + o.v : o.v}</span>`}
         </button>`).join('');
    return `<div class="campo">
        <div class="campo-label">${esc(c.label)}</div>${sub}
        <div class="opt-group">${opts}</div>
    </div>`;
}

function inputHTML(i) {
    const sub = i.sublabel ? `<div class="campo-sub">${esc(i.sublabel)}</div>` : '';
    return `<div class="campo">
        <label class="campo-label" for="in-${i.id}">${esc(i.label)}</label>${sub}
        <div class="input-wrap">
            <input type="number" inputmode="decimal" id="in-${i.id}" data-id="${i.id}"
                   placeholder="${esc(i.placeholder || '')}" step="any">
            <span class="input-unit">${esc(i.unidad || '')}</span>
        </div>
    </div>`;
}

function computePuntos(e) {
    const total = e.campos.reduce((s, c) => s + (e._sel[c.id] ?? NaN), 0);
    if (Number.isNaN(total)) {
        const faltan = e.campos.filter(c => e._sel[c.id] === undefined).length;
        return showPlaceholder(`Faltan ${faltan} campo(s) por seleccionar.`);
    }
    showResult(e, total, e._sel);
}

function computeFormula(e) {
    const v = {};
    let ok = true;
    e.inputs.forEach(i => {
        const raw = document.getElementById('in-' + i.id).value;
        if (raw === '' || isNaN(Number(raw))) ok = false;
        v[i.id] = Number(raw);
    });
    if (!ok) return showPlaceholder('Introduce todos los valores para calcular.');
    const valor = e.calcular(v);
    if (!isFinite(valor)) return showPlaceholder('Revisa los valores (división no válida).');
    showResult(e, valor, v);
}

// Desplaza al resultado si ha quedado fuera de la vista (tras escalar de categoría)
function revealResult() {
    const r = document.getElementById('resultado');
    if (!r) return;
    const rect = r.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.bottom > vh - 8 || rect.top < 60) r.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mixto: campos numéricos (input:'numero') + campos de opciones; puntúa con calcular(v)
function computeMixto(e) {
    const v = {};
    let ok = true;
    e.campos.forEach(c => {
        if (c.input === 'numero') {
            const raw = document.getElementById('in-' + c.id).value;
            if (raw === '' || isNaN(Number(raw))) ok = false;
            v[c.id] = Number(raw);
        } else {
            if (e._sel[c.id] === undefined) ok = false;
            else v[c.id] = e._sel[c.id];
        }
    });
    if (!ok) return showPlaceholder('Completa todos los campos para ver el resultado.');
    const total = e.calcular(v);
    if (!isFinite(total)) return showPlaceholder('Revisa los valores introducidos.');
    showResult(e, total, v);
}

// Analizador: campos numéricos (algunos opcionales) + selectores; produce un informe multibloque
function computeAnalizador(e) {
    const v = {};
    let ok = true;
    e.campos.forEach(c => {
        if (c.opciones) {
            v[c.id] = e._sel[c.id];            // selector, siempre opcional
        } else {
            const raw = document.getElementById('in-' + c.id).value;
            const num = Number(raw);
            if (raw === '' || isNaN(num)) { v[c.id] = NaN; if (!c.opcional) ok = false; }
            else v[c.id] = num;
        }
    });
    if (!ok) return showPlaceholder('Introduce al menos pH, pCO₂, HCO₃, Na⁺ y Cl⁻.');
    renderReport(e, e.analizar(v));
}

function renderReport(e, report) {
    const r = document.getElementById('resultado');
    r.className = 'esc-result report';
    r.style.background = '';
    r.style.borderColor = '';
    r.innerHTML = (report.bloques || []).map(b => {
        const col = COLORES[b.color] || COLORES.gris;
        return `<div class="report-block" style="background:${col.bg}; border-color:${col.border}">
            <div class="report-titulo" style="color:${col.text}">${esc(b.titulo)}</div>
            ${b.valor ? `<div class="report-valor" style="color:${col.text}">${esc(b.valor)}</div>` : ''}
            ${b.texto ? `<div class="report-texto">${esc(b.texto)}</div>` : ''}
        </div>`;
    }).join('');
}

/* ── Autocompletado desde los datos del paciente (hj23_patient) ──────────── */
function getPatient() {
    try { return JSON.parse(localStorage.getItem('hj23_patient')); } catch (e) { return null; }
}

function selectPrefillOpt(e, campoId, val) {
    e._sel[campoId] = val;
    $app().querySelectorAll(`.opt-btn[data-campo="${campoId}"]`).forEach(b =>
        b.classList.toggle('sel', Number(b.dataset.v) === val));
    return true;
}

function markPrefilled(fieldId) {
    const el = document.getElementById('in-' + fieldId) ||
               $app().querySelector(`.opt-btn[data-campo="${fieldId}"]`);
    const campo = el && el.closest('.campo');
    if (campo && !campo.querySelector('.prefill-note')) {
        const n = document.createElement('div');
        n.className = 'prefill-note';
        n.textContent = '↩ Autocompletado del paciente · verifica';
        campo.appendChild(n);
    }
}

// Rellena los campos marcados con prefill ('weight'/'height') o prefillSex
function applyPrefill(e) {
    const p = getPatient();
    if (!p) return;
    const campos = e.tipo === 'formula' ? e.inputs : e.campos;
    let changed = false;
    campos.forEach(c => {
        const numField = { weight: p.weight, height: p.height, age: p.age };
        if (c.prefill && numField[c.prefill] > 0) {
            const inp = document.getElementById('in-' + c.id);
            if (inp) { inp.value = numField[c.prefill]; inp.classList.add('prefilled'); markPrefilled(c.id); changed = true; }
        } else if (c.prefillSex && p.sex) {
            const opt = (c.opciones || []).find(o => o.sex === p.sex);
            if (opt && selectPrefillOpt(e, c.id, opt.v)) { markPrefilled(c.id); changed = true; }
        } else if (c.prefillAge && p.age > 0) {
            const opt = (c.opciones || []).find(o =>
                (o.ageMin == null || p.age >= o.ageMin) && (o.ageMax == null || p.age <= o.ageMax));
            if (opt && selectPrefillOpt(e, c.id, opt.v)) { markPrefilled(c.id); changed = true; }
        }
    });
    if (changed) {
        if (e.tipo === 'formula') computeFormula(e);
        else if (e.tipo === 'mixto') computeMixto(e);
        else computePuntos(e);
    }
}

function showPlaceholder(msg) {
    const r = document.getElementById('resultado');
    r.className = 'esc-result placeholder';
    r.innerHTML = `<span class="esc-result-hint">${esc(msg)}</span>`;
}

function showResult(e, valor, v) {
    const info = e.interpretar(valor, v);
    const col = COLORES[info.color] || COLORES.gris;
    const dec = e.decimales ?? 0;
    const numStr = (e.tipo === 'puntos') ? String(valor) : valor.toFixed(dec);
    const unidad = e.unidadResultado || '';
    const r = document.getElementById('resultado');
    r.className = 'esc-result';
    r.style.background = col.bg;
    r.style.borderColor = col.border;
    // noNumero: reglas de decisión (sin puntuación numérica relevante)
    const head = e.noNumero ? '' : `
        <div class="result-head" style="color:${col.text}">
            <div class="result-num">${esc(numStr)}<span class="result-unit">${esc(unidad)}</span></div>
            <div class="result-label">${esc(e.resultadoLabel)}</div>
        </div>`;
    r.innerHTML = `
        ${head}
        <div class="result-nivel" style="background:${col.border}">${esc(info.nivel)}</div>
        <div class="result-titulo" style="color:${col.text}">${esc(info.titulo)}</div>
        <div class="result-texto">${esc(info.texto)}</div>`;
}

function chevron() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/></svg>`;
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
