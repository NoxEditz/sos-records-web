export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ reply: "System Error: Invalid chat history received." });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  // 1. The Creative Co-Pilot Persona
  const SYS_PROMPT = `
  You are SOS AI, the elite personal studio assistant and creative co-pilot for Mr. Badr.
  You are an expert in Trap, Drill, and Rage music production, mixing, mastering, and creative lyric writing.
  
  CORE RULES:
  1. ALWAYS address the user as Mr. Badr.
  2. Speak ONLY in English by default. Speak Arabic ONLY if Mr. Badr explicitly asks you to.
  3. You are his personal engineer and co-writer. Your focus is strictly on making the music sound incredible, helping him write fire lyrics, and giving high-level technical advice (like vocal chains, EQ, Auto-Tune, Soothe2, mixing 808s, etc.).
  4. Maintain a professional industry tone with producer swagger.
  
  FORMATTING (CRITICAL STRICT RULE):
  - NEVER use asterisks.
  - NEVER use hashtags.
  - NEVER use any Markdown formatting whatsoever. 
  - Use capital letters if you need to emphasize a word.
  - Use standard spaces and dashes (-) for lists.
  - Keep your text completely plain, clean, and easy to read.
  - Do not cut off your sentences.
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
          maxOutputTokens: 1500, 
          temperature: 0.85, // Slightly higher for better creative lyric writing
          topK: 40,
          topP: 0.95
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
       console.error("API Error Details:", data);
       return res.status(200).json({ reply: `API Notice [${response.status}]: ${data.error?.message || "Unknown error"}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm in the booth, Mr. Badr. What are we working on?";
    
    // 2. Extra Safety Net: Strip out any stray markdown characters before sending
    const cleanReply = reply.replace(/[*#_`~]/g, '');

    res.status(200).json({ reply: cleanReply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(200).json({ reply: "Critical server glitch. Let's reboot the session." });
  }
}
