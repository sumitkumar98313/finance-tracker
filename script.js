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
var transactions = JSON.parse(localStorage.getItem('financeData')) || [];

// tracks which toggle is selected (income or expense)
var currentType = 'income';

// tracks which filter button is active
var currentFilter = 'all';

// chart instance - we need this to destroy old chart before making new one
var pieChart = null;


// ── Category emoji map ────────────────────────
// used to show emoji icon next to each transaction
var categoryIcons = {
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
var chartColors = [
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

  var incBtn = document.getElementById('incomeBtn');
  var expBtn = document.getElementById('expenseBtn');

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
  var desc     = document.getElementById('desc').value.trim();
  var amount   = parseFloat(document.getElementById('amount').value);
  var category = document.getElementById('category').value;
  var date     = document.getElementById('txDate').value;

  // check all fields are filled
  if (!desc || !amount || amount <= 0 || !category || !date) {
    showToast('⚠️', 'Please fill in all fields!');
    return; // stop here if validation fails
  }

  // build a transaction object
  var tx = {
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

  showToast('✅', currentType === 'income' ? 'Income added successfully!' : 'Expense added successfully!');
}


// ── Delete a transaction ──────────────────────
function deleteTransaction(id) {
  // keep all transactions except the one with this id
  var filtered = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].id !== id) {
      filtered.push(transactions[i]);
    }
  }
  transactions = filtered;

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
  var allBtns = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < allBtns.length; i++) {
    allBtns[i].classList.remove('active');
  }

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
  var totalIncome = 0;
  var totalExpense = 0;

  // loop through and add up income and expenses separately
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome = totalIncome + transactions[i].amount;
    } else {
      totalExpense = totalExpense + transactions[i].amount;
    }
  }

  // balance = income minus expenses
  var balance = totalIncome - totalExpense;

  // update the DOM with formatted Indian currency
  document.getElementById('incomeAmt').textContent  = '₹' + totalIncome.toLocaleString('en-IN');
  document.getElementById('expenseAmt').textContent = '₹' + totalExpense.toLocaleString('en-IN');
  document.getElementById('balanceAmt').textContent = '₹' + balance.toLocaleString('en-IN');

  // turn balance red if they spent more than they earned
  var balEl = document.getElementById('balanceAmt');
  if (balance < 0) {
    balEl.style.color = 'var(--accent-red)';
  } else {
    balEl.style.color = 'var(--accent-blue)';
  }
}


// ── Update pie chart ──────────────────────────
// shows expenses broken down by category
function updateChart() {
  var expenses = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'expense') {
      expenses.push(transactions[i]);
    }
  }

  var canvas = document.getElementById('pieChart');
  var empty  = document.getElementById('chartEmpty');

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
  var grouped = {};
  for (var i = 0; i < expenses.length; i++) {
    var cat = expenses[i].category;
    if (grouped[cat]) {
      grouped[cat] = grouped[cat] + expenses[i].amount;
    } else {
      grouped[cat] = expenses[i].amount;
    }
  }

  var labels = Object.keys(grouped);   // category names
  var data   = Object.values(grouped); // amounts

  // show canvas, hide empty message
  canvas.style.display = 'block';
  empty.style.display  = 'none';

  // always destroy old chart before creating new one
  // otherwise Chart.js throws a conflict error
  if (pieChart) {
    pieChart.destroy();
  }

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
            label: function(ctx) {
              return ' ₹' + ctx.parsed.toLocaleString('en-IN');
            }
          }
        }
      },
      cutout: '60%'  // makes it a doughnut instead of full pie
    }
  });
}


// ── Render the transaction list ───────────────
function renderList() {
  var list = document.getElementById('txList');
  list.innerHTML = ''; // clear old list

  // apply filter
  var filtered = [];

  if (currentFilter === 'all') {
    // show everything
    filtered = transactions;
  } else if (currentFilter === 'income' || currentFilter === 'expense') {
    // filter by type
    for (var i = 0; i < transactions.length; i++) {
      if (transactions[i].type === currentFilter) {
        filtered.push(transactions[i]);
      }
    }
  } else {
    // filter by category name
    for (var i = 0; i < transactions.length; i++) {
      if (transactions[i].category === currentFilter) {
        filtered.push(transactions[i]);
      }
    }
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
  for (var i = 0; i < filtered.length; i++) {
    var tx = filtered[i];
    var icon = categoryIcons[tx.category] || '📦';
    var sign = tx.type === 'income' ? '+' : '-';

    // soft background color for icon box
    var iconBg = '';
    if (tx.type === 'income') {
      iconBg = 'rgba(0, 229, 160, 0.12)';
    } else {
      iconBg = 'rgba(255, 79, 109, 0.12)';
    }

    // format date like "12 Apr 2026"
    var dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // create div element and set its HTML
    var item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML =
      '<div class="tx-left">' +
        '<div class="tx-icon" style="background: ' + iconBg + '">' + icon + '</div>' +
        '<div class="tx-info">' +
          '<div class="tx-name">' + tx.desc + '</div>' +
          '<div class="tx-meta">' + tx.category + ' · ' + dateStr + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tx-right">' +
        '<div class="tx-amount ' + tx.type + '">' + sign + '₹' + tx.amount.toLocaleString('en-IN') + '</div>' +
        '<button class="del-btn" onclick="deleteTransaction(' + tx.id + ')">✕</button>' +
      '</div>';

    list.appendChild(item);
  }
}


// ── Show toast notification ───────────────────
// pops up at bottom right corner for 2.5 seconds
function showToast(icon, msg) {
  var toast = document.getElementById('toast');

  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;

  // add .show class to make it visible
  toast.classList.add('show');

  // remove .show after 2.5 seconds to hide it
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2500);
}