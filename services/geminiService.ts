
import { GoogleGenAI, Type } from "@google/genai";
import { Gender, GeminiResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        userInputAnalysis: {
            type: Type.OBJECT,
            properties: {
                category: { 
                    type: Type.STRING,
                    description: "The primary category of the clothing item (e.g., 'T-Shirt', 'Jeans', 'Summer Dress')."
                },
                attributes: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "An array of key visual attributes like color, pattern, style, and material (e.g., 'Blue', 'Striped', 'V-Neck', 'Cotton')."
                },
            },
            required: ['category', 'attributes']
        },
        recommendations: {
            type: Type.ARRAY,
            description: "An array of exactly 3 outfit recommendations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { 
                        type: Type.STRING,
                        description: "A creative and appealing name for the outfit (e.g., 'Urban Explorer', 'Sunset Casual')."
                    },
                    description: { 
                        type: Type.STRING,
                        description: "A detailed description of the complete outfit, listing each item of clothing and accessory. This will be used to generate an image."
                    },
                    tags: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "A list of descriptive tags for the outfit style (e.g., 'Minimalist', 'Bohemian', 'Streetwear')."
                    },
                },
                 required: ['name', 'description', 'tags']
            }
        }
    },
    required: ['userInputAnalysis', 'recommendations']
};


export async function analyzeImageAndGetRecommendations(base64Image: string, gender: Gender, occasion: string): Promise<GeminiResponse> {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert fashion stylist with a deep understanding of clothing categories, attributes, and outfit coordination. Your analysis is powered by a simulated advanced Convolutional Neural Network (CNN) for precise feature extraction from images.
    Analyze the provided clothing item image. First, identify its primary category and key attributes.
    Then, based on the user's preference for a '${gender}' style and a '${occasion}' occasion, generate three distinct, complete, and stylish outfit recommendations that incorporate or complement the user's item.
    Return your response as a single, valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: `Analyze this clothing item and recommend 3 outfits for a ${gender} individual for a ${occasion} occasion.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GeminiResponse;

    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Failed to get recommendations from AI. The model may be unable to process the request.");
    }
}

export async function generateOutfitImage(description: string, gender: Gender): Promise<string> {
    const model = 'imagen-3.0-generate-002';

    const prompt = `A full-body, photorealistic fashion editorial photo of a ${gender} model. The model is wearing this specific outfit: "${description}".
    The photo should be high-quality, with a clean, minimalist studio background and soft, natural lighting. The focus is entirely on the clothes. No text, logos, or distracting elements.`;

    try {
        const response = await ai.models.generateImages({
            model: model,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '3:4', // Portrait orientation is good for fashion
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation failed, no images returned.");
        }
    } catch (error) {
        console.error("Error generating outfit image:", error);
        // Return a placeholder or throw an error
        return "https://picsum.photos/600/800?grayscale"; // Placeholder
    }
}
