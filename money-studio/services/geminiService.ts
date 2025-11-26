import { GoogleGenAI, Type } from "@google/genai";
import { Scene, GenerationOptions } from "../types";

// 1) نقروا الـ API key من Vite env
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  // هاد الخطأ غادي يبان غير فـ build / console
  throw new Error(
    "VITE_GOOGLE_API_KEY is missing. Please set it in Vercel → Project Settings → Environment Variables."
  );
}

// 2) نجهّزوا العميل ديال Gemini غير مرّة وحدة
const ai = new GoogleGenAI({ apiKey });

export const analyzeScript = async (
  options: GenerationOptions
): Promise<Scene[]> => {
  const { script, niche, styleKeywords, referenceImage, aspectRatio } = options;

  // 3) نص البرومبت
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
    promptText += `

NOTE: I have provided a reference image. Analyze its artistic style (color palette, lighting, texture) and apply that specific style to ALL generated image prompts.`;
  }

  // 4) parts ديال Gemini (نص + صورة اختيارية)
  const parts: any[] = [{ text: promptText }];

  if (referenceImage) {
    // referenceImage مفروض تكون data URL بحال: "data:image/png;base64,AAAA..."
    const base64Data = referenceImage.split(",")[1];
    const mimeType = referenceImage.substring(
      referenceImage.indexOf(":") + 1,
      referenceImage.indexOf(";")
    );

    if (base64Data) {
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }
  }

  try {
    // 5) نطلبو من Gemini JSON منظم
    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
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
          required: ["scenes"],
        },
      },
    });

    // 6) نحاول نخرج النص سواء كان output_text أو text()
    const text: string | undefined =
      response.output_text ??
      (typeof response.text === "function"
        ? response.text()
        : response.text);

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
