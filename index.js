const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateKeyPairSync } = require("crypto");
const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());

const JWT_SECRET = crypto.randomBytes(64).toString("hex");
//Simulation of DataBase---
// here should contain several DB operations,
// i mock it by
// 1. hallucinations AS data table
// 2. a simple function getApiKey & modelId2orgId AS operations
// 3. keysStore store the map from org_id to keys
let hallucinations = [];
function getApiKey() {
  return "abc123";
}
function modelId2orgId(model_id) {
  return "123";
}
// according to NOTES, use RSA for private/public key pair
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
// we should use something outside the backend app like OpenSSL
// the following 2 keys are just a simulation
const PRIV_KEY = privateKey.export({ type: "pkcs1", format: "pem" });
const PUB_KEY = publicKey.export({ type: "spki", format: "pem" });
const keysStore = {
  123: { encryptionKey: PUB_KEY, decryptionKey: PRIV_KEY },
};
//---Simulation of DataBase

function encrypt(text, publicKey) {
  const buffer = Buffer.from(text, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

function decrypt(encryptedText, privateKey) {
  try {
    const buffer = Buffer.from(encryptedText, "base64");
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("解密错误:", error);
    throw error;
  }
}

app.post("/authenticate", (req, res) => {
  const { API_KEY, model_id } = req.body;

  // Task 1.a(See Task Number at README.md)
  if (API_KEY !== getApiKey()) {
    return res.status(401).json({ error: "Authentication failed" });
  }
  // Task 1.b
  const org_id = modelId2orgId(model_id);
  const token = jwt.sign({ org_id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ org_id, token });
});

app.post("/hallucination", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const { prompt, response } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const org_id = decoded.org_id;
    const encryptionKey = keysStore[org_id].encryptionKey;

    // Task 2.a
    const encryptedPrompt = encrypt(prompt, encryptionKey);
    const encryptedResponse = encrypt(response, encryptionKey);

    // Task 2.b
    const hallucinationRecord = {
      id: hallucinations.length + 1,
      prompt: encryptedPrompt,
      response: encryptedResponse,
      org_id,
    };
    hallucinations.push(hallucinationRecord);

    res.json({
      message: "Hallucination submitted successfully",
      id: hallucinationRecord.id,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/hallucination", (req, res) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const org_id = decoded.org_id;
    const decryptionKey = keysStore[org_id].decryptionKey;
    // Task 3.a

    const decryptedData = hallucinations
      .filter((h) => h.org_id === org_id)
      .map((h) => {
        return {
          id: h.id,
          prompt: decrypt(h.prompt, decryptionKey),
          response: decrypt(h.response, decryptionKey),
        };
      });

    res.json(decryptedData);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
