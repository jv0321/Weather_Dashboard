const baseURL = 'https://api.openweathermap.org/data/2.5';
const apiKey = 'd88bd9904a9e4f0c2e9429e8d9990ef1';
const searchForm = $('#search-form');
const searchInput = $('#city-input');
const searchHistory = $('.search-history');
const cityWeather = $('#city-weather');
const forecastWeather = $('#forecast-weather');

function loadCitiesArray() {
    const rawData = localStorage.getItem('cities');
    const citiesArray = JSON.parse(rawData) || [];
    return citiesArray;
}

function fetchCurrentWeather(city) {
    const query = `/weather?q=${city}&appid=${apiKey}&units=metric`;
    const url = baseURL + query;
    return $.get(url);
}

function fetchFiveDayForecast(city) {
    const query = `/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const url = baseURL + query;
    return $.get(url);
}

function displayCurrentWeatherInfo(currentData) {
    const cityElement = $('#city-name');
    const dateElement = $('#date');
    const tempElement = $('#temp');
    const windElement = $('#wind');
    const humidElement = $('#humidity');
    const iconElement = $('.icon');
    const formattedDate = dayjs().format('MMM D, YYYY hh:mm a');

    cityElement.text(`City: ${currentData.name}`);
    dateElement.text(`Date: ${formattedDate}`);
    tempElement.text(`Temperature: ${currentData.main.temp}°C`);
    windElement.text(`Wind Speed: ${currentData.wind.speed} m/s`);
    humidElement.text(`Humidity: ${currentData.main.humidity}%`);
    iconElement.html(`<img class="weather-icon" src="https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png" alt="${currentData.weather[0].description}">`);
}

function displayFiveDayForecast(forecastData) {
    const forecastContainer = $('#forecast-div');
    forecastContainer.empty();

    forecastData.list.forEach(function (dayForecast) {
        const date = dayjs(dayForecast.dt_txt).format('M/D/YYYY');

        if (dayForecast.dt_txt.includes('12:00')) {
            forecastContainer.append(`
                <div class="forecast-item">
                    <h3>Date: ${date}</h3>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}.png" alt="${dayForecast.weather[0].description}">
                    </div>
                    <p>Temperature: ${dayForecast.main.temp}°C</p>
                    <p>Wind Speed: ${dayForecast.wind.speed} m/s</p>
                    <p>Humidity: ${dayForecast.main.humidity}%</p>
                </div>
            `);
        }
    });
}

function displaySearchedCityWeather(searchedCity) {
    fetchCurrentWeather(searchedCity)
        .then(displayCurrentWeatherInfo)
        .then(() => fetchFiveDayForecast(searchedCity))
        .then(displayFiveDayForecast);
}

function handleFormInput(event) {
    event.preventDefault();

    const cities = loadCitiesArray();
    const cityValue = searchInput.val();

    displaySearchedCityWeather(cityValue);

    if (!cities.some(cityObj => cityObj.city === cityValue) && cityValue !== '') {
        const savedCity = { city: cityValue };
        cities.push(savedCity);
        localStorage.setItem('cities', JSON.stringify(cities));
    }

    searchInput.val('');
}

function renderSearchHistory() {
    const cities = loadCitiesArray();

    cities.forEach(function (cityObj) {
        if (!isCityInHistory(cityObj.city)) {
            searchHistory.append(`
                <div class='saved'>
                    <p class="history-btn">${cityObj.city}</p>
                </div>
            `);
        }
    });
}

function isCityInHistory(city) {
    const savedCities = $('.history-btn');

    for (let i = 0; i < savedCities.length; i++) {
        if (savedCities[i].textContent === city) {
            return false;
        }
    }

    return true;
}

function displayCityHistory(event) {
    const clickedCity = $(event.target).text().trim();
    const cities = loadCitiesArray();
    const savedCity = cities.find(cityObj => cityObj.city === clickedCity);

    if (savedCity) {
        displaySearchedCityWeather(savedCity.city);
    }
}

$(document).ready(function () {
    renderSearchHistory();
    $(document).on('click', '.saved p', displayCityHistory);
    searchForm.on('submit', handleFormInput);
});
