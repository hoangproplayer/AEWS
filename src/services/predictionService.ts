import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PredictionResult {
  riskLevel: 'SAFE' | 'WARNING' | 'DANGER';
  confidence: number;
  reasoning: string;
  recommendedActions: string[];
}

export async function predictStudentRisk(studentData: any, academicHistory: any[]): Promise<PredictionResult> {
  try {
    const prompt = `Phân tích dữ liệu học tập và hoạt động của sinh viên để dự báo nguy cơ bỏ học hoặc cảnh báo học vụ.
    Dữ liệu sinh viên: ${JSON.stringify(studentData)}
    Lịch sử học tập: ${JSON.stringify(academicHistory)}
    
    Hãy cung cấp nhận định bằng TIẾNG VIỆT bao gồm:
    1. Mức độ rủi ro (SAFE, WARNING, DANGER).
    2. Độ tin cậy (0-1).
    3. Lý do chi tiết (reasoning): Phải giải thích rõ logic dựa trên GPA, số tín chỉ nợ, và tỉ lệ chuyên cần/hoạt động LMS.
    4. Danh sách các hành động đề xuất cụ thể cho giảng viên cố vấn.
    
    Lưu ý: Ngôn ngữ bắt buộc là Tiếng Việt.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['SAFE', 'WARNING', 'DANGER'] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            recommendedActions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['riskLevel', 'confidence', 'reasoning', 'recommendedActions']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as PredictionResult;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return {
      riskLevel: 'SAFE',
      confidence: 0,
      reasoning: "Hệ thống AI hiện không khả dụng. Đang sử dụng các quy tắc mặc định.",
      recommendedActions: ["Theo dõi thêm", "Kiểm tra lại hồ sơ sinh viên"]
    };
  }
}
