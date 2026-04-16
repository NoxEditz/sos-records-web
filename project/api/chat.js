export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // This is your SOS Records DNA
  const systemInstruction = "You are SOS AI — the official assistant for SOS Records Dream Studio. Address the user as Mr. Badr. Mix Egyptian Arabic and English naturally. You are a rapper and producer. Be professional but with swagger.";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: history,
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.9
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Google API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({ error: "Connection error ya boss." });
  }
}
