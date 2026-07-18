const stars = document.querySelectorAll('#stars .star');
stars.forEach((star, index) => {
  star.addEventListener('click', () => {
    stars.forEach((s, i) => s.classList.toggle('filled', i <= index));
  });
});

document.querySelector('#feedbackForm').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#successMessage').style.display = 'block';
  event.target.reset();
});
