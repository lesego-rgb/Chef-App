const courseOptions = ['Starter', 'Main', 'Side', 'Dessert', 'Drink', 'Amuse-bouche'];
const starterDishes = [
  { id: 1, name: 'Roasted tomato & ricotta', description: 'Warm sourdough, basil oil, and sea salt.', course: 'Starter', price: 14 },
  { id: 2, name: 'Citrus-cured salmon', description: 'Fennel, pickled mustard seed, dill crème fraîche.', course: 'Starter', price: 18 },
  { id: 3, name: 'Miso butter cod', description: 'Spring peas, charred leek, and sesame broth.', course: 'Main', price: 29 },
  { id: 4, name: 'Herb-crusted chicken', description: 'Young carrots, pan jus, and tarragon.', course: 'Main', price: 26 },
  { id: 5, name: 'Dark chocolate pot de crème', description: 'Espresso cream, cacao nib, and flaky salt.', course: 'Dessert', price: 12 },
  { id: 6, name: 'Crisp potatoes', description: 'Rosemary, smoked aioli, and chive.', course: 'Side', price: 9 }
];

const state = { dishes: loadDishes(), filter: 'All', search: '' };
const elements = {
  grid: document.querySelector('#dish-grid'), empty: document.querySelector('#empty-state'),
  total: document.querySelector('#total-items'), courses: document.querySelector('#course-count'), average: document.querySelector('#average-price'),
  modal: document.querySelector('#modal-backdrop'), form: document.querySelector('#dish-form'), id: document.querySelector('#dish-id'), name: document.querySelector('#dish-name'),
  description: document.querySelector('#dish-description'), course: document.querySelector('#dish-course'), price: document.querySelector('#dish-price'), modalTitle: document.querySelector('#modal-title'), toast: document.querySelector('#toast')
};

function loadDishes() {
  try {
    const saved = JSON.parse(localStorage.getItem('table-thyme-dishes'));
    return Array.isArray(saved) ? saved : starterDishes;
  } catch (_) { return starterDishes; }
}
function saveDishes() { localStorage.setItem('table-thyme-dishes', JSON.stringify(state.dishes)); }
function formatPrice(price) { return `$${Number(price).toFixed(2).replace('.00', '')}`; }
function filteredDishes() {
  const query = state.search.trim().toLowerCase();
  return state.dishes.filter((dish) => (state.filter === 'All' || dish.course === state.filter) && (!query || `${dish.name} ${dish.description}`.toLowerCase().includes(query)));
}
function render() {
  const visible = filteredDishes();
  elements.grid.innerHTML = visible.map((dish) => `<article class="dish-card" style="--card-color: ${colorFor(dish.course)}"><span class="course-tag">${escapeHtml(dish.course)}</span><h3>${escapeHtml(dish.name)}</h3><p>${escapeHtml(dish.description)}</p><div class="dish-footer"><span class="price">${formatPrice(dish.price)}</span><div class="card-actions"><button class="icon-button edit-dish" data-id="${dish.id}" type="button" aria-label="Edit ${escapeHtml(dish.name)}">&#9998;</button><button class="icon-button delete-dish" data-id="${dish.id}" type="button" aria-label="Delete ${escapeHtml(dish.name)}">&#10005;</button></div></div></article>`).join('');
  elements.empty.hidden = visible.length !== 0;
  elements.grid.hidden = visible.length === 0;
  elements.total.textContent = state.dishes.length;
  elements.courses.textContent = new Set(state.dishes.map((dish) => dish.course)).size;
  const average = state.dishes.length ? state.dishes.reduce((sum, dish) => sum + Number(dish.price), 0) / state.dishes.length : 0;
  elements.average.textContent = formatPrice(average);
}
function colorFor(course) { return { Starter: '#bfd1b9', Main: '#e7bd9d', Dessert: '#e6d886', Side: '#c4d6df', Drink: '#d9c1d9', 'Amuse-bouche': '#f0bcb0' }[course] || '#bfd1b9'; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function openModal(dish) {
  elements.form.reset();
  elements.id.value = dish ? dish.id : '';
  elements.modalTitle.textContent = dish ? 'Edit a dish' : 'Create a dish';
  if (dish) { elements.name.value = dish.name; elements.description.value = dish.description; elements.course.value = dish.course; elements.price.value = dish.price; }
  elements.modal.hidden = false;
  elements.name.focus();
}
function closeModal() { elements.modal.hidden = true; elements.form.reset(); }
function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add('visible'); window.setTimeout(() => elements.toast.classList.remove('visible'), 2300); }

courseOptions.forEach((course) => elements.course.add(new Option(course, course)));
document.querySelector('#open-add').addEventListener('click', () => openModal());
document.querySelector('#empty-add').addEventListener('click', () => openModal());
document.querySelector('#close-modal').addEventListener('click', closeModal);
document.querySelector('#cancel-modal').addEventListener('click', closeModal);
elements.modal.addEventListener('click', (event) => { if (event.target === elements.modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !elements.modal.hidden) closeModal(); });
document.querySelector('#course-filters').addEventListener('click', (event) => { const filter = event.target.closest('.filter'); if (!filter) return; state.filter = filter.dataset.filter; document.querySelectorAll('.filter').forEach((button) => button.classList.toggle('active', button === filter)); render(); });
document.querySelector('#search-input').addEventListener('input', (event) => { state.search = event.target.value; render(); });
elements.grid.addEventListener('click', (event) => {
  const button = event.target.closest('button'); if (!button) return;
  const id = Number(button.dataset.id); const dish = state.dishes.find((item) => item.id === id);
  if (button.classList.contains('edit-dish')) openModal(dish);
  if (button.classList.contains('delete-dish') && dish && window.confirm(`Remove ${dish.name} from your menu?`)) { state.dishes = state.dishes.filter((item) => item.id !== id); saveDishes(); render(); showToast('Dish removed from your menu'); }
});
elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = Number(elements.id.value); const data = { name: elements.name.value.trim(), description: elements.description.value.trim(), course: elements.course.value, price: Number(elements.price.value) };
  if (id) { state.dishes = state.dishes.map((dish) => dish.id === id ? { ...dish, ...data } : dish); showToast('Dish updated'); } else { state.dishes.push({ id: Date.now(), ...data }); showToast('Dish added to your menu'); }
  saveDishes(); render(); closeModal();
});
render();
