<<<<<<< HEAD
let transactions = JSON.parse(localStorage.getItem('financeData')) || [];
let currentType = 'income';
let currentFilter = 'all';
let pieChart = null;

const categoryIcons = {
  Salary: '💼', Freelance: '💻', Investment: '📊', Gift: '🎁',
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '💡',
  Health: '🏥', Education: '📚', Entertainment: '🎮', Other: '📦'
};

const chartColors = [
  '#38bdf8', '#4ade80', '#f87171', '#fbbf24',
  '#a78bfa', '#fb923c', '#34d399', '#f472b6'
];

window.onload = function() {
  document.getElementById('txDate').valueAsDate = new Date();
  document.getElementById('navDate').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase();
  render();
};

function setType(type) {
  currentType = type;
  let incBtn = document.getElementById('incomeBtn');
  let expBtn = document.getElementById('expenseBtn');
  incBtn.className = 'type-btn';
  expBtn.className = 'type-btn';
=======
// ============================================
//   Finance Tracker - script.js
//   Author: Sumit Kumar
//   Description: All the logic for adding,
//   deleting, filtering transactions and
//   updating the chart and summary cards.
// ============================================


// ── Data ─────────────────────────────────────
// Load saved transactions from localStorage
// If nothing saved yet, start with empty array
let transactions = JSON.parse(localStorage.getItem('financeData')) || [];

// tracks which toggle is selected (income or expense)
let currentType = 'income';

// tracks which filter button is active
let currentFilter = 'all';

// chart instance - we need this to destroy old chart before making new one
let pieChart = null;


// ── Category emoji map ────────────────────────
// used to show emoji icon next to each transaction
const categoryIcons = {
  Salary: '💼',
  Freelance: '💻',
  Investment: '📊',
  Gift: '🎁',
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '💡',
  Health: '🏥',
  Education: '📚',
  Entertainment: '🎮',
  Other: '📦'
};


// ── Pie chart colors ──────────────────────────
// each category gets one of these colors in the chart
const chartColors = [
  '#00e5a0',
  '#ff4f6d',
  '#4f8eff',
  '#ffd166',
  '#a78bfa',
  '#fb923c',
  '#34d399',
  '#f472b6'
];


// ── On page load ──────────────────────────────
window.onload = function () {
  // set today's date in the date input automatically
  document.getElementById('txDate').valueAsDate = new Date();

  render(); // render the UI with loaded data
};

 


// ── Toggle between Income and Expense ────────
function setType(type) {
  currentType = type;

  let incBtn = document.getElementById('incomeBtn');
  let expBtn = document.getElementById('expenseBtn');

  // reset both buttons first
  incBtn.className = 'type-btn';
  expBtn.className = 'type-btn';

  // then highlight the selected one
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  if (type === 'income') {
    incBtn.className = 'type-btn active-income';
  } else {
    expBtn.className = 'type-btn active-expense';
  }
}

<<<<<<< HEAD
function addTransaction() {
=======

// ── Add a new transaction ─────────────────────
function addTransaction() {
  // grab values from form inputs
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  let desc     = document.getElementById('desc').value.trim();
  let amount   = parseFloat(document.getElementById('amount').value);
  let category = document.getElementById('category').value;
  let date     = document.getElementById('txDate').value;

<<<<<<< HEAD
  if (!desc || !amount || amount <= 0 || !category || !date) {
    showToast('⚠️', 'Please fill in all fields!');
    return;
  }

  let tx = {
    id: Date.now(),
    type: currentType,
=======
  // check all fields are filled
  if (!desc || !amount || amount <= 0 || !category || !date) {
    showToast('⚠️', 'Please fill in all fields!');
    return; // stop here if validation fails
  }

  // build a transaction object
  let tx = {
    id: Date.now(),       // unique id using current timestamp
    type: currentType,    // 'income' or 'expense'
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
    desc: desc,
    amount: amount,
    category: category,
    date: date
  };

<<<<<<< HEAD
  transactions.unshift(tx);
  saveData();
  render();
  clearForm();
  showToast('✅', `${currentType === 'income' ? 'Income' : 'Expense'} added!`);
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
=======
  // add to beginning so newest shows first
  transactions.unshift(tx);

  saveData();   // save to localStorage
  render();     // update UI
  clearForm();  // reset the form

  showToast('✅', `${currentType === 'income' ? 'Income' : 'Expense'} added successfully!`);
}


// ── Delete a transaction ──────────────────────
function deleteTransaction(id) {
  // keep all transactions except the one with this id
  transactions = transactions.filter(tx => tx.id !== id);

>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  saveData();
  render();
  showToast('🗑️', 'Transaction deleted!');
}

<<<<<<< HEAD
=======

// ── Save data to localStorage ─────────────────
// localStorage keeps data even after browser is closed
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
function saveData() {
  localStorage.setItem('financeData', JSON.stringify(transactions));
}

<<<<<<< HEAD
=======

// ── Clear the form after adding ───────────────
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
function clearForm() {
  document.getElementById('desc').value     = '';
  document.getElementById('amount').value   = '';
  document.getElementById('category').value = '';
<<<<<<< HEAD
  document.getElementById('txDate').valueAsDate = new Date();
}

function filterTx(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

=======
  // reset date back to today
  document.getElementById('txDate').valueAsDate = new Date();
}


// ── Filter transactions by type or category ───
function filterTx(filter, btn) {
  currentFilter = filter;

  // remove active class from all filter buttons
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

  // add active class to the clicked button
  btn.classList.add('active');

  // re-render just the list with the new filter
  renderList();
}


// ── Main render function ──────────────────────
// calls all the update functions together
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
function render() {
  updateSummary();
  updateChart();
  renderList();
}

<<<<<<< HEAD
function updateSummary() {
  let totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  let totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  let balance = totalIncome - totalExpense;

=======

// ── Update summary cards ──────────────────────
function updateSummary() {
  // add up all income transactions
  let totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // add up all expense transactions
  let totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // balance = income minus expenses
  let balance = totalIncome - totalExpense;

  // update the DOM with formatted Indian currency
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  document.getElementById('incomeAmt').textContent  = '₹' + totalIncome.toLocaleString('en-IN');
  document.getElementById('expenseAmt').textContent = '₹' + totalExpense.toLocaleString('en-IN');
  document.getElementById('balanceAmt').textContent = '₹' + balance.toLocaleString('en-IN');

<<<<<<< HEAD
  let balEl = document.getElementById('balanceAmt');
  balEl.style.color = balance < 0 ? 'var(--red)' : 'var(--accent)';
}

=======
  // turn balance red if they spent more than they earned
  let balEl = document.getElementById('balanceAmt');
  balEl.style.color = balance < 0 ? 'var(--accent-red)' : 'var(--accent-blue)';
}


// ── Update pie chart ──────────────────────────
// shows expenses broken down by category
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
function updateChart() {
  let expenses = transactions.filter(t => t.type === 'expense');
  let canvas   = document.getElementById('pieChart');
  let empty    = document.getElementById('chartEmpty');

<<<<<<< HEAD
  if (expenses.length === 0) {
    canvas.style.display = 'none';
    empty.style.display  = 'block';
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    return;
  }

=======
  // if no expenses, show empty state message
  if (expenses.length === 0) {
    canvas.style.display = 'none';
    empty.style.display  = 'block';

    // destroy old chart if it exists
    if (pieChart) {
      pieChart.destroy();
      pieChart = null;
    }
    return;
  }

  // group expenses by category and sum their amounts
  // e.g. { Food: 500, Transport: 200 }
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  let grouped = {};
  expenses.forEach(tx => {
    grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
  });

<<<<<<< HEAD
  let labels = Object.keys(grouped);
  let data   = Object.values(grouped);

  canvas.style.display = 'block';
  empty.style.display  = 'none';

=======
  let labels = Object.keys(grouped);   // category names
  let data   = Object.values(grouped); // amounts

  // show canvas, hide empty message
  canvas.style.display = 'block';
  empty.style.display  = 'none';

  // always destroy old chart before creating new one
  // otherwise Chart.js throws a conflict error
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: chartColors.slice(0, labels.length),
        borderWidth: 2,
<<<<<<< HEAD
        borderColor: '#141c2e',
=======
        borderColor: '#151820',  // matches card background
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
<<<<<<< HEAD
            color: '#94a3b8',
            font: { family: 'Outfit', size: 12 },
=======
            color: '#7a8099',
            font: { family: 'DM Sans', size: 12 },
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
            padding: 16,
            boxWidth: 12,
            boxHeight: 12
          }
        },
        tooltip: {
          callbacks: {
<<<<<<< HEAD
=======
            // format tooltip to show rupee symbol
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
            label: ctx => ` ₹${ctx.parsed.toLocaleString('en-IN')}`
          }
        }
      },
<<<<<<< HEAD
      cutout: '62%'
=======
      cutout: '60%'  // makes it a doughnut instead of full pie
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
    }
  });
}

<<<<<<< HEAD
function renderList() {
  let list = document.getElementById('txList');
  list.innerHTML = '';

  let filtered = transactions;
  if (currentFilter === 'income' || currentFilter === 'expense') {
    filtered = transactions.filter(t => t.type === currentFilter);
  } else if (currentFilter !== 'all') {
    filtered = transactions.filter(t => t.category === currentFilter);
  }

=======

// ── Render the transaction list ───────────────
function renderList() {
  let list = document.getElementById('txList');
  list.innerHTML = ''; // clear old list

  // apply filter
  let filtered = transactions;

  if (currentFilter === 'income' || currentFilter === 'expense') {
    // filter by type
    filtered = transactions.filter(t => t.type === currentFilter);
  } else if (currentFilter !== 'all') {
    // filter by category name
    filtered = transactions.filter(t => t.category === currentFilter);
  }

  // show empty state if nothing matches
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="no-transactions">
        <div class="emoji">💸</div>
        <p>No transactions found</p>
      </div>
    `;
    return;
  }

<<<<<<< HEAD
  filtered.forEach(tx => {
    let icon   = categoryIcons[tx.category] || '📦';
    let sign   = tx.type === 'income' ? '+' : '-';
    let iconBg = tx.type === 'income'
      ? 'rgba(74,222,128,0.1)'
      : 'rgba(248,113,113,0.1)';

    let dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

=======
  // build each transaction row
  filtered.forEach(tx => {
    let icon  = categoryIcons[tx.category] || '📦';
    let sign  = tx.type === 'income' ? '+' : '-';

    // soft background color for icon box
    let iconBg = tx.type === 'income'
      ? 'rgba(0, 229, 160, 0.12)'
      : 'rgba(255, 79, 109, 0.12)';

    // format date like "12 Apr 2026"
    let dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // create div element and set its HTML
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
    let item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML = `
      <div class="tx-left">
<<<<<<< HEAD
        <div class="tx-icon" style="background:${iconBg}">${icon}</div>
        <div>
=======
        <div class="tx-icon" style="background: ${iconBg}">${icon}</div>
        <div class="tx-info">
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
          <div class="tx-name">${tx.desc}</div>
          <div class="tx-meta">${tx.category} · ${dateStr}</div>
        </div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${tx.type}">${sign}₹${tx.amount.toLocaleString('en-IN')}</div>
        <button class="del-btn" onclick="deleteTransaction(${tx.id})">✕</button>
      </div>
    `;
<<<<<<< HEAD
=======

>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
    list.appendChild(item);
  });
}

<<<<<<< HEAD
function showToast(icon, msg) {
  let toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
=======

// ── Show toast notification ───────────────────
// pops up at bottom right corner for 2.5 seconds
function showToast(icon, msg) {
  let toast = document.getElementById('toast');

  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;

  // add .show class to make it visible
  toast.classList.add('show');

  // remove .show after 2.5 seconds to hide it
  setTimeout(() => toast.classList.remove('show'), 2500);
}
>>>>>>> 60f21bd54bb44f5c1ecd29a15aee5a2d13a9215f
