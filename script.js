/* ==========================================================
   THEME SWITCHER
   ========================================================== */
const themeButtons = document.querySelectorAll('[data-theme-btn]');

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('calc-theme', theme);
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === theme);
  });
}

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.themeBtn));
});

// Load saved theme
const savedTheme = localStorage.getItem('calc-theme') || 'glass';
setTheme(savedTheme);

/* ==========================================================
   TAB NAVIGATION
   ========================================================== */
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
  });
});

/* ==========================================================
   CALCULATOR LOGIC
   ========================================================== */
const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
let currentInput = '0';
let history = '';

function updateDisplay() {
  currentEl.textContent = currentInput;
  historyEl.textContent = history;
}

function appendValue(value) {
  const operators = ['+', '-', '*', '/', '%'];
  const lastChar = currentInput.slice(-1);

  if (operators.includes(value) && operators.includes(lastChar)) {
    currentInput = currentInput.slice(0, -1) + value;
    updateDisplay();
    return;
  }

  if (value === '.') {
    const parts = currentInput.split(/[\+\-\*\/\%]/);
    const lastNumber = parts[parts.length - 1];
    if (lastNumber.includes('.')) return;
    if (lastNumber === '') {
      currentInput += '0.';
      updateDisplay();
      return;
    }
  }

  if (currentInput === '0' && !operators.includes(value) && value !== '.') {
    currentInput = value;
  } else if (currentInput === '0' && value === '.') {
    currentInput = '0.';
  } else {
    currentInput += value;
  }
  updateDisplay();
}

function clearAll() {
  currentInput = '0';
  history = '';
  updateDisplay();
}

function deleteLast() {
  if (currentInput.length === 1 || currentInput === '0') {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
    if (currentInput === '') currentInput = '0';
  }
  updateDisplay();
}

function calculate() {
  try {
    let expression = currentInput.replace(/%/g, '/100');
    let result = Function('"use strict";return (' + expression + ')')();
    if (!isFinite(result) || isNaN(result)) {
      currentEl.textContent = 'Error';
      currentInput = '0';
      return;
    }
    history = currentInput + ' =';
    currentInput = String(parseFloat(result.toFixed(10)));
    updateDisplay();
  } catch {
    currentEl.textContent = 'Error';
    currentInput = '0';
    history = '';
  }
}

// Keyboard support for calculator
document.addEventListener('keydown', (e) => {
  // only when calc tab is active
  if (!document.getElementById('calc-tab').classList.contains('active')) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  const key = e.key;
  if (!isNaN(key) && key !== ' ') appendValue(key);
  else if (['+', '-', '*', '/', '%', '.'].includes(key)) appendValue(key);
  else if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); }
  else if (key === 'Backspace') deleteLast();
  else if (key === 'Escape') clearAll();
});

updateDisplay();

/* ==========================================================
   CURRENCY CONVERTER
   ========================================================== */
const CURRENCIES = {
  USD: '🇺🇸 US Dollar', EUR: '🇪🇺 Euro', GBP: '🇬🇧 British Pound',
  INR: '🇮🇳 Indian Rupee', JPY: '🇯🇵 Japanese Yen', AUD: '🇦🇺 Australian Dollar',
  CAD: '🇨🇦 Canadian Dollar', CHF: '🇨🇭 Swiss Franc', CNY: '🇨🇳 Chinese Yuan',
  AED: '🇦🇪 UAE Dirham', SAR: '🇸🇦 Saudi Riyal', SGD: '🇸🇬 Singapore Dollar',
  HKD: '🇭🇰 Hong Kong Dollar', NZD: '🇳🇿 NZ Dollar', ZAR: '🇿🇦 South African Rand',
  RUB: '🇷🇺 Russian Ruble', BRL: '🇧🇷 Brazilian Real', MXN: '🇲🇽 Mexican Peso',
  KRW: '🇰🇷 South Korean Won', TRY: '🇹🇷 Turkish Lira', PKR: '🇵🇰 Pakistani Rupee',
  BDT: '🇧🇩 Bangladeshi Taka', LKR: '🇱🇰 Sri Lankan Rupee', NPR: '🇳🇵 Nepalese Rupee',
  THB: '🇹🇭 Thai Baht', IDR: '🇮🇩 Indonesian Rupiah', MYR: '🇲🇾 Malaysian Ringgit',
  PHP: '🇵🇭 Philippine Peso', VND: '🇻🇳 Vietnamese Dong', EGP: '🇪🇬 Egyptian Pound'
};

let exchangeRates = {};

function populateCurrencySelects() {
  const fromSel = document.getElementById('curr-from');
  const toSel = document.getElementById('curr-to');
  const options = Object.entries(CURRENCIES)
    .map(([code, name]) => `<option value="${code}">${name}</option>`)
    .join('');
  fromSel.innerHTML = options;
  toSel.innerHTML = options;
  fromSel.value = 'USD';
  toSel.value = 'INR';
}

async function fetchExchangeRates() {
  const note = document.getElementById('curr-note');
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates) {
      exchangeRates = data.rates;
      note.textContent = `✅ Rates updated: ${new Date(data.time_last_update_utc).toLocaleDateString()}`;
    } else {
      throw new Error('Invalid response');
    }
  } catch (err) {
    note.textContent = '⚠️ Live rates load nahi ho paayi. Internet check karo.';
  }
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById('curr-amount').value) || 0;
  const from = document.getElementById('curr-from').value;
  const to = document.getElementById('curr-to').value;
  const resultValue = document.querySelector('#curr-result .result-value');
  const resultRate = document.querySelector('#curr-result .result-rate');

  if (!exchangeRates[from] || !exchangeRates[to]) {
    resultValue.textContent = '⚠️ Rates unavailable';
    resultRate.textContent = '';
    return;
  }

  // Convert: from -> USD -> to
  const inUSD = amount / exchangeRates[from];
  const converted = inUSD * exchangeRates[to];
  const rate = exchangeRates[to] / exchangeRates[from];

  resultValue.textContent = `${converted.toFixed(2)} ${to}`;
  resultRate.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
}

function swapCurrencies() {
  const fromSel = document.getElementById('curr-from');
  const toSel = document.getElementById('curr-to');
  [fromSel.value, toSel.value] = [toSel.value, fromSel.value];
  convertCurrency();
}

// Live conversion on input change
document.getElementById('curr-amount').addEventListener('input', convertCurrency);
document.getElementById('curr-from').addEventListener('change', convertCurrency);
document.getElementById('curr-to').addEventListener('change', convertCurrency);

populateCurrencySelects();
fetchExchangeRates().then(convertCurrency);

/* ==========================================================
   UNIT CONVERTER
   ========================================================== */
const UNIT_DATA = {
  length: {
    name: 'Length',
    units: {
      mm: { label: 'Millimeter (mm)', toBase: 0.001 },
      cm: { label: 'Centimeter (cm)', toBase: 0.01 },
      m: { label: 'Meter (m)', toBase: 1 },
      km: { label: 'Kilometer (km)', toBase: 1000 },
      in: { label: 'Inch (in)', toBase: 0.0254 },
      ft: { label: 'Foot (ft)', toBase: 0.3048 },
      yd: { label: 'Yard (yd)', toBase: 0.9144 },
      mi: { label: 'Mile (mi)', toBase: 1609.344 },
      nmi: { label: 'Nautical Mile', toBase: 1852 }
    }
  },
  weight: {
    name: 'Weight',
    units: {
      mg: { label: 'Milligram (mg)', toBase: 0.000001 },
      g: { label: 'Gram (g)', toBase: 0.001 },
      kg: { label: 'Kilogram (kg)', toBase: 1 },
      t: { label: 'Metric Ton (t)', toBase: 1000 },
      oz: { label: 'Ounce (oz)', toBase: 0.0283495 },
      lb: { label: 'Pound (lb)', toBase: 0.453592 },
      st: { label: 'Stone (st)', toBase: 6.35029 }
    }
  },
  temperature: {
    name: 'Temperature',
    units: {
      C: { label: 'Celsius (°C)' },
      F: { label: 'Fahrenheit (°F)' },
      K: { label: 'Kelvin (K)' }
    }
  },
  area: {
    name: 'Area',
    units: {
      sqmm: { label: 'Square Millimeter (mm²)', toBase: 0.000001 },
      sqcm: { label: 'Square Centimeter (cm²)', toBase: 0.0001 },
      sqm: { label: 'Square Meter (m²)', toBase: 1 },
      sqkm: { label: 'Square Kilometer (km²)', toBase: 1000000 },
      sqft: { label: 'Square Foot (ft²)', toBase: 0.092903 },
      sqyd: { label: 'Square Yard (yd²)', toBase: 0.836127 },
      acre: { label: 'Acre', toBase: 4046.86 },
      ha: { label: 'Hectare', toBase: 10000 }
    }
  },
  speed: {
    name: 'Speed',
    units: {
      mps: { label: 'Meter/sec (m/s)', toBase: 1 },
      kmph: { label: 'Kilometer/hour (km/h)', toBase: 0.277778 },
      mph: { label: 'Miles/hour (mph)', toBase: 0.44704 },
      knot: { label: 'Knot (kn)', toBase: 0.514444 },
      fps: { label: 'Foot/sec (ft/s)', toBase: 0.3048 }
    }
  },
  time: {
    name: 'Time',
    units: {
      ms: { label: 'Millisecond (ms)', toBase: 0.001 },
      s: { label: 'Second (s)', toBase: 1 },
      min: { label: 'Minute (min)', toBase: 60 },
      hr: { label: 'Hour (hr)', toBase: 3600 },
      day: { label: 'Day', toBase: 86400 },
      week: { label: 'Week', toBase: 604800 },
      month: { label: 'Month (30d)', toBase: 2592000 },
      year: { label: 'Year (365d)', toBase: 31536000 }
    }
  }
};

function loadUnitOptions() {
  const category = document.getElementById('unit-category').value;
  const fromSel = document.getElementById('unit-from');
  const toSel = document.getElementById('unit-to');
  const units = UNIT_DATA[category].units;
  const options = Object.entries(units)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
    .join('');
  fromSel.innerHTML = options;
  toSel.innerHTML = options;
  const keys = Object.keys(units);
  fromSel.value = keys[0];
  toSel.value = keys[1] || keys[0];
  convertUnits();
}

function convertUnits() {
  const category = document.getElementById('unit-category').value;
  const value = parseFloat(document.getElementById('unit-value').value) || 0;
  const from = document.getElementById('unit-from').value;
  const to = document.getElementById('unit-to').value;
  const resultValue = document.querySelector('#unit-result .result-value');

  let result;

  if (category === 'temperature') {
    // Temperature special handling
    let celsius;
    if (from === 'C') celsius = value;
    else if (from === 'F') celsius = (value - 32) * 5 / 9;
    else if (from === 'K') celsius = value - 273.15;

    if (to === 'C') result = celsius;
    else if (to === 'F') result = celsius * 9 / 5 + 32;
    else if (to === 'K') result = celsius + 273.15;
  } else {
    const fromFactor = UNIT_DATA[category].units[from].toBase;
    const toFactor = UNIT_DATA[category].units[to].toBase;
    result = (value * fromFactor) / toFactor;
  }

  // Format result nicely
  let formatted;
  if (Math.abs(result) >= 1e9 || (Math.abs(result) < 1e-4 && result !== 0)) {
    formatted = result.toExponential(4);
  } else {
    formatted = parseFloat(result.toFixed(8)).toString();
  }
  resultValue.textContent = formatted;
}

function swapUnits() {
  const fromSel = document.getElementById('unit-from');
  const toSel = document.getElementById('unit-to');
  [fromSel.value, toSel.value] = [toSel.value, fromSel.value];
  convertUnits();
}

// Live conversion
document.getElementById('unit-value').addEventListener('input', convertUnits);

// Initial load
loadUnitOptions();