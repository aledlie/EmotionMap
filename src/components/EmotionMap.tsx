import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { BarChart3, Users, Globe, RotateCcw } from 'lucide-react';
import { emotions } from '../data/emotions';
import { getAggregatedData, getSurveyData, clearAllData } from '../utils/storage';
import { AggregatedData, SurveyData } from '../types';

interface EmotionMapProps {
  onBackToSurvey: () => void;
}

function createEmotionIcon(emotion: string, intensity: number, isAggregate = false) {
  const emotionData = emotions.find(e => e.id === emotion);
  const size = isAggregate ? Math.max(20, Math.min(50, intensity * 2)) : 30;
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${emotionData?.color || '#666'};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.4}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${emotionData?.icon || '?'}
      </div>
    `,
    className: 'custom-emotion-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

export function EmotionMap({ onBackToSurvey }: EmotionMapProps) {
  const [viewMode, setViewMode] = useState<'aggregate' | 'individual'>('aggregate');
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [individualData, setIndividualData] = useState<SurveyData[]>([]);

  useEffect(() => {
    setAggregatedData(getAggregatedData());
    setIndividualData(getSurveyData());
  }, []);

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all survey data?')) {
      clearAllData();
      setAggregatedData([]);
      setIndividualData([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">Emotion Map</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{individualData.length} responses</span>
                <Globe className="w-4 h-4 ml-4" />
                <span>{aggregatedData.length} locations</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('aggregate')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'aggregate'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-1 inline" />
                  Aggregate
                </button>
                <button
                  onClick={() => setViewMode('individual')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'individual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1 inline" />
                  Individual
                </button>
              </div>
              
              <button
                onClick={handleClearData}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Clear all data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={onBackToSurvey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Survey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-80px)]">
        <MapContainer
          center={[40.7128, -74.0060]} // NYC default
          zoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Aggregate View */}
          {viewMode === 'aggregate' && aggregatedData.map((location, index) => {
            const topEmotion = Object.entries(location.emotions).reduce(
              (max, [emotion, count]) => count > max.count ? { emotion, count } : max,
              { emotion: '', count: 0 }
            );

            return (
              <Marker
                key={`agg-${index}`}
                position={location.coordinates}
                icon={createEmotionIcon(topEmotion.emotion, topEmotion.count, true)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800 mb-2">{location.location}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {location.totalResponses} total responses
                    </p>
                    <div className="space-y-1">
                      {Object.entries(location.emotions)
                        .sort(([,a], [,b]) => b - a)
                        .map(([emotionId, count]) => {
                          const emotion = emotions.find(e => e.id === emotionId);
                          return (
                            <div key={emotionId} className="flex items-center justify-between">
                              <span className="text-sm flex items-center">
                                <span className="mr-1">{emotion?.icon}</span>
                                {emotion?.name}
                              </span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Individual View */}
          {viewMode === 'individual' && individualData.flatMap(survey =>
            survey.responses.map((response, index) => (
              <Marker
                key={`ind-${survey.id}-${index}`}
                position={response.coordinates}
                icon={createEmotionIcon(response.emotionId, response.intensity)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800 mb-2">{response.location}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {emotions.find(e => e.id === response.emotionId)?.icon}
                      </span>
                      <span className="font-medium">
                        {emotions.find(e => e.id === response.emotionId)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Intensity: {response.intensity}/10
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(response.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-3">Emotions Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {emotions.map(emotion => (
            <div key={emotion.id} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: emotion.color }}
              />
              <span className="text-xs">{emotion.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {viewMode === 'aggregate' 
            ? 'Marker size reflects response volume'
            : 'Individual emotion responses'
          }
        </p>
      </div>
    </div>
  );
}