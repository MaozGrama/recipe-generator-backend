import express, { Request, Response } from "express";
import axios from "axios"; // Remove specific AxiosError and AxiosResponse imports
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
  minTime: 200,
  maxConcurrent: 5,
}) as Bottleneck; // Type assertion

// Define the expected response type from Google Custom Search API
interface GoogleSearchResult {
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

const searchGoogle = async (query: string): Promise<{ title: string; link: string; snippet: string } | undefined> => {
  const url = "https://www.googleapis.com/customsearch/v1";
  const params = {
    q: query,
    cx: GOOGLE_CSE_CX,
    key: GOOGLE_CSE_API_KEY,
    lr: isHebrew(query) ? "lang_iw" : undefined,
  };

  try {
    console.log(`[${new Date().toISOString()}] Sending search request to Google with query: "${query}"`);
    const response = await limiter.schedule(() => axios.get<GoogleSearchResult>(url, { params }));
    console.log(`[${new Date().toISOString()}] Successfully received response from Google.`);

    const searchResult = response.data;
    if (searchResult.items && searchResult.items.length > 0) {
      console.log(`[${new Date().toISOString()}] Found ${searchResult.items.length} search results.`);
      return {
        title: searchResult.items[0].title,
        link: searchResult.items[0].link,
        snippet: searchResult.items[0].snippet,
      };
    } else {
      console.warn(`[${new Date().toISOString()}] No search results returned from Google for this query.`);
      return undefined;
    }
  } catch (error: any) { // Use 'any' temporarily to bypass strict typing, refine later
    if (axios.isAxiosError(error)) {
      console.error(
        `[${new Date().toISOString()}] Error on attempt for ${query}: AxiosError: ${error.message}, status: ${error.response?.status}`
      );
      if (error.response?.status === 403) {
        console.error("403 Forbidden: Check your API key and Custom Search Engine ID.");
      } else if (error.response?.status === 400) {
        console.error("400 Bad Request: Check your query parameters.");
      }
    } else {
      console.error(`[${new Date().toISOString()}] Error searching for ${query}:`, error);
    }
    throw error;
  }
};

const getDealsForItems = async (items: string[], location: { lat: number; lon: number } | undefined) => {
  const deals: { [key: string]: { description: string; link: string } } = {};
  const supermarkets = [
    { name: "שופרסל", domain: "shufersal.co.il" },
    { name: "רמי לוי", domain: "ramilevi.co.il" },
    { name: "יוחננוף", domain: "yohananof.co.il" },
    { name: "ויקטורי", domain: "victory.co.il" },
  ];

  await Promise.all(
    items.map(async (item) => {
      for (const supermarket of supermarkets) {
        const strictQuery = `"${item}" "מבצע" "מחיר" site:${supermarket.domain}`;
        try {
          const result = await searchGoogle(strictQuery);
          if (result) {
            console.log(`[${new Date().toISOString()}] Found a specific deal for "${item}" at ${supermarket.name}.`);
            deals[item] = { description: result.title, link: result.link };
            return;
          }
        } catch (err: any) {
          console.error(`[${new Date().toISOString()}] Failed to get deal for ${item} from ${supermarket.name} with strict query:`, err);
        }

        const fallbackQuery = `${item} מבצע site:${supermarket.domain}`;
        try {
          const result = await searchGoogle(fallbackQuery);
          if (result) {
            console.log(`[${new Date().toISOString()}] Found a fallback deal for "${item}" at ${supermarket.name}.`);
            deals[item] = { description: result.title, link: result.link };
            return;
          }
        } catch (err: any) {
          console.error(`[${new Date().toISOString()}] Failed to get deal for ${item} from ${supermarket.name} with fallback query:`, err);
        }
      }
    })
  );
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