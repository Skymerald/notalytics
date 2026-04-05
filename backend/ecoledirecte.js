import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const host = "api.ecoledirecte.com";
const userAgent = "Mozilla/5.0";

async function getToken(){
    const path = "/v3/login.awp?gtk=1&v=4.75.0";

    console.log("📞 Fetching the token for ED API");

    return new Promise((resolve, reject) => {
        
        const options = {
            hostname: host,
            path: path,
            method: "GET",
            headers: {
                "User-Agent": userAgent
            }
        };

        const req = https.request(options, (res) => {
            console.log("📡ED API Status Code:", res.statusCode);
                
            try {
                const token = res.headers['set-cookie'];
                    
                if (token && token.length > 0) {
                    let tokenString = token[0];

                    const gtkMatch = tokenString.match(/GTK=([^;]+)/);
                        
                    if (gtkMatch && gtkMatch[1]) {
                        const gtkValue = gtkMatch[1];
                        console.log("🔑 GTK Token : ",gtkMatch[1]);
                        resolve(gtkValue);
                    } else {
                        reject(new Error("❌ Could not extract GTK value from cookie"));
                    }
                } else {
                    console.log("❌ No token, rejecting...");
                    reject(new Error("❌ No token found in response"));
                }
            } catch (e) {
                console.log("❌ Error in try-catch:", e);
                reject(e);
            }
        });

        req.on("error", (error) => {
            console.error("❌ Request error:", error);
            reject(error);
        });

        req.end();
    });
}

export async function connectToAPI(){
    const path = "/v3/login.awp?v=4.75.0";

    return new Promise(async (resolve, reject) =>{
        const token = await getToken();

        console.log("📲 Login to ED API ...");

        // Let's log the credentials (remove password from log in production!)
        console.log("👤 Username:", process.env.ED_USER);
        console.log("🔒 Password length:", process.env.ED_PASS?.length);

        // Prepare the login payload
        const loginPayload = {
            "identifiant": encodeStringValueToUTF8(process.env.ED_USER),
            "motdepasse": encodeStringValueToUTF8(process.env.ED_PASS),
            "isRelogin": false
        };

        console.log("📦 Login payload:", loginPayload);

        // Format as EcoleDirecte expects: data=<JSON>
        const bodyData = `data=${JSON.stringify(loginPayload)}`;

        console.log("📨 Body being sent:", bodyData);

        const options = {
            hostname: host,
            path: path,
            method: 'POST',
            headers: {
                "X-Token": token, // Some sources say it should be "X-Token", others "x-gtk"
                "User-Agent": userAgent,
                "Content-Type": "text/plain"
            },
            body: bodyData
        };

        const req = https.request(options, (res) => {
            console.log("📡 ED API Status Code:", res.statusCode);
            console.log("📋 Response Headers:", res.headers);

            try{
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    console.log("📼 Raw Data:", data);

                    try {
                        const parsedData = JSON.parse(data);
                        console.log("📊 Parsed Data:", JSON.stringify(parsedData, null, 2));
                        
                        if(parsedData.code == 200){
                            console.log("✅ Connected to API");
                            resolve(parsedData);
                        }
                        else if (parsedData.code == 250){
                            console.log("⁉️ QCM needed to continue");
                            reject(new Error("QCM needed"));
                        }
                        else{
                            console.log("💥 Error from API:", parsedData.message);
                            reject(new Error(`API Error (${parsedData.code}): ${parsedData.message}`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Failed to parse response: ${parseError.message}`));
                    }
                });
            } catch (e) {
                console.log("❌ Error in try-catch:", e);
                reject(e);
            }
        });

        req.on("error", (error) => {
            console.error("❌ Request error:", error);
            reject(error);
        });

        req.write(bodyData);
        req.end();
    });
}

function getTimeTable(){

}

function checkTimeTable(){

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