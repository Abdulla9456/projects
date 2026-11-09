// Данные для воспроизводимой учебной демонстрации.
const TODAY = {year: 2026, month: 10, day: 16};
const TIMES = ['09:00', '10:30', '12:00', '14:30', '16:00', '18:00'];
const state = {year: TODAY.year, month: TODAY.month, selected: {...TODAY}, time: null};
const dateNumber = date => date.year * 10000 + (date.month + 1) * 100 + date.day;
const asDate = date => new Date(date.year, date.month, date.day);
const fullDate = date => new Intl.DateTimeFormat('ru-RU', {weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(asDate(date));
const shortDate = date => new Intl.DateTimeFormat('ru-RU', {day:'numeric',month:'long',weekday:'long'}).format(asDate(date));
const readSlots = date => TIMES.map(time => ({time, available: date.day % 2 === 0 && !['12:00','16:00'].includes(time)}));

function monthCells(year, month) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({length: Math.ceil((offset + count) / 7) * 7}, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= count ? day : null;
  });
}

function renderCalendar() {
  document.querySelector('#month-title').textContent = new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(new Date(state.year,state.month,1));
  const grid = document.querySelector('#calendar-days');
  grid.innerHTML = monthCells(state.year,state.month).map(day => {
    if (!day) return '<span class="empty" aria-hidden="true"></span>';
    const date = {year:state.year,month:state.month,day};
    const selected = dateNumber(date) === dateNumber(state.selected);
    const past = dateNumber(date) < dateNumber(TODAY);
    return `<button type="button" class="day${selected?' selected':''}" data-day="${day}" aria-pressed="${selected}" aria-label="${fullDate(date)}" ${past?'disabled':''}>${day}</button>`;
  }).join('');
  grid.querySelectorAll('button').forEach(button => button.addEventListener('click', event => {
    state.selected = {year:state.year,month:state.month,day:Number(event.currentTarget.dataset.day)};
    state.time = null;
    document.querySelector('#feedback').hidden = true;
    renderCalendar(); renderSlots(); updateSelection();
  }));
}

function renderSlots() {
  document.querySelector('#date-title').textContent = shortDate(state.selected);
  const slots = readSlots(state.selected);
  const available = slots.some(slot => slot.available);
  document.querySelector('#no-slots').hidden = available;
  const container = document.querySelector('#time-slots');
  container.innerHTML = available ? slots.map(slot => `<button type="button" class="slot${state.time===slot.time?' selected':''}" data-time="${slot.time}" aria-pressed="${state.time===slot.time}" ${slot.available?'':'disabled'}>${slot.time}${slot.available?'':' · занято'}</button>`).join('') : '';
  container.querySelectorAll('button').forEach(button => button.addEventListener('click', event => {
    state.time = event.currentTarget.dataset.time;
    document.querySelector('#feedback').hidden = true;
    renderSlots(); updateSelection();
  }));
}

function updateSelection() {
  document.querySelector('#selection-text').textContent = `${fullDate(state.selected)} · ${state.time || 'выберите время'}`;
  document.querySelector('#continue').disabled = !state.time;
}

function init() {
  document.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', event => {
    const next = new Date(state.year,state.month + Number(event.currentTarget.dataset.month),1);
    state.year = next.getFullYear(); state.month = next.getMonth(); renderCalendar();
  }));
  document.querySelector('#reset-time').addEventListener('click', () => {state.time=null;renderSlots();updateSelection();document.querySelector('#feedback').hidden=true;});
  document.querySelector('#continue').addEventListener('click', () => {
    const feedback = document.querySelector('#feedback');
    feedback.textContent = `Вы выбрали: ${fullDate(state.selected)} в ${state.time}. Роман Соколов · Стрижка и укладка · 60 минут · 2 400 ₽. Следующий шаг — контактные данные.`;
    feedback.hidden = false;
  });
  renderCalendar(); renderSlots(); updateSelection();
}
document.addEventListener('DOMContentLoaded',init);
