const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
const CATEGORY_LIST_API = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
const AREA_LIST_API = "https://www.themealdb.com/api/json/v1/1/list.php?a=list";
const FILTER_BY_CATEGORY_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const FILTER_BY_AREA_API = "https://www.themealdb.com/api/json/v1/1/filter.php?a=";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const messageArea = document.getElementById("message-area");
const randomButton = document.getElementById("random-button");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");
const categorySelect = document.getElementById("category-select");
const areaSelect = document.getElementById("area-select");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    searchRecipes(searchTerm);
  } else {
    showMessage("Please search a recipe!", true);
  }
});

async function populateFilters() {
  // Populate categories
  const catRes = await fetch(CATEGORY_LIST_API);
  const catData = await catRes.json();
  catData.meals.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.strCategory;
    opt.textContent = cat.strCategory;
    categorySelect.appendChild(opt);
  });

  // Populate areas
  const areaRes = await fetch(AREA_LIST_API);
  const areaData = await areaRes.json();
  areaData.meals.forEach(area => {
    const opt = document.createElement("option");
    opt.value = area.strArea;
    opt.textContent = area.strArea;
    areaSelect.appendChild(opt);
  });
}

// Listen for changes on both filters and apply both at the same time
categorySelect.addEventListener("change", applyFilters);
areaSelect.addEventListener("change", applyFilters);

async function applyFilters() {
  const category = categorySelect.value;
  const area = areaSelect.value;

  // If neither filter is selected, prompt user
  if (!category && !area) {
    resultsGrid.innerHTML = "";
    showMessage("Please select a filter or search for a recipe.");
    return;
  }

  showMessage(
    `Filtering${category ? " by category: " + category : ""}${area ? (category ? " and" : " by") + " area: " + area : ""}`,
    false,
    true
  );
  resultsGrid.innerHTML = "";

  try {
    let meals = [];

    // Fetch by category and/or area, combine results, remove duplicates, max 10
    if (category) {
      const catRes = await fetch(FILTER_BY_CATEGORY_API + encodeURIComponent(category));
      const catData = await catRes.json();
      if (catData.meals) meals = meals.concat(catData.meals);
    }
    if (area) {
      const areaRes = await fetch(FILTER_BY_AREA_API + encodeURIComponent(area));
      const areaData = await areaRes.json();
      if (areaData.meals) meals = meals.concat(areaData.meals);
    }

    // Remove duplicates by idMeal
    const uniqueMealsMap = new Map();
    meals.forEach(m => uniqueMealsMap.set(m.idMeal, m));
    const uniqueMeals = Array.from(uniqueMealsMap.values());

    clearMessage();
    if (uniqueMeals.length > 0) {
      displayRecipes(uniqueMeals.slice(0, 10));
    } else {
      showMessage("No recipes found for this filter.");
    }
  } catch (error) {
    showMessage("Failed to filter recipes. Please try again.", true);
  }
}

// --- Automatic alignment for recipes (centered grid, responsive, fit to screen) ---
function setResultsGridLayout(count) {
  // For 10 recipes, use 5 columns; for fewer, adjust columns accordingly
  let columns = 1;
  if (count >= 10) columns = 5;
  else if (count >= 6) columns = 3;
  else if (count >= 4) columns = 2;
  else columns = 1;

  resultsGrid.style.display = "grid";
  resultsGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  resultsGrid.style.justifyContent = "center";
  resultsGrid.style.gap = "2rem";
  resultsGrid.style.margin = "0 auto";
  resultsGrid.style.maxWidth = "100vw";
  resultsGrid.style.width = "100%";
}

// Patch displayRecipes to auto-align and add effects
const _originalDisplayRecipes = displayRecipes;
displayRecipes = function(recipes) {
  setResultsGridLayout(recipes.length);
  _originalDisplayRecipes(recipes);

  // Enlarge recipe items to fit grid cell
  const items = resultsGrid.querySelectorAll('.recipe-item');
  items.forEach(item => {
    item.style.width = "100%";
    item.style.maxWidth = "100%";
    item.style.boxSizing = "border-box";
    // Add effect classes
    item.classList.add('recipe-effect');
  });
};

// --- Add effect styles ---
const style = document.createElement('style');
style.textContent = `
.recipe-effect {
  transition: filter 0.3s, box-shadow 0.3s, transform 0.2s;
  cursor: pointer;
  position: relative;
  z-index: 1;
}
.recipe-effect.highlighted {
  filter: none !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  z-index: 2;
}
.recipe-effect.blurred {
  filter: blur(3.5px) brightness(0.9);
}
.recipe-effect.bounce {
  animation: bounce-effect 0.5s;
}
@keyframes bounce-effect {
  0%   { transform: scale(1); }
  20%  { transform: scale(1.1, 0.95); }
  40%  { transform: scale(0.95, 1.05); }
  60%  { transform: scale(1.05, 0.98); }
  80%  { transform: scale(0.98, 1.02); }
  100% { transform: scale(1); }
}
`;
document.head.appendChild(style);

// --- Blur background recipes on hover ---
resultsGrid.addEventListener("mouseover", function(e) {
  const card = e.target.closest(".recipe-item");
  if (card) {
    const items = resultsGrid.querySelectorAll('.recipe-item');
    items.forEach(item => {
      if (item === card) {
        item.classList.add("highlighted");
        item.classList.remove("blurred");
      } else {
        item.classList.add("blurred");
        item.classList.remove("highlighted");
      }
    });
  }
});
resultsGrid.addEventListener("mouseout", function(e) {
  // Remove all blur/highlight when mouse leaves any card
  const items = resultsGrid.querySelectorAll('.recipe-item');
  items.forEach(item => {
    item.classList.remove("blurred", "highlighted");
  });
});

// --- Add bounce effect on click ---
resultsGrid.addEventListener("click", function(e) {
  const card = e.target.closest(".recipe-item");
  if (card) {
    card.classList.add("bounce");
    setTimeout(() => card.classList.remove("bounce"), 500);
  }
}, true);

// Call this on page load
populateFilters();

async function searchRecipes(query) {
  showMessage(`Searching for "${query}"...`, false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    clearMessage();

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage(`No recipes found for "${query}",`);
    }
  } catch (error) {
    showMessage("Something went wrong, Please try again.", true);
  }
}

function showMessage(message, isError = false, isLoading = false) {
  messageArea.textContent = message;
  if (isError) messageArea.classList.add("error");
  if (isLoading) messageArea.classList.add("loading");
}

function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}

function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    showMessage("No recipes to display");
    return;
  }

  resultsGrid.innerHTML = "";
  recipes.forEach((recipe) => {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe-item");
    recipeDiv.dataset.id = recipe.idMeal;

    recipeDiv.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
        <h3>${recipe.strMeal}</h3>
    `;

    resultsGrid.appendChild(recipeDiv);
  });
}

randomButton.addEventListener("click", getRandomRecipes);

async function getRandomRecipes() {
  const minRecipes = 4;
  const maxRecipes = 4;
  const numRecipes = Math.floor(Math.random() * (maxRecipes - minRecipes + 1)) + minRecipes;

  showMessage(`Fetching ${numRecipes} random recipe${numRecipes > 1 ? "s" : ""}...`, false, true);
  resultsGrid.innerHTML = "";

  try {
    const fetches = [];
    for (let i = 0; i < numRecipes; i++) {
      fetches.push(
        fetch(RANDOM_API_URL).then(res => {
          if (!res.ok) throw new Error("Something went wrong.");
          return res.json();
        })
      );
    }
    const results = await Promise.all(fetches);
    clearMessage();

    // Flatten and filter out any failed fetches
    const recipes = results
      .map(data => (data.meals && data.meals.length > 0 ? data.meals[0] : null))
      .filter(Boolean);

    if (recipes.length > 0) {
      displayRecipes(recipes);
    } else {
      showMessage("Could not fetch random recipes. Please try again.", true);
    }
  } catch (error) {
    showMessage(
      "Failed to fetch random recipes. Please check your connection and try again.",
      true
    );
  }
}

function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

resultsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-item");

  if (card) {
    const recipeId = card.dataset.id;
    getRecipeDetails(recipeId);
  }
});

async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  try {
    const response = await fetch(`${LOOKUP_API_URL}${id}`);
    if (!response.ok) throw new Error("Failed to fetch recipe details.");
    const data = await response.json();

    if (data.meals && data.meals.length > 0) {
      displayRecipeDetails(data.meals[0]);
    } else {
      modalContent.innerHTML =
        '<p class="message error">Could not load recipe details.</p>';
    }
  } catch (error) {
    modalContent.innerHTML =
      '<p class="message error">Failed to load recipe details. Check your connection or try again.</p>';
  }
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

function displayRecipeDetails(recipe) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(`<li>${measure ? `${measure} ` : ""}${ingredient}</li>`);
    } else {
      break;
    }
  }

  const categoryHTML = recipe.strCategory
    ? `<h3>Category: ${recipe.strCategory}</h3>`
    : "";
  const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : "";
  const ingredientsHTML = ingredients.length
    ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>`
    : "";
  const instructionsHTML = `<h3>Instructions</h3><p>${
    recipe.strInstructions
      ? recipe.strInstructions.replace(/\r?\n/g, "<br>")
      : "Instructions not available."
  }</p>`;
  const youtubeHTML = recipe.strYoutube
    ? `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a><div>`
    : "";
  const sourceHTML = recipe.strSource
    ? `<div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>`
    : "";

  modalContent.innerHTML = `
  <h2>${recipe.strMeal}</h2>
  <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
  ${categoryHTML}
  ${areaHTML}
  ${ingredientsHTML}
  ${instructionsHTML}
  ${youtubeHTML}
  ${sourceHTML}
  `;
}

// --- OUR TEAM SPOTLIGHT SECTION ---

const teamMembers = [
  {
    name: "Regodon, Ivan Ezekiel G.",
    role: "Frontend Developer",
    photo: "/assets/pogi.jpg",
    desc: "Welcome to my personal website. I love building beautiful and functional user interfaces!"
  },
  {
    name: "Member 2",
    role: "Backend Developer",
    photo: "images/2.jpg",
    desc: "I specialize in server-side logic and database management. Let's build something amazing together!"
  },
  {
    name: "Member 3",
    role: "UI/UX Designer",
    photo: "images/3.jpg",
    desc: "Design is not just what it looks like and feels like. Design is how it works."
  }
];

let currentMember = 0;
let typingTimeout;

function showTeamMember(idx) {
  const member = teamMembers[idx];
  document.getElementById("team-photo").src = member.photo;
  document.getElementById("team-photo").alt = member.name;
  document.getElementById("team-name").textContent = member.name;
  document.getElementById("team-role").textContent = member.role;
  autoType(member.desc);

  // Add Learn More button if not present
  let learnMoreBtn = document.getElementById("learn-more-btn");
  if (!learnMoreBtn) {
    learnMoreBtn = document.createElement("button");
    learnMoreBtn.id = "learn-more-btn";
    learnMoreBtn.textContent = "Learn More";
    learnMoreBtn.className = "learn-more-btn";
    document.querySelector(".team-spotlight-info").appendChild(learnMoreBtn);
    learnMoreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      showMemberDetailsModal(member);
    });
  }
}

function autoType(text) {
  const descElem = document.getElementById("team-desc");
  descElem.textContent = "";
  let i = 0;
  clearTimeout(typingTimeout);

  function typeChar() {
    if (i <= text.length) {
      descElem.textContent = text.slice(0, i);
      i++;
      typingTimeout = setTimeout(typeChar, 35);
    }
  }
  typeChar();
}

const spotlightContainer = document.querySelector('.team-spotlight-container');
const spotlightCard = document.querySelector('.team-spotlight-card');

// Go to next member when mouse leaves the container
spotlightContainer.addEventListener('mouseleave', function () {
  currentMember = (currentMember + 1) % teamMembers.length;
  showTeamMember(currentMember);
});

// Show full details when clicking inside the card or Learn More button
spotlightCard.addEventListener('click', function () {
  showMemberDetailsModal(teamMembers[currentMember]);
});

function showMemberDetailsModal(member) {
  modalContent.innerHTML = `
    <h2>${member.name}</h2>
    <img src="${member.photo}" alt="${member.name}" style="width:180px;height:180px;border-radius:50%;margin-bottom:1rem;">
    <h3>${member.role}</h3>
    <p style="margin-top:1.5rem;font-size:1.1rem;">${member.desc}</p>
    <button id="close-member-modal" class="learn-more-btn" style="margin-top:2rem;">Close</button>
  `;
  showModal();
  document.getElementById("close-member-modal").onclick = closeModal;
}

// Initialize on load
showTeamMember(currentMember);
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class when user scrolls down more than 50px
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
});
      function scrollToRecipeFinder() {
        const container = document.getElementById('recipe-finder');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: rect.top + scrollTop - 60, // adjust offset for header if needed
          behavior: 'smooth'
        });
        // Add transition effect
        container.classList.remove('slide-up', 'slide-down');
        const currentScroll = window.scrollY;
        setTimeout(() => {
          if (currentScroll < rect.top + scrollTop) {
            container.classList.add('slide-down');
          } else {
            container.classList.add('slide-up');
          }
          setTimeout(() => {
            container.classList.remove('slide-up', 'slide-down');
          }, 700);
        }, 100);
      }
      function scrollToProjects() {
        const projectsSection = document.getElementById('projects');
        if (!projectsSection) return;
        const rect = projectsSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: rect.top + scrollTop - 60, // adjust offset for header if needed
          behavior: 'smooth'
        });
      }