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
  if (type === 'income') {
    incBtn.className = 'type-btn active-income';
  } else {
    expBtn.className = 'type-btn active-expense';
  }
}

function addTransaction() {
  let desc     = document.getElementById('desc').value.trim();
  let amount   = parseFloat(document.getElementById('amount').value);
  let category = document.getElementById('category').value;
  let date     = document.getElementById('txDate').value;

  if (!desc || !amount || amount <= 0 || !category || !date) {
    showToast('⚠️', 'Please fill in all fields!');
    return;
  }

  let tx = {
    id: Date.now(),
    type: currentType,
    desc: desc,
    amount: amount,
    category: category,
    date: date
  };

  transactions.unshift(tx);
  saveData();
  render();
  clearForm();
  showToast('✅', `${currentType === 'income' ? 'Income' : 'Expense'} added!`);
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveData();
  render();
  showToast('🗑️', 'Transaction deleted!');
}

function saveData() {
  localStorage.setItem('financeData', JSON.stringify(transactions));
}

function clearForm() {
  document.getElementById('desc').value     = '';
  document.getElementById('amount').value   = '';
  document.getElementById('category').value = '';
  document.getElementById('txDate').valueAsDate = new Date();
}

function filterTx(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

function render() {
  updateSummary();
  updateChart();
  renderList();
}

function updateSummary() {
  let totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  let totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  let balance = totalIncome - totalExpense;

  document.getElementById('incomeAmt').textContent  = '₹' + totalIncome.toLocaleString('en-IN');
  document.getElementById('expenseAmt').textContent = '₹' + totalExpense.toLocaleString('en-IN');
  document.getElementById('balanceAmt').textContent = '₹' + balance.toLocaleString('en-IN');

  let balEl = document.getElementById('balanceAmt');
  balEl.style.color = balance < 0 ? 'var(--red)' : 'var(--accent)';
}

function updateChart() {
  let expenses = transactions.filter(t => t.type === 'expense');
  let canvas   = document.getElementById('pieChart');
  let empty    = document.getElementById('chartEmpty');

  if (expenses.length === 0) {
    canvas.style.display = 'none';
    empty.style.display  = 'block';
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    return;
  }

  let grouped = {};
  expenses.forEach(tx => {
    grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
  });

  let labels = Object.keys(grouped);
  let data   = Object.values(grouped);

  canvas.style.display = 'block';
  empty.style.display  = 'none';

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: chartColors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#141c2e',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Outfit', size: 12 },
            padding: 16,
            boxWidth: 12,
            boxHeight: 12
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ₹${ctx.parsed.toLocaleString('en-IN')}`
          }
        }
      },
      cutout: '62%'
    }
  });
}

function renderList() {
  let list = document.getElementById('txList');
  list.innerHTML = '';

  let filtered = transactions;
  if (currentFilter === 'income' || currentFilter === 'expense') {
    filtered = transactions.filter(t => t.type === currentFilter);
  } else if (currentFilter !== 'all') {
    filtered = transactions.filter(t => t.category === currentFilter);
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="no-transactions">
        <div class="emoji">💸</div>
        <p>No transactions found</p>
      </div>
    `;
    return;
  }

  filtered.forEach(tx => {
    let icon   = categoryIcons[tx.category] || '📦';
    let sign   = tx.type === 'income' ? '+' : '-';
    let iconBg = tx.type === 'income'
      ? 'rgba(74,222,128,0.1)'
      : 'rgba(248,113,113,0.1)';

    let dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    let item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML = `
      <div class="tx-left">
        <div class="tx-icon" style="background:${iconBg}">${icon}</div>
        <div>
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

function showToast(icon, msg) {
  let toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}