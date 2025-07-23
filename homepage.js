const logo = document.getElementById('logo');
const dropdownContent = document.getElementById('dropdown-content');


logo.addEventListener('click', function () {
    dropdownContent.classList.toggle('show-dropdown');
});




document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href').substring(1); // Get the target element's ID
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerHeight = document.querySelector('header').offsetHeight=180; // Adjust this to match your header's height
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth' // Add smooth scrolling for a nice effect
      });
    }
  });
});



