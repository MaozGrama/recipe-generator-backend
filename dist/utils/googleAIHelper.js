"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecipes = generateRecipes;
exports.generateSmartQuery = generateSmartQuery;
exports.analyzeSearchResults = analyzeSearchResults;
const generativelanguage_1 = require("@google-ai/generativelanguage");
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY)
    throw new Error("Missing GOOGLE_API_KEY in environment variables");
const auth = new google_auth_library_1.GoogleAuth().fromAPIKey(API_KEY);
const client = new generativelanguage_1.v1.GenerativeServiceClient({ authClient: auth });
async function generateRecipes(pantryItems) {
    if (!pantryItems || pantryItems.length === 0) {
        console.warn("No pantry items provided, returning fallback recipes");
        return [
            {
                title: "מתכון לדוגמה",
                ingredients: ["מצרכים לדוגמה"],
                instructions: ["מערבבים את המצרכים", "מבשלים", "מגישים"],
            },
        ];
    }
    const promptText = `Create 3 simple recipes using these ingredients: ${pantryItems.join(", ")}. 
also if the item is in hebrew respond in HEBREW
IMPORTANT: Respond with ONLY valid JSON in this exact format:
[
  {
    "title": "Recipe Name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2", "step 3"]
  }
]
Do not include any text before or after the JSON. Only return the JSON array.`;
    try {
        const request = {
            model: "models/gemini-1.5-flash-8b",
            contents: [
                {
                    parts: [
                        {
                            text: promptText,
                        },
                    ],
                },
            ],
        };
        const [response] = (await client.generateContent(request));
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.warn("No AI text returned, using fallback recipe");
            return [
                {
                    title: "מתכון לדוגמה",
                    ingredients: ["מצרכים לדוגמה"],
                    instructions: ["מערבבים את המצרכים", "מבשלים", "מגישים"],
                },
            ];
        }
        try {
            let cleanText = text.trim().replace(/```json\s*/g, "").replace(/```\s*$/g, "");
            const jsonStart = cleanText.indexOf("[");
            const jsonEnd = cleanText.lastIndexOf("]");
            if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
                throw new Error("Invalid JSON structure in AI response");
            }
            cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
            console.log("Attempting to parse:", cleanText);
            const recipes = JSON.parse(cleanText);
            return Array.isArray(recipes) ? recipes : [recipes];
        }
        catch (parseError) {
            console.warn("Failed to parse AI JSON:", parseError.message);
            console.warn("Raw AI response:", text);
            return [
                {
                    title: "מתכון לדוגמה",
                    ingredients: ["מצרכים לדוגמה"],
                    instructions: ["מערבבים את המצרכים", "מבשלים", "מגישים"],
                },
            ];
        }
    }
    catch (err) {
        console.error("Google AI fetch failed, returning fallback:", err.message);
        return [
            {
                title: "מתכון לדוגמה",
                ingredients: ["מצרכים לדוגמה"],
                instructions: ["מערבבים את המצרכים", "מבשלים", "מגישים"],
            },
        ];
    }
}
async function generateSmartQuery(item, lat, lon) {
    const currentDate = new Date().toLocaleDateString("he-IL");
    const prompt = `
    Create a precise Google search query in Hebrew to find current grocery deals for "${item}" in the vicinity of latitude ${lat}, longitude ${lon}.
    Focus on major Israeli supermarkets like "שופרסל", "רמי לוי", and "יוחננוף".
    The query should be short and use terms like "מבצע", "הנחה", "דיל". Also, include the current date "${currentDate}" to ensure fresh results.
    Example: "מבצע שופרסל חלב יום חמישי".
    Don't include any extra text, just the search query.
  `;
    const request = {
        model: "models/gemini-1.5-flash",
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ],
    };
    const [response] = (await client.generateContent(request));
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "מבצעים ";
}
async function analyzeSearchResults(searchResults, item) {
    const searchResultText = searchResults.map(s => `Title: ${s.title}\nSnippet: ${s.snippet}\nLink: ${s.link}`).join("\n\n---\n\n");
    const prompt = `
    Analyze the following search results to find the best current deal for "${item}".
    Extract the deal description and a direct link to the source.
    If no clear deal is found, state "לא נמצאו מבצעים".
    Provide the output in a JSON object with the keys "description" and "link".
    
    Search Results:
    ${searchResultText}
  `;
    const request = {
        model: "models/gemini-1.5-flash",
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ],
    };
    try {
        const [response] = (await client.generateContent(request));
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            throw new Error("No text returned from AI");
        let cleanText = text.trim().replace(/```json\s*/g, "").replace(/```\s*$/g, "");
        const parsedJson = JSON.parse(cleanText);
        return parsedJson;
    }
    catch (error) {
        console.error("Error parsing AI response for deals:", error.message);
        return { description: "שגיאה בסיכום המבצעים", link: null };
    }
}
