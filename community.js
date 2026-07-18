document.querySelectorAll('.community-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('highlighted'));
});
