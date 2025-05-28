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

// Auto-typing function for profile hover
class AutoTyper {
    constructor(element, options = {}) {
        this.element = element;
        this.typeSpeed = options.typeSpeed || 50;
        this.deleteSpeed = options.deleteSpeed || 30;
        this.pauseTime = options.pauseTime || 1000;
        this.isTyping = false;
        this.currentTimeout = null;
    }

    async type(text) {
        if (this.isTyping) {
            this.stop();
        }
        
        this.isTyping = true;
        this.element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;
            
            this.element.textContent += text[i];
            await this.wait(this.typeSpeed);
        }
    }

    async delete() {
        if (!this.isTyping) return;
        
        const text = this.element.textContent;
        for (let i = text.length; i > 0; i--) {
            if (!this.isTyping) break;
            
            this.element.textContent = text.substring(0, i - 1);
            await this.wait(this.deleteSpeed);
        }
    }

    stop() {
        this.isTyping = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }

    wait(ms) {
        return new Promise(resolve => {
            this.currentTimeout = setTimeout(resolve, ms);
        });
    }
}

// Profile data with updated names to match your HTML
const profileData = {
    regod: {
        name: "Ivan",
        role: "THE MOST KUPAL",
        description: "A beginner IT programmer. I specialize in building user-friendly interfaces using Java, HTML, and CSS, and I'm passionate about creating clean, responsive designs.",
        url: "ivan-profile.html" // Add URL for navigation
    },
    alex: {
        name: "Jep",
        role: "THE YOUNG DADDY", 
        description: "Frontend developer and UI/UX designer passionate about creating seamless, user-centered digital experiences. Combines clean, responsive code with thoughtful design to craft intuitive interfaces that engage and delight users.",
        url: "jep-profile.html" // Add URL for navigation
    },
    sarah: {
        name: "Rhodney",
        role: "THE MR MILLIONAIRE",
        description: "Frontend developer and UI/UX designer passionate about creating seamless, user-centered digital experiences. Combines clean, responsive code with thoughtful design to craft intuitive interfaces that engage and delight users.",
        url: "rhodney-profile.html" // Add URL for navigation
    },
    mike: {
        name: "JD",
        role: "THE BASSIST AND HARRIZZLER",
        description: "Expert in server-side development and database optimization for high-performance applications.",
        url: "jd-profile.html" // Add URL for navigation
    }
};

// Function to navigate to profile page with smooth transition
function navigateToProfile(profileId) {
    const profileInfo = profileData[profileId];
    if (profileInfo && profileInfo.url) {
        // Create overlay for smooth transition
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0);
            z-index: 9999;
            transition: background 0.5s ease;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);
        
        // Trigger fade-out animation
        setTimeout(() => {
            overlay.style.background = 'rgba(0, 0, 0, 1)';
        }, 10);
        
        // Navigate after transition completes
        setTimeout(() => {
            window.location.href = profileInfo.url;
        }, 500);
    }
}

// Function to get positioning based on profile layout
function getProfilePosition(profileId, profileCard) {
    const rect = profileCard.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position configurations for each profile based on their layout
    const positions = {
        regod: { // Ivan - space on the left
            left: rect.left + scrollLeft - 320,
            top: rect.top + scrollTop + (rect.height / 2) - 75,
            textAlign: 'right'
        },
        alex: { // Jep - space on the right
            left: rect.right + scrollLeft + 20,
            top: rect.top + scrollTop + (rect.height / 2) - 75,
            textAlign: 'left'
        },
        sarah: { // Rhodney - space on the left
            left: rect.left + scrollLeft - 320,
            top: rect.top + scrollTop + (rect.height / 2) - 75,
            textAlign: 'right'
        },
        mike: { // JD - space on the right
            left: rect.right + scrollLeft + 20,
            top: rect.top + scrollTop + (rect.height / 2) - 75,
            textAlign: 'left'
        }
    };
    
    return positions[profileId] || positions.alex; // Default to right side
}

// Initialize auto-typing functionality with positioned display
function initProfileAutoType() {
    // Create display container
    const displayContainer = document.createElement('div');
    displayContainer.id = 'profile-display';
    displayContainer.style.cssText = `
        position: absolute;
        background: transparent;
        padding: 20px;
        border-radius: 10px;
        color: white;
        font-family: 'Poppins', Arial, sans-serif;
        width: 280px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        pointer-events: none;
    `;

    const nameElement = document.createElement('h2');
    nameElement.id = 'auto-type-name';
    nameElement.style.cssText = `
        color: #ff8c00;
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        min-height: 30px;
    `;

    const roleElement = document.createElement('p');
    roleElement.id = 'auto-type-role';
    roleElement.style.cssText = `
        color: #ff8c00;
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: bold;
        letter-spacing: 1px;
        min-height: 18px;
    `;

    const descriptionElement = document.createElement('p');
    descriptionElement.id = 'auto-type-description';
    descriptionElement.style.cssText = `
        color: #ccc;
        margin: 0;
        font-size: 15px;
        line-height: 1.4;
        min-height: 60px;
    `;

    displayContainer.appendChild(nameElement);
    displayContainer.appendChild(roleElement);
    displayContainer.appendChild(descriptionElement);
    document.body.appendChild(displayContainer);

    // Create auto-typers
    const nameTyper = new AutoTyper(nameElement, { typeSpeed: 80 });
    const roleTyper = new AutoTyper(roleElement, { typeSpeed: 60 });
    const descriptionTyper = new AutoTyper(descriptionElement, { typeSpeed: 40 });

    // Add event listeners to profile cards
    const profiles = document.querySelectorAll('[data-profile]');
    
    profiles.forEach(profile => {
        const profileId = profile.getAttribute('data-profile');
        
        // Add click event listener for navigation
        profile.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            navigateToProfile(profileId);
        });
        
        // Add cursor pointer style to indicate clickability
        profile.style.cursor = 'pointer';
        
        // Hover events for auto-typing
        profile.addEventListener('mouseenter', async () => {
            if (profileData[profileId]) {
                const data = profileData[profileId];
                const position = getProfilePosition(profileId, profile);
                
                // Position the display container
                displayContainer.style.left = position.left + 'px';
                displayContainer.style.top = position.top + 'px';
                displayContainer.style.textAlign = position.textAlign;
                
                // Show display container
                displayContainer.style.opacity = '1';
                displayContainer.style.visibility = 'visible';
                
                // Start auto-typing sequence
                await nameTyper.type(data.name);
                await new Promise(resolve => setTimeout(resolve, 200));
                await roleTyper.type(data.role);
                await new Promise(resolve => setTimeout(resolve, 300));
                await descriptionTyper.type(data.description);
            }
        });

        profile.addEventListener('mouseleave', () => {
            // Stop all typing
            nameTyper.stop();
            roleTyper.stop();
            descriptionTyper.stop();
            
            // Hide display container
            displayContainer.style.opacity = '0';
            displayContainer.style.visibility = 'hidden';
            
            // Clear content after animation
            setTimeout(() => {
                nameElement.textContent = '';
                roleElement.textContent = '';
                descriptionElement.textContent = '';
            }, 300);
        });
    });

    // Update positions on window resize
    window.addEventListener('resize', () => {
        // Hide display during resize to prevent positioning issues
        displayContainer.style.opacity = '0';
        displayContainer.style.visibility = 'hidden';
    });

    // Update positions on scroll
    window.addEventListener('scroll', () => {
        if (displayContainer.style.visibility === 'visible') {
            // Find the currently hovered profile and update position
            const hoveredProfile = document.querySelector('[data-profile]:hover');
            if (hoveredProfile && profileData[hoveredProfile.getAttribute('data-profile')]) {
                const position = getProfilePosition(hoveredProfile.getAttribute('data-profile'), hoveredProfile);
                displayContainer.style.left = position.left + 'px';
                displayContainer.style.top = position.top + 'px';
            }
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileAutoType);
} else {
    initProfileAutoType();
}

// Alternative initialization for dynamic content
function reinitializeProfileAutoType() {
    initProfileAutoType();
}