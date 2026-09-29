import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/v1";
const JWT_TOKEN = process.env.JWT_TEST_TOKEN || process.env.JWT_TOKEN;

async function testFetchAmbulances() {
  if (!JWT_TOKEN) {
    console.error("❌ JWT_TEST_TOKEN is missing in environment variables.");
    console.log("Please run this script with a valid JWT token (obtained via /api/v1/auth/login or /api/v1/auth/register):");
    console.log("JWT_TEST_TOKEN='your_jwt_token_here' npx tsx test-fetch.ts");
    process.exit(1);
  }

  try {
    console.log(`Fetching ambulances from ${API_BASE_URL}/ambulances...`);
    
    const response = await fetch(`${API_BASE_URL}/ambulances`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Successfully fetched data!");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error(`❌ Failed to fetch data: ${response.status} ${response.statusText}`);
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Error while fetching data:", error);
  }
}

testFetchAmbulances();
