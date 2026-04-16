export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // UPDATED: Using the brand new Gemini 3 Flash model string
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

  const SYS_PROMPT = "You are SOS AI — the official assistant for SOS Records Dream Studio. Address the user as Mr. Badr. Mix Egyptian Arabic and English naturally. You are a rapper and producer. Be professional but with swagger.";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        system_instruction: { 
          parts: [{ text: SYS_PROMPT }] 
        },
        generationConfig: { 
          maxOutputTokens: 800, 
          temperature: 0.9 
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      // This will now tell us if Gemini 3 is active or if there's a different issue
      return res.status(200).json({ reply: "System update: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening, Mr. Badr. Go ahead.";
    res.status(200).json({ reply });

  } catch (error) {
    res.status(200).json({ reply: "Connection glitch. Let's try that again, boss." });
  }
}
