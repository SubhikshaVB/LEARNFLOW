const maxHistoryCount = 5;
const searchHistory = document.getElementById('search-history');
document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const cityInput = document.getElementById('city-input');
    const cityName = cityInput.value.trim();
    if (cityName !== '') {
        getWeatherData(cityName);
        cityInput.value = '';
    }
});

function updateSearchHistory(city) {
    const historyList = document.getElementById('history-list');
    const historyItems = historyList.getElementsByTagName('li');
    if (historyItems.length >= 3) {
        historyList.removeChild(historyItems[0]);
    }
    const listItem = document.createElement('li');
    listItem.textContent = city;
    listItem.addEventListener('click', function () {
        getWeatherData(city);
    });
    historyList.appendChild(listItem);
}

async function getWeatherData(city) {
    const apiKey = 'f600df306465e73c27b19cd669b8c97a';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const weatherResponse = await fetch(apiUrl);
        const forecastResponse = await fetch(forecastUrl);
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        if (weatherResponse.ok && forecastResponse.ok) {
            clearWeatherInfo();
            clearForecastInfo();
            displayWeather(weatherData);
            displayForecast(forecastData);
        } else {
            displayError(weatherData.message || forecastData.message);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayError('404 City Not Found');
    }
}

function clearWeatherInfo() {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = '';
}

function clearForecastInfo() {
    const listContentUl = document.querySelector('.list_content ul');
    listContentUl.innerHTML = '';
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;

    addSearchToHistory(data.name, data.main.temp);
}

function displayForecast(data) {
    const listContentUl = document.querySelector('.list_content ul');
    const dailyForecast = {};
    const dayAbbreviations = {
        'Sunday': 'Sun',
        'Monday': 'Mon',
        'Tuesday': 'Tues',
        'Wednesday': 'Wed',
        'Thursday': 'Thurs',
        'Friday': 'Fri',
        'Saturday': 'Sat'
    };
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (!dailyForecast[day]) {
            dailyForecast[day] = true;
            const dayAbbreviation = dayAbbreviations[day];
            listContentUl.innerHTML += `
                <li>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" />
                    <span>${dayAbbreviation}</span>
                    <span class="day_temp">${forecast.main.temp}°C</span>
                </li>
            `;
        }
    });
}

function addSearchToHistory(city, temperature) {
    if (searchHistory.children.length >= maxHistoryCount) {
        searchHistory.lastChild.remove();
    }
    const historyCard = document.createElement('div');
    historyCard.classList.add('history-card');
    historyCard.innerHTML = `
        <p>City: ${city}</p>
        <p>Temperature: ${temperature}°C</p>
    `;
    searchHistory.prepend(historyCard);
}

function displayError(message) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `<p class="error">${message}</p>`;
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = ''; 
}