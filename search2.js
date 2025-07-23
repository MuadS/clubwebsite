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

import { algoliasearch } from 'algoliasearch';

// Instantiate the client
const client = algoliasearch('LTPCMAZ3BQ', 'fd4d164ef48bb68f58f77e0fded609f1);

// Add a new record to your Algolia index
const { taskID } = await client.saveObject({
  indexName: 'debate_website',
  body: {
    title: 'My Algolia Object',
  },
});

// Poll the task status to know when it has been indexed
await client.waitForTask({ indexName: 'debate_website', taskID });

// Fetch search results
const { results } = await client.search({
  requests: [
    {
      indexName: '<YOUR_INDEX_NAME>',
      // You can make typos, we handle it
      query: 'my aloglia ojbect',
      hitsPerPage: 50,
    },
  ],
});

console.log('[Results]', results);


