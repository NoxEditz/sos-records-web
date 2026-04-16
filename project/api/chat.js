export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // We are using the most available "v1" path and the base model ID
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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

    // If Google still says 404, we will try the 'latest' alias immediately
    if (data.error && data.error.code === 404) {
       const retryUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
       const retryResponse = await fetch(retryUrl, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           contents: history,
           system_instruction: { parts: [{ text: SYS_PROMPT }] }
         })
       });
       const retryData = await retryResponse.json();
       return res.status(200).json({ reply: retryData.candidates?.[0]?.content?.parts?.[0]?.text || "Still blocked ya boss." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: "Connection error ya boss." });
  }
}
