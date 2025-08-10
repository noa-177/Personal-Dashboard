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
