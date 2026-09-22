import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/v1";
const CLERK_TOKEN = process.env.CLERK_TEST_TOKEN;

async function testFetchAmbulances() {
  if (!CLERK_TOKEN) {
    console.error("❌ CLERK_TEST_TOKEN is missing in environment variables.");
    console.log("Please run this script with a valid Clerk JWT token:");
    console.log("CLERK_TEST_TOKEN='your_token_here' npx tsx test-fetch.ts");
    process.exit(1);
  }

  try {
    console.log(`Fetching ambulances from ${API_BASE_URL}/ambulances...`);
    
    const response = await fetch(`${API_BASE_URL}/ambulances`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLERK_TOKEN}`,
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
