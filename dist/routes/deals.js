"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importStar(require("axios"));
const zod_1 = require("zod");
const bottleneck_1 = __importDefault(require("bottleneck"));
const text_1 = require("../utils/text");
const router = express_1.default.Router();
// Validate request body
const DealsRequestSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.string().min(1)),
    location: zod_1.z
        .object({
        lat: zod_1.z.number().min(-90).max(90),
        lon: zod_1.z.number().min(-180).max(180),
    })
        .optional(),
});
// Use environment variables for API keys and IDs
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_CX = process.env.GOOGLE_SEARCH_CX;
// Check if the environment variables are set correctly
if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_CX) {
    console.error("Missing Google Custom Search API Key or CX from environment variables.");
}
// Create a rate limiter for Google API requests
const limiter = new bottleneck_1.default({
    minTime: 200, // Minimum time between requests (in ms) to avoid hitting rate limits
    maxConcurrent: 5, // Maximum number of concurrent requests
});
const searchGoogle = async (query) => {
    const url = "https://www.googleapis.com/customsearch/v1";
    const params = {
        q: query,
        cx: GOOGLE_CSE_CX,
        key: GOOGLE_CSE_API_KEY,
        lr: (0, text_1.isHebrew)(query) ? "lang_iw" : undefined, // Set language for Hebrew searches
    };
    try {
        console.log(`Sending search request to Google with query: "${query}"`);
        const response = await limiter.schedule(() => axios_1.default.get(url, { params }));
        console.log("Successfully received response from Google.");
        const searchResult = response.data;
        if (searchResult.items && searchResult.items.length > 0) {
            console.log(`Found ${searchResult.items.length} search results.`);
            return {
                title: searchResult.items[0].title,
                link: searchResult.items[0].link,
                snippet: searchResult.items[0].snippet,
            };
        }
        else {
            console.warn("No search results returned from Google for this query. The API call was successful but found no deals.");
            return undefined; // Explicitly return undefined if no items are found.
        }
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError) {
            console.error(`Error on attempt 2 for ${query}: AxiosError: ${error.message}, status: ${error.response?.status}`);
            if (error.response?.status === 403) {
                console.error("403 Forbidden: Check your API key and Custom Search Engine ID.");
            }
            else if (error.response?.status === 400) {
                console.error("400 Bad Request: Check your query parameters.");
            }
        }
        else {
            console.error(`Error searching for ${query}:`, error);
        }
        throw error;
    }
};
const getDealsForItems = async (items, location) => {
    const deals = {};
    // Map of supermarket names to their domains for more precise searching
    const supermarkets = [
        { name: "שופרסל", domain: "shufersal.co.il" },
        { name: "רמי לוי", domain: "ramilevi.co.il" },
        { name: "יוחננוף", domain: "yohananof.co.il" },
        { name: "ויקטורי", domain: "victory.co.il" },
    ];
    await Promise.all(items.map(async (item) => {
        // Loop through each supermarket to find the best deal
        for (const supermarket of supermarkets) {
            // First, try a very specific query using exact phrases
            const strictQuery = `"${item}" "מבצע" "מחיר" site:${supermarket.domain}`;
            try {
                const result = await searchGoogle(strictQuery);
                if (result) {
                    console.log(`Found a specific deal for "${item}" at ${supermarket.name}.`);
                    deals[item] = {
                        description: result.title,
                        link: result.link,
                    };
                    // Found a deal, so move to the next item
                    return;
                }
            }
            catch (err) {
                console.error(`Failed to get deal for ${item} from ${supermarket.name} with strict query:`, err);
            }
            // If the strict query fails, try a broader fallback query
            const fallbackQuery = `${item} מבצע site:${supermarket.domain}`;
            try {
                const result = await searchGoogle(fallbackQuery);
                if (result) {
                    console.log(`Found a fallback deal for "${item}" at ${supermarket.name}.`);
                    deals[item] = {
                        description: result.title,
                        link: result.link,
                    };
                    // Found a deal, so move to the next item
                    return;
                }
            }
            catch (err) {
                console.error(`Failed to get deal for ${item} from ${supermarket.name} with fallback query:`, err);
            }
        }
    }));
    return deals;
};
router.post("/", async (req, res) => {
    try {
        const { items, location } = DealsRequestSchema.parse(req.body);
        const deals = await getDealsForItems(items, location);
        res.json({ deals });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Invalid request data." });
        }
        else {
            res.status(500).json({ error: "Failed to fetch deals due to an internal server error." });
        }
    }
});
exports.default = router;
