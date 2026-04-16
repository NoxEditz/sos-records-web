export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // 1. The URL (Using v1beta because it supports System Instructions better)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // 2. Your Persona
  const SYS_PROMPT = "You are SOS AI — the official assistant for SOS Records Dream Studio. Address the user as Mr. Badr. Mix Egyptian Arabic and English naturally. You are a rapper and producer. Be professional but with swagger.";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // We attach the instruction directly here
        system_instruction: {
          parts: [{ text: SYS_PROMPT }]
        },
        contents: history,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.9
        }
      })
    });

    const data = await response.json();

    // Check for Safety Blocks or Errors
    if (data.error) {
      return res.status(500).json({ reply: `Error: ${data.error.message}` });
    }

    // If Google blocked the response for safety, it might be empty
    if (!data.candidates || data.candidates.length === 0) {
      return res.status(200).json({ reply: "I'm here, Mr. Badr, but the connection dropped. Try saying 'Hey' again!" });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "Connection glitch. Let's try that again, boss." });
  }
}
