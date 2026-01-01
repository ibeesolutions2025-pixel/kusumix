
export enum ProjectFileType {
  VOCAL = 'VOCAL',
  BEAT = 'BEAT',
  VIDEO = 'VIDEO'
}

export interface ProjectFile {
  id: string;
  name: string;
  type: ProjectFileType;
  file: File;
  previewUrl: string;
  base64?: string;
}

export interface AnalysisResult {
  part1: string; // Tóm tắt phân tích
  part2: string; // Chi tiết kỹ thuật (EQ, Comp, Gain...)
  part3: string; // Đề xuất phiên bản
  part4: string; // Gợi ý cải thiện
  bpm?: number;
  key?: string;
  gainAdjustment: string; // Hướng dẫn tăng âm lượng cụ thể
  sidechainLevel: string; // Mức độ dìm nhạc nền khi rap
}
