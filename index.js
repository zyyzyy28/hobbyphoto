document.querySelectorAll('.gallery-grid .g-item').forEach(item => {
  item.addEventListener('click', () => {
    const title = item.querySelector('.g-title')?.textContent || 'Photo';
    alert(`${title} — view more photography in the Photography page.`);
  });
});
