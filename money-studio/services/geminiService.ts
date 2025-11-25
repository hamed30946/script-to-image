import { GoogleGenAI, Type } from "@google/genai";
import { Scene, GenerationOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScript = async (options: GenerationOptions): Promise<Scene[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const { script, niche, styleKeywords, referenceImage, aspectRatio } = options;

  // Construct the text prompt
  let promptText = `
    You are an expert visual director. Analyze the following script and break it down into distinct visual scenes.
    
    Context/Niche: ${niche || "General"}
    Visual Style Requirements: ${styleKeywords || "Cinematic, Detailed"}
    Aspect Ratio: ${aspectRatio || "16:9"}

    Script Content:
    "${script}"

    Task:
    1. Identify logical scenes or key visual moments from the script.
    2. For each scene, write a "Scene Description" (what is happening).
    3. Write a highly detailed "Image Prompt" for an AI image generator (like Midjourney/DALL-E) that captures the mood, lighting, and style defined above.
  `;

  if (referenceImage) {
    promptText += `\n\nNOTE: I have provided a reference image. Analyze its artistic style (color palette, lighting, texture) and apply that specific style to ALL generated image prompts.`;
  }

  const contents: any[] = [{ text: promptText }];

  // Add reference image if provided (Multimodal)
  if (referenceImage) {
    // Assuming referenceImage is a data URL like "data:image/png;base64,..."
    const base64Data = referenceImage.split(',')[1];
    const mimeType = referenceImage.substring(referenceImage.indexOf(':') + 1, referenceImage.indexOf(';'));
    
    if (base64Data) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Flash is fast and good for multimodal
      contents: contents.length > 1 ? [{ parts: contents }] : contents[0].text,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scene_number: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                },
                required: ["scene_number", "description", "image_prompt"],
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(text);
    return data.scenes || [];

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
