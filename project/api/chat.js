export default async function handler(req, res) {
  // 1. Only allow POST
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // 2. The most stable URL for your region
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        system_instruction: { 
          parts: [{ text: "You are SOS AI from SOS Records. Rap/Producer persona. Address user as Mr. Badr." }] 
        }
      })
    });

    const data = await response.json();

    // 3. Handle Google Errors specifically
    if (data.error) {
      return res.status(200).json({ reply: "Google says: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here, but I have no words. Try again!";
    res.status(200).json({ reply });

  } catch (error) {
    // 4. If this runs, it's a Vercel/Network issue
    res.status(200).json({ reply: "Vercel Connection issue. Please check your API Key in Settings." });
  }
}
