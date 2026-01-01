
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là một kỹ sư âm thanh chuyên về Mastering nhạc Rap. 
Nhiệm vụ đặc biệt của bạn hôm nay là:
1. Giải quyết lỗi âm lượng nhỏ: Tính toán mức Gain bù đắp (thường từ +6dB đến +12dB) để đạt chuẩn -14 LUFS.
2. Mix nhạc Trap: Đề xuất cách trộn một bản nhạc Trap xập xình vào video rap của người dùng mà không làm đè tiếng vocal.
3. Sidechain Compression: Hướng dẫn cụ thể cách dìm nhạc nền xuống khi rapper bắt đầu nói để tiếng rap luôn nổi bật.

Bạn phải trả về JSON:
{
  "part1": "Phân tích âm lượng hiện tại (đang bị nhỏ bao nhiêu) và mood tổng thể.",
  "part2": "Thông số Mastering: Gain boost (+dB), Threshold của Limiter, và dải tần cần tăng để tiếng rap sắc nét.",
  "part3": "Mô tả sự kết hợp với nhạc Trap (ví dụ: Hard Trap 140BPM, Bass 808 xập xình).",
  "part4": "Lời khuyên về cách xuất file để không bị mất chất lượng và giữ âm lượng to.",
  "bpm": 140,
  "key": "Am",
  "gainAdjustment": "+8.5 dB",
  "sidechainLevel": "-4.0 dB"
}
`;

export const analyzeRapVideo = async (file: File, selectedBeat: string): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `Hãy phân tích file rap này. Người dùng muốn thêm nhạc nền phong cách: ${selectedBeat}. Đặc biệt hãy chú ý khắc phục lỗi video gốc đang bị nhỏ tiếng, cần tăng âm lượng lên mức chuyên nghiệp.` },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            part1: { type: Type.STRING },
            part2: { type: Type.STRING },
            part3: { type: Type.STRING },
            part4: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            key: { type: Type.STRING },
            gainAdjustment: { type: Type.STRING },
            sidechainLevel: { type: Type.STRING }
          },
          required: ["part1", "part2", "part3", "part4", "gainAdjustment", "sidechainLevel"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi từ AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Video Analysis Error:", error);
    throw new Error("Lỗi khi xử lý file. Vui lòng thử lại với file nhỏ hơn.");
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};
