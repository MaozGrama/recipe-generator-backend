"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_KEY = process.env.GOOGLE_API_KEY; // put your key in .env
const BASE_URL = "https://generativelanguage.googleapis.com/v1";
async function listModels() {
    try {
        const response = await axios_1.default.get(`${BASE_URL}/models?key=${API_KEY}`);
        console.log(response.data);
    }
    catch (error) {
        console.error("Error fetching models:", error.response?.data || error.message);
    }
}
listModels();
