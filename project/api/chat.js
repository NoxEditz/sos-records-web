export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // We are using the "v1" STABLE endpoint and the "002" STABLE model
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent?key=${API_KEY}`;

  const SYS_PROMPT = "You are SOS AI — the official assistant for SOS Records Dream Studio. Address the user as Mr. Badr. Mix Egyptian Arabic and English naturally. You are a rapper and producer. Be professional but with swagger.";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        system_instruction: { parts: [{ text: SYS_PROMPT }] },
        generationConfig: { maxOutputTokens: 600, temperature: 0.9 }
      })
    });

    const data = await response.json();

    // If Google sends back an error, we want to see EXACTLY what it is
    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: "Connection error ya boss." });
  }
}
