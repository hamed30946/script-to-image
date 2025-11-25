export interface Scene {
  scene_number: number;
  description: string;
  image_prompt: string;
}

export interface ScriptAnalysisResponse {
  scenes: Scene[];
}

export interface GenerationOptions {
  script: string;
  niche?: string;
  styleKeywords?: string;
  referenceImage?: string; // Base64 string
  aspectRatio?: string;
}
