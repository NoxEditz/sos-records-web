export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const STUDIO_DATA = `
  STUDIO: SOS Records (Dream Studio)
  OWNER: Mr. Badr
  SERVICES: Full Production (1500 EGP), Mixing (800 EGP), Beats (1000 EGP).
  STYLE: Trap, Drill, Rage, Melodic.
  `;

  const SYS_PROMPT = `
  You are SOS AI, a world-class Rapper and Producer for SOS Records. 
  1. ALWAYS address the user as Mr. Badr.
  2. Speak in a mix of Egyptian Arabic (Sarsagy/Professional) and English. 
  3. Use clear Markdown formatting (Bolding, Bullet points, Headings).
  4. Never cut off your sentences. If you give technical advice, be concise but complete.
  
  KNOWLEDGE: ${STUDIO_DATA}
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        system_instruction: { parts: [{ text: SYS_PROMPT }] },
        generationConfig: { 
          maxOutputTokens: 1000, // Increased to prevent cutting off
          temperature: 0.8,
          topP: 0.95
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
       return res.status(200).json({ reply: "Ya boss, there's a technical glitch: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm in the booth, Mr. Badr. Try again!";
    
    // This sends the clean text to your site
    res.status(200).json({ reply });

  } catch (error) {
    res.status(200).json({ reply: "Connection glitch. Let's record that take again!" });
  }
}
