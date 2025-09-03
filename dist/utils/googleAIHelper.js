"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecipes = generateRecipes;
// backend/utils/googleAIHelper.ts
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
