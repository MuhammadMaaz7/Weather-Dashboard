// Constants
const API_KEY = config.OPENWEATHER_API_KEY;
const BASE_URL = config.OPENWEATHER_BASE_URL;
const GEMINI_API_KEY = config.GEMINI_API_KEY;
const GEMINI_API_URL = config.GEMINI_API_URL;

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const forecastBody = document.getElementById('forecast-body');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const chatInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.querySelector('.chat-messages');
const filterSelect = document.getElementById('filter-select');

let forecastData = [];
let originalForecastData = [];
let currentPage = 1;
const entriesPerPage = 8;
let currentUnit = 'metric';
let currentCity = '';

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});
prevBtn.addEventListener('click', () => changePage(-1));
nextBtn.addEventListener('click', () => changePage(1));
sendBtn.addEventListener('click', handleChatInput);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatInput();
});
filterSelect.addEventListener('change', applyFilter);

function initializeApp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
                displayWelcomeMessage(); 
            },
            error => {
                console.error("Geolocation error:", error);
                showError("Couldn't get your location. Please enter a city manually.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser. Please enter a city manually.");
        displayWelcomeMessage();
    }
}

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}`
        );
        if (!response.ok) throw new Error('Failed to fetch forecast data');
        const data = await response.json();
        currentCity = data.city.name;
        processForecastData(data);
    } catch (error) {
        showError(error.message);
    }
}

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('City not found');
            throw new Error('Failed to fetch forecast data');
        }
        const data = await response.json();
        processForecastData(data);
    } catch (error) {
        showError(error.message);
    }
}

function processForecastData(data) {
    originalForecastData = data;

    forecastData = [];
    const uniqueDates = new Set();
    
    currentCity = data.city.name;

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long' });
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (uniqueDates.size < 5) {
            uniqueDates.add(formattedDate);
            forecastData.push({
                date: formattedDate,
                time: time,
                temp: Math.round(item.main.temp),
                feelsLike: Math.round(item.main.feels_like),
                condition: item.weather[0].main,
                icon: item.weather[0].icon
            });
        }
    });

    currentPage = 1;
    updateTable();
    updatePagination();
}


let currentPageData = [];

function updateTable(data = forecastData) {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    currentPageData = data.slice(startIndex, endIndex);

    forecastBody.innerHTML = '';

    currentPageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.time}</td>
            <td>${item.temp}°${currentUnit === 'metric' ? 'C' : 'F'}</td>
            <td>${item.feelsLike}°${currentUnit === 'metric' ? 'C' : 'F'}</td>
            <td>
                <img 
                    src="https://openweathermap.org/img/wn/${item.icon}.png" 
                    alt="${item.condition}" 
                    class="weather-icon"
                />
            </td>
            <td>${item.condition}</td>
        `;
        forecastBody.appendChild(row);
    });
}

function applyFilter() {
    const selectedFilter = filterSelect.value;
    let filteredData = [...currentPageData];

    switch (selectedFilter) {
        case 'temp-asc':
            filteredData.sort((a, b) => a.temp - b.temp);
            break;
        case 'temp-desc':
            filteredData.sort((a, b) => b.temp - a.temp);
            break;
        case 'rain-only':
            filteredData = filteredData.filter(item => item.condition.toLowerCase().includes('rain'));
            break;
        case 'highest-temp':
            const highestTemp = filteredData.reduce((max, item) => Math.max(max, item.temp), -Infinity);
            filteredData = filteredData.filter(item => item.temp === highestTemp);
            break;
        default:
            break;
    }

    updateTableWithFilteredData(filteredData);
}

function updateTableWithFilteredData(filteredData) {
    forecastBody.innerHTML = '';

    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.time}</td>
            <td>${item.temp}°${currentUnit === 'metric' ? 'C' : 'F'}</td>
            <td>${item.feelsLike}°${currentUnit === 'metric' ? 'C' : 'F'}</td>
            <td>
                <img 
                    src="https://openweathermap.org/img/wn/${item.icon}.png" 
                    alt="${item.condition}" 
                    class="weather-icon"
                />
            </td>
            <td>${item.condition}</td>
        `;
        forecastBody.appendChild(row);
    });
}


function updatePagination(data = forecastData) {
    const totalPages = Math.ceil(data.length / entriesPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || data.length === 0;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(forecastData.length / entriesPerPage);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateTable();
        updatePagination();
        filterSelect.value = 'none';
    }
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
}

function toggleLoadingSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

async function handleChatInput() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    displayMessage(userMessage, 'user');
    chatInput.value = '';
    toggleLoadingSpinner(true);

    try {
        if (!forecastData || forecastData.length === 0) {
            throw new Error('No forecast data available. Please search for a city first.');
        }

        const response = await sendToGeminiAPI(userMessage);
        displayMessage(response, 'bot');
    } catch (error) {
        console.error('Error handling chat input:', error);
        displayMessage(`Error: ${error.message}`, 'bot');
    } finally {
        toggleLoadingSpinner(false);
    }
}

function formatForecastData(data) {
    return data.list.map(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        return `On ${date}, the temperature will be ${Math.round(item.main.temp)}°C, feeling like ${Math.round(item.main.feels_like)}°C, with conditions described as ${item.weather[0].main}.`;
    }).join('\n');
}

async function sendToGeminiAPI(userMessage) {
    try {
        const formattedForecastData = formatForecastData(originalForecastData);

        const prompt = `
        You are a funny weather assistant for ${currentCity}. Your knowledge is based on the following weather forecast data:
        ${formattedForecastData}
        
        User query: "${userMessage}"
        
        If the query is related to weather or the provided forecast data, please provide a concise and helpful response based only on the given forecast data. Do not add any styling or formatting to the response.
        
        If the query is not related to weather or the provided forecast data, sarcastically explain that you can only assist with weather-related queries for ${currentCity} based on the current forecast data.
        `;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{text: prompt}] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error in sendToGeminiAPI:', error.message);
        throw error;
    }
}

function checkAPIKeys() {
    if (!API_KEY || API_KEY === '84568c9d8b613ce5b360e349ac37a7a2') {
        console.error('Invalid or default OpenWeather API key');
        displayMessage('Error: Invalid OpenWeather API key. Please update it in the code.', 'bot');
    }
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyBq1LA6tcA1GC3jKmUDqUw2gCoCOSKDQt4') {
        console.error('Invalid or default Gemini API key');
        displayMessage('Error: Invalid Gemini API key. Please update it in the code.', 'bot');
    }
}


function displayMessage(message, sender) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message-container', sender);

    const profilePic = document.createElement('div');
    profilePic.classList.add('profile-pic');
    if (sender === 'user') {
        profilePic.textContent = 'M';
    } else {
        profilePic.style.backgroundImage = 'url("videos/bot.png")';
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message;

    messageElement.appendChild(messageContent);
    
    messageContainer.appendChild(profilePic);
    messageContainer.appendChild(messageElement);
    
    chatMessages.appendChild(messageContainer);
    
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
}

function displayWelcomeMessage() {
    const welcomeMessage = "Welcome! I can answer weather-related queries based on the current forecast for your location.";
    displayMessage(welcomeMessage, 'bot');
}


document.addEventListener('DOMContentLoaded', initializeApp);

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');

    hamburgerMenu.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});