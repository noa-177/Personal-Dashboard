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
