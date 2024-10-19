// const API_KEY = config.OPENWEATHER_API_KEY;
// const BASE_URL = config.OPENWEATHER_BASE_URL;

const API_KEY = '84568c9d8b613ce5b360e349ac37a7a2';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const weatherWidget = document.getElementById('weatherWidget');

let currentUnit = 'metric';
let currentWeatherData = null;
let forecastData = null;
let charts = {
    tempBarChart: null,
    weatherDoughnutChart: null,
    tempLineChart: null
};

document.addEventListener('DOMContentLoaded', initializeApp);
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});
celsiusBtn.addEventListener('click', () => changeUnit('metric'));
fahrenheitBtn.addEventListener('click', () => changeUnit('imperial'));

function initializeApp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error("Geolocation error:", error);
                showError("Couldn't get your location. Please enter a city manually.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser. Please enter a city manually.");
    }

    
}

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        showWeatherLoading();
        
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}`
        );
        if (!currentWeatherResponse.ok) throw new Error('Failed to fetch weather data');
        currentWeatherData = await currentWeatherResponse.json();

        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}`
        );
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');
        forecastData = await forecastResponse.json();

        updateUI();
        hideWeatherLoading();
    } catch (error) {
        showError(error.message);
        hideWeatherLoading();
    }
}

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        showWeatherLoading();
        
        const currentWeatherResponse = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`);
        if (currentWeatherResponse.status === 404) throw new Error('City not found');
        if (currentWeatherResponse.status === 429) throw new Error('API limit reached');
        if (!currentWeatherResponse.ok) throw new Error('Failed to fetch weather data');
        currentWeatherData = await currentWeatherResponse.json();

        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`);
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');
        forecastData = await forecastResponse.json();

        updateUI();
        hideWeatherLoading();
    } catch (error) {
        showError(error.message);
        hideWeatherLoading();
    }
}

function updateWeatherWidget() {
    const iconCode = currentWeatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.getElementById('cityName').textContent = currentWeatherData.name;
    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('tempValue').textContent = Math.round(currentWeatherData.main.temp);
    document.getElementById('tempUnit').textContent = currentUnit === 'metric' ? '°C' : '°F';
    document.getElementById('weatherDescription').textContent = currentWeatherData.weather[0].description;
    document.getElementById('humidity').textContent = `${currentWeatherData.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${currentWeatherData.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
    document.getElementById('pressure').textContent = `${currentWeatherData.main.pressure} hPa`;

    updateWidgetBackground(currentWeatherData.weather[0].main.toLowerCase());
}

function updateWidgetBackground(weatherCondition) {
    const videoBackgrounds = {
        clear: 'videos/clear-skyy.mp4',
        clouds: 'videos/cloudy.mp4',
        rain: 'videos/rainy.mp4',
        thunderstorm: 'videos/thunderstorm.mp4',
        snow: 'videos/snow.mp4',
        mist: 'videos/mist.mp4'
    };

    let normalizedCondition = weatherCondition.toLowerCase();

    if (['clear', 'sunny'].includes(normalizedCondition)) {
        normalizedCondition = 'clear';
    } else if (['few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds'].includes(normalizedCondition)) {
        normalizedCondition = 'clouds';
    } else if (['light rain', 'moderate rain', 'heavy intensity rain', 'very heavy rain', 'extreme rain', 'freezing rain', 'light intensity shower rain', 'shower rain', 'heavy intensity shower rain', 'ragged shower rain'].includes(normalizedCondition)) {
        normalizedCondition = 'rain';
    } else if (['thunderstorm', 'thunderstorm with light rain', 'thunderstorm with rain', 'thunderstorm with heavy rain', 'light thunderstorm', 'heavy thunderstorm', 'ragged thunderstorm', 'thunderstorm with light drizzle', 'thunderstorm with drizzle', 'thunderstorm with heavy drizzle'].includes(normalizedCondition)) {
        normalizedCondition = 'thunderstorm';
    } else if (['drizzle', 'light intensity drizzle', 'heavy intensity drizzle', 'light intensity drizzle rain', 'drizzle rain', 'heavy intensity drizzle rain', 'shower rain and drizzle', 'heavy shower rain and drizzle', 'shower drizzle'].includes(normalizedCondition)) {
        normalizedCondition = 'rain';
    } else if (['snow', 'light snow', 'heavy snow', 'sleet', 'light shower sleet', 'shower sleet', 'light rain and snow', 'rain and snow', 'light shower snow', 'shower snow', 'heavy shower snow'].includes(normalizedCondition)) {
        normalizedCondition = 'snow';
    } else if (['mist', 'smoke', 'haze', 'fog', 'sand', 'dust'].includes(normalizedCondition)) {
        normalizedCondition = 'mist';
    } else if (['squall', 'tornado'].includes(normalizedCondition)) {
        normalizedCondition = 'thunderstorm';
    }

    const videoElement = document.getElementById('videoBackground');
    const videoSource = videoBackgrounds[normalizedCondition] || videoBackgrounds.clear;
    
    if (videoElement.src !== videoSource) {
        videoElement.src = videoSource;
        videoElement.load();
    }
}

function changeUnit(unit) {
    if (currentUnit === unit) return;
    
    currentUnit = unit;
    celsiusBtn.classList.toggle('active');
    fahrenheitBtn.classList.toggle('active');
    
    refreshWeatherData();
}

function refreshWeatherData() {
    if (currentWeatherData) {
        if (currentWeatherData.coord) {
            getWeatherByCoordinates(currentWeatherData.coord.lat, currentWeatherData.coord.lon);
        } else {
            getWeather();
        }
    }
}

function showWeatherLoading() {
    const weatherWidget = document.querySelector('.weather-widget');
    weatherWidget.classList.add('weather-widget-loading');
    weatherWidget.style.opacity = '0';
    setTimeout(() => {
        weatherWidget.style.opacity = '1';
    }, 10);
}

function hideWeatherLoading() {
    const weatherWidget = document.querySelector('.weather-widget');
    weatherWidget.style.opacity = '0';
    setTimeout(() => {
        weatherWidget.classList.remove('weather-widget-loading');
        weatherWidget.style.opacity = '1';
    }, 300);
}

function showError(message) {
    let errorContainer = document.getElementById('errorContainer');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'errorContainer';
        errorContainer.style.color = 'red';
        errorContainer.style.fontWeight = 'bold';
        errorContainer.style.padding = '10px';
        errorContainer.style.textAlign = 'center';
        errorContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        errorContainer.style.border = '1px solid red';
        errorContainer.style.borderRadius = '5px';
        errorContainer.style.margin = '10px 0';
        errorContainer.style.display = 'none';
        
        weatherWidget.parentNode.insertBefore(errorContainer, weatherWidget);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';

    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

function updateUI() {
    updateWeatherWidget();
    displayForecastCharts(forecastData)
}

function displayForecastCharts(forecastData) {
    const dailyData = processForecastData(forecastData);
    
    createBarChart(dailyData);
    createDoughnutChart(dailyData);
    createLineChart(dailyData);
}

let barChart, doughnutChart, lineChart;

function processForecastData(forecastData) {
    const dailyData = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                condition: item.weather[0].main
            };
        }
        dailyData[date].temps.push(item.main.temp);
    });

    return dailyData;
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                font: {
                    family: "'Roboto', sans-serif",
                    size: 14
                },
                color: '#ffff'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: '#ccc',
            borderWidth: 1,
            cornerRadius: 5,
            displayColors: false,
            titleFont: {
                family: "'Roboto', sans-serif",
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                family: "'Roboto', sans-serif",
                size: 12
            }
        }
    }
};

function createBarChart(dailyData) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = Object.keys(dailyData).slice(0, 5).map(date => {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = labels.map((_, index) => {
        const temps = dailyData[Object.keys(dailyData)[index]].temps;
        return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    });

    if (barChart) {
        barChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(75, 212, 212, 0.9)');
    gradient.addColorStop(1, 'rgba(75, 212, 212, 0.1)');

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '5-Day Temperature Forecast',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...chartOptions,
            animation: {
                delay: (context) => context.dataIndex * 300
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: '#666'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: '#666'
                    }
                }
            }
        }
    });
}

function createDoughnutChart(dailyData) {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    
    const fiveDayData = Object.entries(dailyData).slice(0, 5);
    
    const conditionCounts = fiveDayData.reduce((acc, [_, dayData]) => {
        acc[dayData.condition] = (acc[dayData.condition] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(conditionCounts);
    const data = Object.values(conditionCounts);

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {

        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(75, 212, 212, 1)',
                    'rgba(75, 222, 222, 0.8)',
                    'rgba(75, 232, 232, 0.6)',
                    'rgba(75, 242, 242, 0.4)',
                    'rgba(75, 252, 252, 0.2)'
                ],
                
                
                borderColor: 'white',
                borderWidth: 0.5
            }]
        },
        options: {
            ...chartOptions,
            animation: {
                delay: (context) => context.dataIndex * 300
            },
            cutout: '60%',
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 14
                        },
                        color: '#FFFFFF'
                    },
                    position: 'bottom'
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    cornerRadius: 5,
                    displayColors: false,
                    titleFont: {
                        family: "'Roboto', sans-serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: "'Roboto', sans-serif",
                        size: 12
                    }
                }
            }
        }
    });
}

function createLineChart(dailyData) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const labels = Object.keys(dailyData).slice(0, 5).map(date => {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = labels.map((_, index) => {
        const temps = dailyData[Object.keys(dailyData)[index]].temps;
        return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    });

    if (lineChart) {
        lineChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(75, 212, 212, 0.7)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature Trend',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: gradient,
                borderWidth: 1,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'white',
                pointBorderColor: 'rgba(75, 192, 192, 1)',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            ...chartOptions,
            animation: {
                y: {
                    easing: 'easeOutBounce',
                    duration: 1000,
                    from: (ctx) => {
                        if (ctx.type === 'data') {
                            if (ctx.mode === 'default' && !ctx.dropped) {
                                ctx.dropped = true;
                                return 0;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: '#666'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        },
                        color: '#666'
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');

    hamburgerMenu.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});