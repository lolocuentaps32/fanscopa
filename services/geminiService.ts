
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Registration } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiChatResponse = async (
  prompt: string, 
  history: {role: string, parts: {text: string}[]}[],
  registrations?: Registration[]
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const context = registrations ? `
    Actúa como un experto en soporte de FANS. 
    Datos actuales del sistema: ${JSON.stringify(registrations.slice(0, 10))}...
    Usa un tono amable y profesional.
  ` : 'Eres un asistente inteligente para FANS.';

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: context,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: 'audio/mp3' } },
        { text: 'Transcribe este audio exactamente como se escucha.' }
      ]
    }
  });
  return response.text;
};

export const generateSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const analyzeRegistrations = async (data: Registration[]) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza estadísticamente estas solicitudes de entradas y abonos: ${JSON.stringify(data)}. 
    Dame un resumen de:
    1. Porcentaje de abonados vs no abonados.
    2. Localidades principales.
    3. Recomendaciones para mejorar la gestión.
    4. Identifica posibles duplicados por DNI.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              abonadosPerc: { type: Type.NUMBER },
              topLocations: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          duplicates: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['summary', 'metrics']
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
