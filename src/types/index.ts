export interface Emotion {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface EmotionResponse {
  emotionId: string;
  location: string;
  coordinates: [number, number];
  intensity: number;
  timestamp: number;
}

export interface SurveyData {
  id: string;
  responses: EmotionResponse[];
  completedAt: number;
}

export interface AggregatedData {
  location: string;
  coordinates: [number, number];
  emotions: Record<string, number>;
  totalResponses: number;
}