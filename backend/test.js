import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = "https://api.ecoledirecte.com";
const VERSION = "4.75.0";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36";

async function getGTK() {
  console.log("📞 Fetching GTK...");

  const res = await axios.get(`${API_URL}/v3/login.awp?gtk=1&v=${VERSION}`, {
    headers: { "User-Agent": UA },
    validateStatus: s => s < 500,
  });

  const setCookies = res.headers['set-cookie'] ?? [];
  console.log("🍪 Raw set-cookie headers:", setCookies);

  let gtkValue = null;
  // Build the full cookie string from ALL cookies returned — not just GTK
  const allCookies = setCookies.map(c => c.split(';')[0]); // "NAME=VALUE" part only
  const cookieHeader = allCookies.join('; ');

  for (const cookie of setCookies) {
    const match = cookie.match(/GTK=([^;]+)/);
    if (match) gtkValue = match[1];
  }

  if (!gtkValue) throw new Error("GTK cookie not found in response");

  console.log("🔑 GTK value:", gtkValue);
  console.log("🍪 Full cookie header:", cookieHeader);

  return { gtkValue, cookieHeader };
}

export async function connectToAPI() {
  const { gtkValue, cookieHeader } = await getGTK();

  console.log("📲 Logging in...");

  // Do NOT encode the credentials — pass them as plain strings inside JSON
  const credentials = {
    identifiant: process.env.ED_USER,
    motdepasse: process.env.ED_PASS,
    isRelogin: false,
    uuid: "",
    fa: [{ cn: "", cv: "" }],
  };

  const body = `data=${JSON.stringify(credentials)}`;
  console.log("📦 Body:", body);

  const res = await axios.post(
    `${API_URL}/v3/login.awp?v=${VERSION}`,
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
        "X-GTK": gtkValue,       // ALL-CAPS as seen in working implementations
        "Cookie": cookieHeader,  // ALL cookies from the GTK response, not just GTK
      },
    }
  );

  const data = res.data;
  console.log("📊 Response code:", data.code, "| message:", data.message);

  switch (data.code) {
    case 200:
      console.log("✅ Logged in successfully!");
      return data;
    case 250:
      throw new Error("QCM_REQUIRED");
    case 505:
      throw new Error(`Invalid credentials (505): ${data.message}`);
    default:
      throw new Error(`API error ${data.code}: ${data.message}`);
  }
}

function encodeStringValueToUTF8(str) {
    return (
      encodeURIComponent(str)
        .replace(
          /['()*]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
        )
        .replace(/%(7C|60|5E)/g, (str, hex) =>
          String.fromCharCode(parseInt(hex, 16)),
        )
    );
}

connectToAPI();