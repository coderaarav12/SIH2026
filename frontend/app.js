const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const themeToggle = document.getElementById('themeToggle');
const fakeUpload = document.getElementById('fakeUpload');

const items = [
  { name: 'Stainless Steel Hex Bolt M10 x 50', status: 'Canonical', score: '92% match' },
  { name: 'Hex Bolt SS304 10 mm x 50 mm', status: 'Equivalent', score: '88% match' },
  { name: 'MS Bolt 10 x 50', status: 'Needs review', score: '41% match' },
  { name: 'Hex Nut Stainless Steel M10', status: 'Canonical', score: '95% match' },
];

function renderResults(query = '') {
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  searchResults.innerHTML = filtered.length
    ? filtered
        .map(
          (item) => `
            <div class="result-row">
              <strong>${item.name}</strong>
              <span>${item.status} • ${item.score}</span>
            </div>`
        )
        .join('')
    : '<div class="result-row"><strong>No matches found</strong><span>Try another keyword</span></div>';
}

searchInput?.addEventListener('input', (event) => {
  renderResults(event.target.value);
});

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

fakeUpload?.addEventListener('click', () => {
  alert('Frontend demo only. Connect this button to /api/materials/upload later.');
});

renderResults('');
