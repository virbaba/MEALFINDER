/** WE PERFORM BASICALLY FIVE TASK HERE...
 * 1. FETCHING MEAL VIA SEARCH
 * 2. FETCHING MEAL VIA MEAL ID
 * 3. RANDOM MEAL SEARCH
 * 4. LIKING THE MEAL AND ADDED TO FAVOURITE MEAL LIST
 * 5. DISPLYAING SEARCHED, AND FAVOURITE MEAL
 */

const search = document.getElementById('search'),
  submit = document.getElementById('submit'),
  random = document.getElementById('random'),
  mealsEl = document.getElementById('meals'),
  resultHeading = document.getElementById('result-heading'),
  single_mealEl = document.getElementById('single-meal'),
  favourite = document.getElementById('favourite');

  // ARRAY THAT CONTAIN LIKED MEAL 
  let likedMeal = [];

//  CRATING ELEMENT AND ADDING CLASS THAT CONTAINT LIKE AND DISLIKE ICON
  liked = document.createElement('div')
  liked.classList.add('liked');
  
 
// Search meal and fetch from API
function searchMeal(e) {
  // type is submit, but don't want to actually submit to a file
  e.preventDefault();

  // Clear single meal
  single_mealEl.innerHTML = '';

  // Get search term
  const term = search.value;

  // Check for empty
  if (term.trim()) {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
      .then((res) => res.json())
      .then((data) => {
        resultHeading.innerHTML = `<h2>Search results for '${term}':</h2>`;

        // CHECK FOR NULL
        if (data.meals === null) {
          resultHeading.innerHTML = `<p>No results.</p>`;
        } else {
          // RENDERING THE MEAL TO THE MEAL CONTAINER
          mealsEl.innerHTML = data.meals
            .map(
              (meal) => `
            <div class="meal">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
              <div class="meal-info" data-mealID="${meal.idMeal}">
              <div class="liked dislike" id="${meal.idMeal}"></div>
                <h3 class="h4">${meal.strMeal}</h3>
              </div>
            </div>
          `
            )
            .join('');
        }
      });
    // Clear search text
    search.value = '';
  } else {
    alert('Please enter a search term');
  }
}

// Fetch meal by ID
function getMealById(mealID) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`)
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];

      addMealToDOM(meal);
    });
}

// Fetch random meal
function getRandomMeal() {
  // Clear meals and heading
  mealsEl.innerHTML = '';
  resultHeading.innerHTML = '';

  fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];

      addMealToDOM(meal);
    });
}
// Rander The Favourite Meal
function renderFavouriteMeal(meal){
  resultHeading.innerHTML = `<h2>Yumm! My Favourite Meal 😋😋😋</h2>`;
  mealsEl.innerHTML += `
  <div class="meal">
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <div class="meal-info" data-mealID="${meal.idMeal}">
    <div class="liked like" id="${meal.idMeal}"></div>
      <h3 class="h4">${meal.strMeal}</h3>
    </div>
  </div>
`

} 
// Fetch Favourite Meal
function getFavouriteMeal(){
  mealsEl.innerHTML = '';
  let stringArray = localStorage.getItem('likedMeal');

  likedMeal = JSON.parse(stringArray);

  for(id of likedMeal){
    console.log(id);
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];

      renderFavouriteMeal(meal);
    });
  }
}

// HANDLING THE EVENT WHEN USER PRESS FOR FAVOURITE MEAL
favourite.addEventListener('click', getFavouriteMeal);

// Add meal to DOM
function addMealToDOM(meal) {
  const ingredients = [];

  // Max of 20 ingredients
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`
      );
    } else {
      break;
    }
  }
  // RENDERING MEAL INFO AFTER CLICKING ON IN

  mealsEl.innerHTML = `
    <div class="single-meal">
      <h1>${meal.strMeal}</h1>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="single-meal-info">
        ${meal.strCategory && `<p>Category: ${meal.strCategory}</p>`}
        ${meal.strArea && `<p>Region: ${meal.strArea}</p>`}
      </div>
      <div class="main">
        <p>${meal.strInstructions}</p>
        <h2>Ingredients</h2>
        <ul>
          ${ingredients.map((ing) => `<li>${ing}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Event listeners
submit.addEventListener('submit', searchMeal);
random.addEventListener('click', getRandomMeal);

mealsEl.addEventListener('click', (e) => {
  // path vs composedPath - https://stackoverflow.com/questions/39245488/event-path-is-undefined-running-in-firefox
  const path = e.path || (e.composedPath());
  let len = path.length;

  // HERE WE GOT PATH ARRAY  WHEN CLICKING ON EITHER MEAL OR LIKE DISLIKE BUTTON
  // IF WE CLICKING ON LIKE OR DISLIKE ICON THE PATH ARRAY LENGTH == 9 OTHERWISE 10

  if(len === 9){
    // CHECK IS MEAL LIKE OR NOT IF STILL UNLIKE AND USER WANT TO ADD TO THE FAVOURITE LIST THEN FIRSTLY REMOVE DISLIKE ICON CLASS AND ADDING LIKING ICON CLASS OR IMG
    
    if(path[0].classList.contains('dislike')){
      path[0].classList.remove('dislike');
      path[0].classList.add('like');

      // PUSHING THE FAVOURITE MEAL INTO FAVOURTIE LIST IF MEAL DOES NOT EXISTS
      if(!likedMeal.includes(path[0].id))
        likedMeal.push(path[0].id);

      // STORE THE MEAL INTO THE LOCALSOTRAGE
      let stringArray = JSON.stringify(likedMeal);
      localStorage.setItem('likedMeal', stringArray);
    }

    else{
      // REVERSE PROCESS OF IF STATEMENTS
      path[0].classList.remove('like');
      path[0].classList.add('dislike');

      // HERE WE REMOVE DISLIKE MEAL TO THE FAVOURITE LIST

      if(likedMeal.length > 0){
        likedMeal = likedMeal.filter((id)=>{
          return path[0].id !== id;
        })
      }

      // PARSING THE LOCALSOTRAGE DATA
      let stringArray = JSON.stringify(likedMeal);
      localStorage.setItem('likedMeal', stringArray);
      getFavouriteMeal();
    }
    

  }
  else{
    // IT'S DISPLAY THE SINGLE MEAL INFORMATION
    var mealInfo = path.find((item) => {
      if (len === 8 && item.classList) {
        return item.classList.contains('meal-info');
      } else {
        return false;
      }
    });
  }
  

  if (mealInfo) {
    const mealID = mealInfo.getAttribute('data-mealid');
    getMealById(mealID);
  }

  // ADDING THE EVENT TO LIKED OR DISLIKE ICON 

  liked.addEventListener('click', (e)=>{
    const target = e.target;
    console.log(target.id);
  })


});