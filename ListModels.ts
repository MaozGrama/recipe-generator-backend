import axios from "axios";

const API_KEY = process.env.GOOGLE_API_KEY; // put your key in .env
const BASE_URL = "https://generativelanguage.googleapis.com/v1";

async function listModels() {
  try {
    const response = await axios.get(`${BASE_URL}/models?key=${API_KEY}`);
    console.log(response.data);
  } catch (error: any) {
    console.error("Error fetching models:", error.response?.data || error.message);
  }
}

listModels();
