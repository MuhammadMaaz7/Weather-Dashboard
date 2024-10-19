Weather Dashboard with Chatbot Integration

-Description

This Weather App is a comprehensive web application that provides users with detailed weather forecasts, interactive data visualizations, and a unique AI-powered chat interface for weather-related queries. It features both a dashboard view for visual representation of weather data and a tabular view for detailed forecast information.

-Features

- Real-time weather forecasts for any city
- Geolocation support for automatic local weather
- Interactive dashboard with current weather details and background video
- 5-day weather forecast with detailed information
- Interactive data visualization with charts (bar, doughnut, and line charts)
- Tabular view of forecast data with pagination and filtering options
- Customizable temperature units (Celsius/Fahrenheit)
- AI-powered chat interface for weather-related queries
- Responsive design with a collapsible sidebar for easy navigation

-Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization
- Font Awesome for icons
- Fetch API for making HTTP requests

-APIs Used

- OpenWeatherMap API: For fetching weather forecast data
- Gemini API: For powering the AI chat interface

-Usage

1. On the dashboard page:
   - Enter a city name in the search bar and click the "Get Weather" button or press Enter.
   - View the current weather conditions in the weather widget.
   - Explore the interactive charts showing the 5-day temperature forecast, weather conditions distribution, and temperature trend.
   - Toggle between Celsius and Fahrenheit using the buttons in the weather widget.

2. On the tables page:
   - Enter a city name to view the 5-day weather forecast displayed in the table.
   - Use the pagination buttons to navigate through the forecast data.
   - Apply filters to sort or filter the displayed weather data using the dropdown menu.
   - Use the chat interface to ask weather-related questions about the displayed forecast.

- Instructions to Run Locally

1. Clone the repository to your local machine.
2. Open the project folder in your preferred code editor.
3. Ensure you have valid API keys for OpenWeatherMap and Gemini API. You'll need to replace the placeholder API keys in the JavaScript files with your actual keys.
4. Open `dashboard.html` in a web browser to view the dashboard.
5. Click on the "Tables" link in the sidebar to navigate to the tabular view (`tables.html`).

-Project Structure

- dashboard.html: Main page with weather widget and charts
- tables.html: Page with detailed forecast table and chat interface
- dashboard.css: Styles for the dashboard page
- tables.css: Styles for the tables page
- dashboard.js: JavaScript for dashboard functionality
- tables.js: JavaScript for tables and chat functionality

-Future Improvements

- Implement user authentication for personalized experiences
- Expand the AI chat capabilities to handle more complex weather-related queries
- Implement caching to reduce API calls and improve performance
- Add multilingual support for international users
- Integrate additional weather data sources for more comprehensive forecasts
- Add night mode option.

Deployment
This project is deployed using GitHub Pages. You can view the live application at: https://muhammadmaaz7.github.io/Weather-Dashboard/tables.html

Repository
The source code for this project is available on GitHub: https://github.com/MuhammadMaaz7/Weather-Dashboard
