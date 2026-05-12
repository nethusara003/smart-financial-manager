import jwt from "jsonwebtoken";

const baseUrl = "http://localhost:5000";
const JWT_SECRET = "supersecretkey123"; // from .env

const requestJson = async (path, options = {}) => {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const rawBody = await response.text();
    let body = null;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }

    return { status: response.status, body };
  } catch (error) {
    return { status: 500, body: error.message };
  }
};

const run = async () => {
  // Try real login if possible, but let's use a generated token for a known user if possible
  // Or just guest login
  console.log("--- Testing Guest Login ---");
  const guestLogin = await requestJson("/api/users/guest-login", { method: "POST", body: {} });
  console.log("Guest Login Status:", guestLogin.status);
  
  if (guestLogin.status === 200 && guestLogin.body?.token) {
    const token = guestLogin.body.token;
    
    console.log("--- Testing Transactions ---");
    const tx = await requestJson("/api/transactions?scope=all", { token });
    console.log("Transactions Status:", tx.status);
    console.log("Transactions Body:", JSON.stringify(tx.body).substring(0, 200));

    console.log("--- Testing Notifications ---");
    const notif = await requestJson("/api/notifications?unreadOnly=true", { token });
    console.log("Notifications Status:", notif.status);
    console.log("Notifications Body:", JSON.stringify(notif.body).substring(0, 200));
  } else {
    console.error("Guest login failed");
  }
};

run();
