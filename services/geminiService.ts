import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_PROFILES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the Bio Generator
const BIO_SYSTEM_INSTRUCTION = `You are an expert profile writer for a matrimony website. 
Your goal is to write a warm, engaging, and professional bio based on the user's details.
Keep it between 40-60 words. Emphasize values, career, and what they are looking for.`;

export const generateBio = async (userDetails: any): Promise<string> => {
  try {
    const prompt = `Write a matrimony profile bio for:
    Name: ${userDetails.name}
    Profession: ${userDetails.profession}
    Hobbies: ${userDetails.hobbies}
    Personality Traits: ${userDetails.traits || 'Friendly, Ambitious'}
    Looking for: ${userDetails.partnerPref || 'A supportive partner'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: BIO_SYSTEM_INSTRUCTION,
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    return response.text || "Could not generate bio. Please try again.";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "An error occurred while generating the bio.";
  }
};

// Matchmaking Chat
export const getMatchmakerResponse = async (
  userMessage: string,
  chatHistory: { role: string; parts: { text: string }[] }[]
): Promise<{ text: string; recommendedProfileIds?: string[]; groundingChunks?: any[] }> => {
  try {
    // Simplify profiles for context window efficiency
    const profilesContext = MOCK_PROFILES.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      religion: p.religion,
      caste: p.caste,
      subCaste: p.subCaste,
      profession: p.profession,
      location: p.location,
      bio: p.bio
    }));

    const systemInstruction = `You are 'SoulmateBot', a helpful and empathetic matchmaking assistant on SoulmateAI.
    You have access to a database of profiles: ${JSON.stringify(profilesContext)}.
    
    Your tasks:
    1. Answer user queries about dating, relationships, cultural wedding trends, or using the app. Use the Google Search tool to find up-to-date information if needed (e.g., "latest wedding color trends 2024", "best date spots in Delhi").
    2. Recommend profiles based on user requirements (e.g., "Find me a doctor in Mumbai" or "Looking for a Brahmin bride from Kanyakubja subcaste").
    3. If you recommend profiles, you MUST return a JSON object ONLY for the recommendations part in the following format inside a code block:
    \`\`\`json
    {
      "recommendedIds": ["1", "2"],
      "reason": "Brief explanation..."
    }
    \`\`\`
    
    If the user is just chatting, just reply normally. If they ask for matches, reply with the text introduction followed by the JSON block.
    Be polite, respectful, and encouraging.
    `;

    const model = 'gemini-2.5-flash';

    // Construct the conversation history for the API
    const contents = [
      ...chatHistory.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: msg.parts
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    const responseText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    // Parse for JSON recommendation block
    let recommendedProfileIds: string[] | undefined;
    let finalText = responseText;

    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const jsonContent = JSON.parse(jsonMatch[1]);
        if (jsonContent.recommendedIds && Array.isArray(jsonContent.recommendedIds)) {
          recommendedProfileIds = jsonContent.recommendedIds;
        }
        // Remove the JSON block from the display text to keep it clean, or keep it if it contains the reason.
        // Let's strip the JSON block for the UI text, assuming the bot introduces it.
        finalText = responseText.replace(jsonMatch[0], "").trim();
        if (jsonContent.reason) {
          finalText += `\n\n${jsonContent.reason}`;
        }
      } catch (e) {
        console.warn("Failed to parse matchmaker JSON", e);
      }
    }

    return {
      text: finalText,
      recommendedProfileIds,
      groundingChunks
    };

  } catch (error) {
    console.error("Matchmaker API Error:", error);
    const key = process.env.API_KEY || "undefined";
    const maskedKey = key.length > 10 ? `${key.substring(0, 5)}...${key.substring(key.length - 5)}` : key;
    return { text: `Connection error: ${(error as any).message || "Unknown error"}. Key used: ${maskedKey}. Please check your API key.` };
  }
};