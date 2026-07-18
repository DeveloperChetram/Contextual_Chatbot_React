const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const geocodingTool = tool(
    async ({ location }) => {
        try {
            const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: { q: location, format: "json", limit: 3, addressdetails: 1 },
                headers: { "User-Agent": "ContextualChatbot/1.0" },
                timeout: 8000,
            });

            if (!res.data || res.data.length === 0) {
                return `No results found for location: "${location}"`;
            }

            const results = res.data.map((r, i) =>
                `${i + 1}. ${r.display_name}\n   Lat: ${r.lat} | Lon: ${r.lon} | Type: ${r.type}`
            );

            return `Geocoding results for "${location}":\n\n${results.join("\n\n")}`;
        } catch (error) {
            return `Geocoding error: ${error.message}`;
        }
    },
    {
        name: "geocoding",
        description: "Converts a location name or address to geographic coordinates (latitude and longitude).",
        schema: z.object({
            location: z.string().describe("The location name or address to geocode. E.g. 'Eiffel Tower, Paris' or 'Mumbai, India'."),
        }),
    }
);

const distanceTool = tool(
    async ({ place1, place2 }) => {
        try {
            const geocode = async (place) => {
                const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                    params: { q: place, format: "json", limit: 1 },
                    headers: { "User-Agent": "ContextualChatbot/1.0" },
                    timeout: 8000,
                });
                if (!res.data || !res.data[0]) throw new Error(`Location not found: ${place}`);
                return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon), name: res.data[0].display_name };
            };

            const [loc1, loc2] = await Promise.all([geocode(place1), geocode(place2)]);

            // Haversine formula
            const R = 6371; // Earth radius in km
            const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
            const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
            const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceMiles = distanceKm * 0.621371;

            return `Distance between:\n• ${loc1.name}\n• ${loc2.name}\n\nStraight-line (as the crow flies):\n- ${distanceKm.toFixed(2)} km\n- ${distanceMiles.toFixed(2)} miles`;
        } catch (error) {
            return `Error calculating distance: ${error.message}`;
        }
    },
    {
        name: "distance_calculator",
        description: "Calculates the straight-line distance between two places anywhere in the world.",
        schema: z.object({
            place1: z.string().describe("First location. E.g. 'Mumbai, India'."),
            place2: z.string().describe("Second location. E.g. 'Delhi, India'."),
        }),
    }
);

module.exports = { geocodingTool, distanceTool };
