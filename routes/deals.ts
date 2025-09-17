import express, { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import Bottleneck from "bottleneck";
import { isHebrew } from "../utils/text";

const router = express.Router();

// Validate request body
const DealsRequestSchema = z.object({
  items: z.array(z.string().min(1)),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
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
const limiter = new Bottleneck({
  minTime: 200, // Minimum time between requests (in ms) to avoid hitting rate limits
  maxConcurrent: 5, // Maximum number of concurrent requests
});

const searchGoogle = async (query: string) => {
  const url = "https://www.googleapis.com/customsearch/v1";
  const params = {
    q: query,
    cx: GOOGLE_CSE_CX,
    key: GOOGLE_CSE_API_KEY,
    lr: isHebrew(query) ? "lang_iw" : undefined, // Set language for Hebrew searches
  };

  try {
    console.log(`Sending search request to Google with query: "${query}"`);
    const response = await limiter.schedule(() => axios.get(url, { params }));
    console.log("Successfully received response from Google.");

    const searchResult = response.data;
    if (searchResult.items && searchResult.items.length > 0) {
      console.log(`Found ${searchResult.items.length} search results.`);
      return {
        title: searchResult.items[0].title,
        link: searchResult.items[0].link,
        snippet: searchResult.items[0].snippet,
      };
    } else {
      console.warn("No search results returned from Google for this query. The API call was successful but found no deals.");
      return undefined; // Explicitly return undefined if no items are found.
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(
        `Error on attempt 2 for ${query}: AxiosError: ${error.message}, status: ${error.response?.status}`
      );
      if (error.response?.status === 403) {
        console.error("403 Forbidden: Check your API key and Custom Search Engine ID.");
      } else if (error.response?.status === 400) {
        console.error("400 Bad Request: Check your query parameters.");
      }
    } else {
      console.error(`Error searching for ${query}:`, error);
    }
    throw error;
  }
};

const getDealsForItems = async (items: string[], location: { lat: number; lon: number } | undefined) => {
  const deals: { [key: string]: { description: string; link: string } } = {};
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
      } catch (err) {
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
      } catch (err) {
        console.error(`Failed to get deal for ${item} from ${supermarket.name} with fallback query:`, err);
      }
    }
  }));
  return deals;
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { items, location } = DealsRequestSchema.parse(req.body);
    const deals = await getDealsForItems(items, location);
    res.json({ deals });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data." });
    } else {
      res.status(500).json({ error: "Failed to fetch deals due to an internal server error." });
    }
  }
});

export default router;
