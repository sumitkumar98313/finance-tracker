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
  if (type === 'income') {
    incBtn.className = 'type-btn active-income';
  } else {
    expBtn.className = 'type-btn active-expense';
  }
}


// ── Add a new transaction ─────────────────────
function addTransaction() {
  // grab values from form inputs
  let desc     = document.getElementById('desc').value.trim();
  let amount   = parseFloat(document.getElementById('amount').value);
  let category = document.getElementById('category').value;
  let date     = document.getElementById('txDate').value;

  // check all fields are filled
  if (!desc || !amount || amount <= 0 || !category || !date) {
    showToast('⚠️', 'Please fill in all fields!');
    return; // stop here if validation fails
  }

  // build a transaction object
  let tx = {
    id: Date.now(),       // unique id using current timestamp
    type: currentType,    // 'income' or 'expense'
    desc: desc,
    amount: amount,
    category: category,
    date: date
  };

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

  saveData();
  render();
  showToast('🗑️', 'Transaction deleted!');
}


// ── Save data to localStorage ─────────────────
// localStorage keeps data even after browser is closed
function saveData() {
  localStorage.setItem('financeData', JSON.stringify(transactions));
}


// ── Clear the form after adding ───────────────
function clearForm() {
  document.getElementById('desc').value     = '';
  document.getElementById('amount').value   = '';
  document.getElementById('category').value = '';
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
function render() {
  updateSummary();
  updateChart();
  renderList();
}


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
  document.getElementById('incomeAmt').textContent  = '₹' + totalIncome.toLocaleString('en-IN');
  document.getElementById('expenseAmt').textContent = '₹' + totalExpense.toLocaleString('en-IN');
  document.getElementById('balanceAmt').textContent = '₹' + balance.toLocaleString('en-IN');

  // turn balance red if they spent more than they earned
  let balEl = document.getElementById('balanceAmt');
  balEl.style.color = balance < 0 ? 'var(--accent-red)' : 'var(--accent-blue)';
}


// ── Update pie chart ──────────────────────────
// shows expenses broken down by category
function updateChart() {
  let expenses = transactions.filter(t => t.type === 'expense');
  let canvas   = document.getElementById('pieChart');
  let empty    = document.getElementById('chartEmpty');

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
  let grouped = {};
  expenses.forEach(tx => {
    grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
  });

  let labels = Object.keys(grouped);   // category names
  let data   = Object.values(grouped); // amounts

  // show canvas, hide empty message
  canvas.style.display = 'block';
  empty.style.display  = 'none';

  // always destroy old chart before creating new one
  // otherwise Chart.js throws a conflict error
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: chartColors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#151820',  // matches card background
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#7a8099',
            font: { family: 'DM Sans', size: 12 },
            padding: 16,
            boxWidth: 12,
            boxHeight: 12
          }
        },
        tooltip: {
          callbacks: {
            // format tooltip to show rupee symbol
            label: ctx => ` ₹${ctx.parsed.toLocaleString('en-IN')}`
          }
        }
      },
      cutout: '60%'  // makes it a doughnut instead of full pie
    }
  });
}


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
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="no-transactions">
        <div class="emoji">💸</div>
        <p>No transactions found</p>
      </div>
    `;
    return;
  }

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
    let item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML = `
      <div class="tx-left">
        <div class="tx-icon" style="background: ${iconBg}">${icon}</div>
        <div class="tx-info">
          <div class="tx-name">${tx.desc}</div>
          <div class="tx-meta">${tx.category} · ${dateStr}</div>
        </div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${tx.type}">${sign}₹${tx.amount.toLocaleString('en-IN')}</div>
        <button class="del-btn" onclick="deleteTransaction(${tx.id})">✕</button>
      </div>
    `;

    list.appendChild(item);
  });
}


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
