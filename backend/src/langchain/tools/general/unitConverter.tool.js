const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const unitConverterTool = tool(
    async ({ value, fromUnit, toUnit, category }) => {
        try {
            const conversions = {
                // Length (base: meter)
                length: {
                    mm: 0.001, cm: 0.01, m: 1, km: 1000,
                    inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344,
                },
                // Weight (base: kg)
                weight: {
                    mg: 0.000001, g: 0.001, kg: 1, tonne: 1000,
                    oz: 0.0283495, lb: 0.453592, stone: 6.35029,
                },
                // Speed (base: m/s)
                speed: {
                    "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444,
                },
                // Area (base: m²)
                area: {
                    "m2": 1, "km2": 1000000, "cm2": 0.0001,
                    "ft2": 0.092903, "acre": 4046.86, "hectare": 10000,
                },
                // Volume (base: litre)
                volume: {
                    ml: 0.001, l: 1, "m3": 1000, gallon: 3.78541,
                    pint: 0.473176, cup: 0.236588, "fl_oz": 0.0295735,
                },
            };

            // Temperature handled separately
            if (category === "temperature" || fromUnit === "c" || fromUnit === "f" || fromUnit === "k") {
                const from = fromUnit.toLowerCase();
                const to = toUnit.toLowerCase();
                let celsius;

                if (from === "c") celsius = value;
                else if (from === "f") celsius = (value - 32) * 5 / 9;
                else if (from === "k") celsius = value - 273.15;
                else return `Unknown temperature unit: ${fromUnit}`;

                let result;
                if (to === "c") result = celsius;
                else if (to === "f") result = celsius * 9 / 5 + 32;
                else if (to === "k") result = celsius + 273.15;
                else return `Unknown temperature unit: ${toUnit}`;

                return `${value} ${fromUnit.toUpperCase()} = ${result.toFixed(4)} ${toUnit.toUpperCase()}`;
            }

            const cat = category?.toLowerCase();
            const table = conversions[cat];
            if (!table) {
                return `Unknown category '${category}'. Supported: length, weight, speed, area, volume, temperature.`;
            }

            const from = fromUnit.toLowerCase();
            const to = toUnit.toLowerCase();

            if (!table[from]) return `Unknown unit '${fromUnit}' in category '${category}'.`;
            if (!table[to]) return `Unknown unit '${toUnit}' in category '${category}'.`;

            const inBase = value * table[from];
            const result = inBase / table[to];

            return `${value} ${fromUnit} = ${result.toFixed(6)} ${toUnit}`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "unit_converter",
        description: "Converts values between different units. Supports length, weight, speed, area, volume, and temperature. Examples: 5 km to miles, 100 lb to kg, 25 Celsius to Fahrenheit.",
        schema: z.object({
            value: z.number().describe("The numeric value to convert."),
            fromUnit: z.string().describe("The unit to convert FROM. E.g. 'km', 'lb', 'c', 'mph'."),
            toUnit: z.string().describe("The unit to convert TO. E.g. 'mile', 'kg', 'f', 'km/h'."),
            category: z.string().describe("Category: 'length', 'weight', 'speed', 'area', 'volume', or 'temperature'."),
        }),
    }
);

module.exports = unitConverterTool;
