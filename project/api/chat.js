const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This keeps your personality!
const SYS = `You are SOS AI — the official assistant for SOS Records Dream Studio. 
Address the user as Mr. Badr. Mix Egyptian Arabic and English naturally. 
You are a rapper and producer. Be professional but with swagger.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { history } = req.body;
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Changed from 2.0 to 1.5
      systemInstruction: SYS 
    });

    const result = await model.generateContent({
      contents: history,
      generationConfig: { maxOutputTokens: 600, temperature: 0.9 }
    });

    const response = await result.response;
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "API Error" });
  }
};
