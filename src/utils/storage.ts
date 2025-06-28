import { SurveyData, AggregatedData } from '../types';

const STORAGE_KEY = 'emotion-survey-data';

export function saveSurveyData(data: SurveyData): void {
  const existingData = getSurveyData();
  const updatedData = [...existingData, data];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
}

export function getSurveyData(): SurveyData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAggregatedData(): AggregatedData[] {
  const allData = getSurveyData();
  const locationMap = new Map<string, AggregatedData>();

  allData.forEach(survey => {
    survey.responses.forEach(response => {
      const key = `${response.coordinates[0]},${response.coordinates[1]}`;
      
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          location: response.location,
          coordinates: response.coordinates,
          emotions: {},
          totalResponses: 0
        });
      }

      const locationData = locationMap.get(key)!;
      locationData.emotions[response.emotionId] = 
        (locationData.emotions[response.emotionId] || 0) + response.intensity;
      locationData.totalResponses++;
    });
  });

  return Array.from(locationMap.values());
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}