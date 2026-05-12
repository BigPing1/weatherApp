// //Selected HTML items
const city = document.querySelector('.myPositionWeather__city');
const countryText = document.querySelector('.myPositionWeather__country');
const temperature = document.querySelector('.myPositionWeather__temperature');
const feelLike = document.querySelector('.myPositionWeather__feelLike');
const waitLittle = document.querySelector('.waitLittle');
const topText = document.querySelector('.myPositionWeather__topText');
const searchBtn = document.querySelector('.searchWeather__button');
const searchInput = document.querySelector('.searchWeather__input');
const autocompleteSection = document.querySelector(
  '.searchWeather__autocomplete',
);
const userChoiseAutoCom = document.querySelector('.searchWeather__suggestion');
// Hourly section HTML selection
const hourlyForecastList = document.querySelector('.hourlyForecast__list');
const searchSection = document.querySelector('.searchWeather__section');
const mainHTML = document.querySelector('.mainHTML');
// other section HTML
const humidity = document.querySelector('.otherInfo__humidity');
const avgTemp = document.querySelector('.otherInfo__avgTemp');
const vis = document.querySelector('.otherInfo__vis');
const rain = document.querySelector('.otherInfo__rain');
const snow = document.querySelector('.otherInfo__snow');
const maxTemp = document.querySelector('.otherInfo__maxTemp');
const maxWind = document.querySelector('.otherInfo__wind');
const minTemp = document.querySelector('.otherInfo__minTemp');

// Ephesomething
const sunriceText = document.querySelector('.sunrice');
const sunsetText = document.querySelector('.sunset');
const moonriseText = document.querySelector('.moonrise');
const moonsetText = document.querySelector('.moonset');

// Variables
let cityName = null;

// // Get coords & city
async function getMyPosition() {
  // Get coords
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve(position);
      },
      error => {
        reject(new Error(error.message));
      },
    );
  });
}

async function currentName() {
  const currentCityName = await getMyPosition()
    .then(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      return fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      );
    })
    .then(resolve => {
      return resolve.json();
    })
    .then(data => {
      const cityNameA = data.address.city_district;
      const cityNameB = cityNameA.split(' ');
      getWeather(cityNameB[0]);
      getForecast(cityNameB[0]);

      topText.textContent = 'Weather where you are';
      searchBtn.removeAttribute('disabled');
    })
    .catch(error => console.error(error.message));
}
// // Get Weather
async function getWeather(cityName) {
  // Request
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=e37667604e7744a5a66142153260605&q=${cityName}`,
    );
    const data = await response.json();

    // Unpacking into variables
    const { location, current: temperatureInfo } = data;

    // Changing elements
    city.textContent = location.name;
    countryText.textContent = location.country;
    temperature.textContent = `${Math.trunc(temperatureInfo.temp_c)}°`;
    feelLike.textContent = `Feel like: ${Math.trunc(temperatureInfo.feelslike_c)}°`;
    temperature.insertAdjacentHTML(
      'beforeend',
      `<img class="myPositionWeather__icon" src="${temperatureInfo.condition.icon}" alt="Weather Icon">`,
    );
    waitLittle.style.display = 'none';
    return location;
  } catch (error) {
    console.error('Wrong city is undefined');
    wrongSearchData('Incorrect: the city does not exist');
  }
}
// Call Weather
currentName();
// Search city btn
searchBtn.addEventListener('click', function () {
  if (searchInput.value != '') {
    getWeather(searchInput.value);
    getForecast(searchInput.value);
    updateUI();
    autocompleteSection.classList.add('hidden');
  } else {
    wrongSearchData('Empty: Enter city');
  }
});
// Update UI
function updateUI() {
  topText.textContent = 'Weather in';
  searchInput.value = '';
  searchInput.classList.remove('input-error');
  searchInput.placeholder = 'Search city...';
}
// UI for Placeholder
function wrongSearchData(message) {
  searchInput.classList.add('input-error');
  searchInput.placeholder = message;
  searchInput.value = '';
}
// Function autocomplete
let currentWord = '';
searchInput.addEventListener('input', e => {
  autocompleteSection.classList.remove('hidden');
  currentWord = e.target.value;
  searchAutocomplete(currentWord);
});
searchInput.addEventListener('click', e => {
  autocompleteSection.classList.remove('hidden');
});
document.addEventListener('click', e => {
  if (!e.target.closest('.searchWeather__section')) {
    autocompleteSection.classList.add('hidden');
  }
});

async function searchAutocomplete(inputData) {
  try {
    autocompleteSection.innerHTML = '';
    const response = await fetch(
      `http://api.weatherapi.com/v1/search.json?key=e37667604e7744a5a66142153260605&q=${inputData}`,
    );
    const data = await response.json();
    let autocomArr = data.map(item => {
      return `<div class="searchWeather__suggestion">
                  <span class="suggestion-city">${item.name}</span>
                  <span class="suggestion-country">${item.country}</span>
               </div>`;
    });
    autocomArr.forEach(element => {
      autocompleteSection.insertAdjacentHTML('beforeend', element);
    });
  } catch (error) {
    console.error(error.message);
  }
}

autocompleteSection.addEventListener('click', function (e) {
  const suggestion = e.target.closest('.searchWeather__suggestion');
  if (suggestion) {
    const cityName = suggestion.querySelector('.suggestion-city');
    const countryName = suggestion.querySelector('.suggestion-country');
    searchInput.value = `${cityName.textContent} ${countryName.textContent}`;
    autocompleteSection.classList.add('hidden');
    setTimeout(function () {
      getWeather(searchInput.value);
      getForecast(searchInput.value);
      updateUI();
    }, 200);
  }
});

// // Get forecast
async function getForecast(currentCity) {
  const now = new Date();

  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=e37667604e7744a5a66142153260605&q=${currentCity}`,
  );
  const data = await response.json();
  const { forecastday } = data.forecast;
  //  Get riseSet
  const [{ astro }] = forecastday;
  console.log(forecastday);
  updateEphemerdesUI(astro);
  //  Get Hourly
  const location = await getWeather(currentCity);
  const timeZoneResponse = await fetch(
    `https://api.timezonedb.com/v2.1/get-time-zone?key=I7LHPBGJC62H&format=json&by=zone&zone=${location.tz_id}`,
  );
  const dataTimeZone = await timeZoneResponse.json();
  const countryCurrentTimeDate = dataTimeZone.formatted;
  const countryCurrentTimeDateArr = countryCurrentTimeDate.split(' ');
  const [currentDate, countryTime] = countryCurrentTimeDateArr;
  const countryTimeArr = countryTime.split(':');
  const [countryHour] = countryTimeArr;
  const [{ hour: hourlyArr }] = forecastday;
  hourlyForecastList.innerHTML = '';
  const hourlyElements = hourlyArr
    .map(item => {
      const timeItem = item.time;
      const timeItemArr = timeItem.split(' ');
      const gettingHours = timeItemArr[1].split(':');
      if (gettingHours[0] >= countryHour) {
        return `<li class="hourlyForecast__item">
                  <img class="hourlyForecast__image" src="${item.condition.icon}"
                     alt="weatherIcon">
                  <p class="hourlyForecast__temp">${Math.trunc(item.temp_c)}°</p>
                  <p class="hourlyForecast__time">${timeItemArr[1]}</p>
               </li>`;
      } else {
        return '';
      }
    })
    .forEach(item => {
      hourlyForecastList.insertAdjacentHTML('beforeend', item);
    });
  // other info
  const [{ day: dayForecast }] = forecastday;
  otherForecastUI(dayForecast);
}
function otherForecastUI(forecast) {
  console.log(forecast);
  humidity.textContent = `${forecast.avghumidity}%`;
  avgTemp.textContent = `${forecast.avgtemp_c}°`;
  vis.textContent = `${forecast.avgvis_km} km`;
  rain.textContent = `${forecast.daily_chance_of_rain}%`;
  snow.textContent = `${forecast.daily_chance_of_snow}%`;
  maxTemp.textContent = `${Math.trunc(forecast.maxtemp_c)}°`;
  maxWind.textContent = `${forecast.maxwind_kph} km/h`;
  minTemp.textContent = `${Math.trunc(forecast.mintemp_c)}°`;
}
// Update riseSet UI
function updateEphemerdesUI(astro) {
  sunriceText.textContent = astro.sunrise;
  sunsetText.textContent = astro.sunset;
  moonriseText.textContent = astro.moonrise;
  moonsetText.textContent = astro.moonset;
}
