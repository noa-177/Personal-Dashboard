//const API_KEY = "8491557dd2fc3c6f6c46f401b5e99c57"; // CurrencyLayer API Key

// DOM Elements
const form = document.getElementById('budget-form');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const salaryInput = document.getElementById('salary-input');
const currencySelect = document.getElementById('currency-select');

const cardSalary = document.getElementById('card-salary');
const cardExpenses = document.getElementById('card-expenses');
const cardRemaining = document.getElementById('card-remaining');

// LocalStorage helpers
function getData() {
  return JSON.parse(localStorage.getItem('budgetData')) || [];
}
function saveData(data) {
  localStorage.setItem('budgetData', JSON.stringify(data));
}

// Category color
function getCategoryColor(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
}
// ---- DataTable ----
let expenseTable;
function initDataTable() {
  expenseTable = $('#expense-table').DataTable();
}

// ---- Update Table ----
function updateExpenseList() {
  const expenses = getData().filter(i => i.type === 'expense');

  expenseTable.clear(); // Clear table
  expenses.forEach((item, index) => {
    expenseTable.row.add([
      `<strong>${item.category}</strong>`,
      item.amount.toFixed(2),
      `<button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>`
    ]);
  });
  expenseTable.draw();
}

// ---- Salary ----
function setSalary() {
  const salary = parseFloat(salaryInput.value);
  if (!isNaN(salary)) {
    const data = getData().filter(item => item.type !== 'salary');
    data.unshift({ type: 'salary', amount: salary, category: 'Salary' });
    saveData(data);
    refreshUI();
  } else {
    alert('Please enter a valid salary.');
  }
}

// ---- Add Expense ----
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const newItem = {
    id: Date.now(), // <-- unique ID
    category: categoryInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: 'expense'
  };
  if (!isNaN(newItem.amount) && newItem.category) {
    const data = getData();
    data.push(newItem);
    saveData(data);
    refreshUI();
    form.reset();
  } else {
    alert('Please enter a valid category and amount.');
  }
});

// ---- Update Table ----
function updateExpenseList() {
  const expenses = getData().filter(i => i.type === 'expense');

  expenseTable.clear();
  expenses.forEach((item) => {
    expenseTable.row.add([
      `<strong>${item.category}</strong>`,
      item.amount.toFixed(2),
      `<button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">Delete</button>`
    ]);
  });
  expenseTable.draw();
}

// ---- Delete Expense ----
$('#expense-table').on('click', '.delete-btn', function() {
  const id = $(this).data('id'); // <-- use unique ID
  let data = getData();
  data = data.filter(item => item.id !== id); // <-- delete by ID
  saveData(data);
  refreshUI();
});

// ---- Charts ----
function updateCharts() {
  const data = getData();
  const salaryItem = data.find(i => i.type === 'salary');
  const salary = salaryItem ? salaryItem.amount : 0;
  const expenses = data.filter(i => i.type === 'expense');
  const totalExpenses = expenses.reduce((sum, i) => sum + i.amount, 0);

  const categories = {};
  expenses.forEach(i => {
    categories[i.category] = (categories[i.category] || 0) + i.amount;
  });

  const categoryData = Object.entries(categories).map(([category, amount]) => ({
    name: category,
    y: amount,
    color: getCategoryColor(category)
  }));

  Highcharts.chart('pie-chart', {
    chart: { type: 'pie' },
    title: { text: 'Budget Breakdown' },
    series: [{
      name: 'Budget',
      data: [
        ...categoryData,
        { name: 'Remaining', y: Math.max(salary - totalExpenses, 0), color: '#999' }
      ]
    }]
  });

  Highcharts.chart('bar-chart', {
    chart: { type: 'column' },
    title: { text: 'Expenses by Category' },
    xAxis: { categories: Object.keys(categories) },
    yAxis: { title: { text: 'Amount' } },
    series: [{ name: 'Expense', data: categoryData }]
  });
}

// ---- Currency Conversion ----
async function fetchCurrencyRates() {
  const url = `https://api.currencylayer.com/live?access_key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error.info);
  return data.quotes;
}
async function updateConvertedBalance() {
  const data = getData();
  const salaryItem = data.find(i => i.type === 'salary');
  const salary = salaryItem ? salaryItem.amount : 0;
  const expenses = data.filter(i => i.type === 'expense');
  const totalExpenses = expenses.reduce((sum, i) => sum + i.amount, 0);
  const remainingETB = salary - totalExpenses;
  const selectedCurrency = currencySelect.value;

  cardSalary.innerText = `${salary.toFixed(2)} ETB`;
  cardExpenses.innerText = `${totalExpenses.toFixed(2)} ETB`;
  cardRemaining.innerText = `${remainingETB.toFixed(2)} ETB`;

  try {
    const rates = await fetchCurrencyRates();
    const usdToEtb = rates["USDETB"];
    if (!usdToEtb) return;

    if (selectedCurrency === "ETB") {
      document.getElementById("converted-balance").innerText =
        `Remaining balance: ${remainingETB.toFixed(2)} ETB`;
      return;
    }

    const usdToTarget = rates["USD" + selectedCurrency];
    if (!usdToTarget) return;

    const remainingInUSD = remainingETB / usdToEtb;
    const converted = (remainingInUSD * usdToTarget).toFixed(2);

    document.getElementById("converted-balance").innerText =
      `Remaining balance: ${remainingETB.toFixed(2)} ETB ≈ ${converted} ${selectedCurrency}`;
    cardRemaining.innerText =
      `${remainingETB.toFixed(2)} ETB ≈ ${converted} ${selectedCurrency}`;
  } catch {
    document.getElementById("converted-balance").innerText =
      `Remaining balance: ${remainingETB.toFixed(2)} ETB (conversion unavailable)`;
  }
}

// ---- Clear All ----
function clearAll() {
  if (confirm('Are you sure you want to clear all expenses?')) {
    let data = getData().filter(item => item.type === 'salary');
    saveData(data);
    refreshUI();
    alert("All expenses have been cleared!");
  }
}

$(document).ready(() => {
  initDataTable();
  refreshUI();
});
document.getElementById('clear-storage').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all stored data?')) {
    localStorage.removeItem('budgetData');
    refreshUI(); // Refresh charts, table, and balance
    alert('All data cleared!');
  }
});
