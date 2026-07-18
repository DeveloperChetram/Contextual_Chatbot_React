const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

// Uses the free Open-Meteo API + Nominatim geocoding - NO API KEY required
const weatherTool = tool(
    async ({ location }) => {
        try {
            // Step 1: Geocode the location name to lat/lon using Nominatim (free)
            const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: { q: location, format: "json", limit: 1 },
                headers: { "User-Agent": "ContextualChatbotAgent/1.0" },
            });

            if (!geoRes.data || geoRes.data.length === 0) {
                return `Could not find location: "${location}". Please be more specific.`;
            }

            const { lat, lon, display_name } = geoRes.data[0];

            // Step 2: Fetch weather from Open-Meteo (free, no key)
            const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
                params: {
                    latitude: lat,
                    longitude: lon,
                    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature",
                    wind_speed_unit: "kmh",
                    timezone: "auto",
                },
            });

            const cur = weatherRes.data.current;
            const weatherCodes = {
                0: "☀️ Clear sky", 1: "🌤 Mainly clear", 2: "⛅ Partly cloudy", 3: "☁️ Overcast",
                45: "🌫 Foggy", 48: "🌫 Depositing rime fog",
                51: "🌦 Light drizzle", 61: "🌧 Slight rain", 63: "🌧 Moderate rain", 65: "🌧 Heavy rain",
                71: "🌨 Slight snow", 73: "🌨 Moderate snow", 75: "❄️ Heavy snow",
                80: "🌦 Slight showers", 81: "🌧 Moderate showers", 82: "⛈ Violent showers",
                95: "⛈ Thunderstorm", 96: "⛈ Thunderstorm with hail",
            };

            const condition = weatherCodes[cur.weather_code] || `Weather code: ${cur.weather_code}`;

            return `Weather for ${display_name}:\n` +
                `Condition: ${condition}\n` +
                `Temperature: ${cur.temperature_2m}°C (feels like ${cur.apparent_temperature}°C)\n` +
                `Humidity: ${cur.relative_humidity_2m}%\n` +
                `Wind Speed: ${cur.wind_speed_10m} km/h\n` +
                `(Data from Open-Meteo — updated hourly)`;
        } catch (error) {
            return `Error fetching weather: ${error.message}`;
        }
    },
    {
        name: "weather",
        description: "Fetches current real-time weather for any city or location worldwide. Returns temperature, humidity, wind speed, and conditions. No API key needed.",
        schema: z.object({
            location: z.string().describe("City name or location to get weather for. E.g. 'Mumbai', 'New York', 'London, UK'."),
        }),
    }
);

module.exports = weatherTool;
