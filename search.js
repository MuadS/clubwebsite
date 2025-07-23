document.addEventListener("DOMContentLoaded", function () {
    const fadeContainer = document.querySelector(".fade-in-container");
    fadeContainer.classList.add("fade-in");
  });
  
  const userCardTemplate = document.querySelector("[data-user-template]");
  const userCardContainer = document.querySelector("[data-user-cards-container]");
  const searchInput = document.querySelector("[data-search]");
  const header = document.querySelector("header");
  const searchWrapper = document.querySelector(".search-wrapper");
  
  let users = [];

  searchInput.addEventListener("focus", () => {
    header.classList.add("expanded-header");
    searchWrapper.classList.add("centered-search");
});

searchInput.addEventListener("blur", () => {
    header.classList.remove("expanded-header");
    searchWrapper.classList.remove("centered-search");
});
  
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase(); // Corrected typo here
    users.forEach((user) => {
      const isVisible =
        user.name.toLowerCase().includes(value) || // Corrected typo here
        user.email.toLowerCase().includes(value);  // Corrected typo here
      user.element.classList.toggle("hide", !isVisible); // Corrected typo here
    });
  });
  
  fetch("https://jsonplaceholder.typicode.com/users")
    .then((res) => res.json())
    .then((data) => {
      users = data.map((user) => {
        const card = userCardTemplate.content.cloneNode(true).children[0];
        const header = card.querySelector('[data-header]');
        const body = card.querySelector('[data-body]');
        header.textContent = user.name;
        body.textContent = user.email;
        userCardContainer.append(card);
        return { name: user.name, email: user.email, element: card };
      });
    });

    
    
    

  






