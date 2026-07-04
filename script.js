// finance tracker - sumit kumar

const STORAGE_KEY = 'ft_txns';

let txns = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let activeType = 'income';
let activeFilter = 'all';
let donutChart = null;

const COLORS = ['#6b3fd4', '#c0392b', '#1a6b4a', '#d97706', '#2563eb', '#0891b2', '#be185d', '#4d7c0f'];

window.onload = () => {
  document.getElementById('txDate').valueAsDate = new Date();
  redraw();
};

function switchType(type) {
  activeType = type;

  const inc = document.getElementById('incBtn');
  const exp = document.getElementById('expBtn');

  inc.classList.remove('active');
  exp.classList.remove('active');

  if (type === 'income') {
    inc.classList.add('active');
  } else {
    exp.classList.add('active');
  }
}

function addTx() {
  const desc = document.getElementById('desc').value.trim();
  const amt  = parseFloat(document.getElementById('amt').value);
  const cat  = document.getElementById('cat').value;
  const date = document.getElementById('txDate').value;

  if (!desc || !amt || amt <= 0 || !cat || !date) {
    toast('fill in all fields first');
    return;
  }

  txns.unshift({
    id: Date.now(),
    type: activeType,
    desc,
    amt,
    cat,
    date
  });

  save();
  redraw();
  resetForm();

  toast(activeType === 'income' ? 'income added' : 'expense added');
}

function deleteTx(id) {
  txns = txns.filter(t => t.id !== id);
  save();
  redraw();
  toast('deleted');
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
}

function resetForm() {
  document.getElementById('desc').value = '';
  document.getElementById('amt').value  = '';
  document.getElementById('cat').value  = '';
  document.getElementById('txDate').valueAsDate = new Date();
}

function applyFilter(filter, el) {
  activeFilter = filter;

  document.querySelectorAll('.f-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  renderList();
}

function redraw() {
  updateSummary();
  renderList();
  renderChart();
}

function updateSummary() {
  let inc = 0, exp = 0;

  txns.forEach(t => {
    if (t.type === 'income') inc += t.amt;
    else exp += t.amt;
  });

  const bal = inc - exp;
  const fmt = n => '₹' + n.toLocaleString('en-IN');

  document.getElementById('navBalance').textContent = fmt(bal);
  document.getElementById('balFigure').textContent  = fmt(bal);
  document.getElementById('incTotal').textContent   = fmt(inc);
  document.getElementById('expTotal').textContent   = fmt(exp);

  const fig = document.getElementById('balFigure');
  const nav = document.getElementById('navBalance');

  if (bal < 0) {
    fig.classList.add('negative');
    nav.style.color = 'var(--exp)';
  } else {
    fig.classList.remove('negative');
    nav.style.color = '';
  }
}

function renderList() {
  const container = document.getElementById('txList');

  let list = txns;

  if (activeFilter === 'income' || activeFilter === 'expense') {
    list = txns.filter(t => t.type === activeFilter);
  } else if (activeFilter !== 'all') {
    list = txns.filter(t => t.cat === activeFilter);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <hr style="border:none; border-top:1px solid #f0efeb; margin-bottom:10px;">
      <div class="empty-state">
        <p>nothing here yet</p>
        <p>add a transaction on the left</p>
      </div>`;
    return;
  }

  const rows = list.map(t => {
    const initial = t.cat.charAt(0).toUpperCase();
    const sign  = t.type === 'income' ? '+' : '−';
    const cls   = t.type === 'income' ? 'inc' : 'exp';

    const dateLabel = new Date(t.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    });

    return `
      <div class="tx-row">
        <div class="tx-row-left">
          <div class="tx-icon ${cls}">${initial}</div>
          <div>
            <div class="tx-desc">${t.desc}</div>
            <div class="tx-meta">${t.cat} · ${dateLabel}</div>
          </div>
        </div>
        <div class="tx-row-right">
          <span class="tx-amt ${cls}">${sign}₹${t.amt.toLocaleString('en-IN')}</span>
          <button class="del-btn" onclick="deleteTx(${t.id})">✕</button>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <hr style="border:none; border-top:1px solid #f0efeb; margin-bottom:10px;">
    ${rows}`;
}

function renderChart() {
  const expenses = txns.filter(t => t.type === 'expense');
  const canvas   = document.getElementById('donut');
  const hint     = document.getElementById('chartHint');

  if (expenses.length === 0) {
    canvas.style.display = 'none';
    hint.style.display   = 'block';
    donutChart?.destroy();
    donutChart = null;
    return;
  }

  const grouped = {};
  expenses.forEach(t => {
    grouped[t.cat] = (grouped[t.cat] || 0) + t.amt;
  });

  const labels = Object.keys(grouped);
  const data   = Object.values(grouped);

  hint.style.display   = 'none';
  canvas.style.display = 'block';

  donutChart?.destroy();

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#6b7280',
            font: { family: 'Inter', size: 11 },
            padding: 12,
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ' ₹' + ctx.parsed.toLocaleString('en-IN')
          }
        }
      }
    }
  });
}

function toast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
