import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config({});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

export default verifyGoogleToken;
