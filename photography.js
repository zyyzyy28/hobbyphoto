const filters = document.querySelectorAll('.filter');
const photos = document.querySelectorAll('.photo-card');

filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    photos.forEach(photo => {
      photo.style.display = category === 'all' || photo.dataset.category === category ? '' : 'none';
    });
  });
});
