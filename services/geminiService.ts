
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedContent, ContentType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    title: { 
      type: Type.STRING, 
      description: 'A creative and engaging title for the content. Should be catchy and relevant.' 
    },
    script: { 
      type: Type.STRING, 
      description: 'The full blog post or podcast script, formatted with paragraphs and clear sections. Use markdown for headings (e.g., ## Section Title).' 
    },
    imageSuggestions: {
      type: Type.ARRAY,
      description: 'An array of exactly 3 descriptive prompts for generating royalty-free images that are highly relevant to the content.',
      items: { type: Type.STRING }
    },
    socialMediaPosts: {
      type: Type.ARRAY,
      description: 'An array of 2-3 short, impactful social media posts to promote the content on different platforms.',
      items: {
        type: Type.OBJECT,
        required: ['platform', 'post'],
        properties: {
          platform: { type: Type.STRING, description: 'The social media platform (e.g., Twitter, LinkedIn, Facebook).' },
          post: { type: Type.STRING, description: 'The content of the social media post, including relevant hashtags.' }
        }
      }
    }
  },
  required: ['title', 'script', 'imageSuggestions', 'socialMediaPosts']
};


export async function generateContentBundle(topic: string, contentType: ContentType): Promise<GeneratedContent> {
  try {
    const prompt = `You are an expert content creator AI. Your task is to generate a complete content package based on a user's topic.
    
    Topic: "${topic}"
    Content Type: "${contentType}"
    
    Please generate the following:
    1.  A compelling title.
    2.  A well-structured ${contentType} script/article. For a podcast, include cues like [INTRO MUSIC] or [HOST]. For a blog, use markdown for structure.
    3.  Three descriptive prompts for generating relevant, high-quality images.
    4.  Two or three engaging social media posts to promote the content on platforms like Twitter and LinkedIn.

    Your output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text or formatting outside of the JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object fits the expected structure
    if (
        !parsedJson.title ||
        !parsedJson.script ||
        !Array.isArray(parsedJson.imageSuggestions) ||
        !Array.isArray(parsedJson.socialMediaPosts)
    ) {
        throw new Error("AI response is missing required fields.");
    }

    return parsedJson as GeneratedContent;

  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate content from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating content.");
  }
}
