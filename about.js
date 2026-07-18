document.querySelectorAll('.founder').forEach(founder => {
  founder.addEventListener('mouseenter', () => founder.style.transform = 'translateY(-3px)');
  founder.addEventListener('mouseleave', () => founder.style.transform = 'translateY(0)');
});
