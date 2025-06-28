import React, { useState } from 'react';
import { Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { emotions } from '../data/emotions';
import { EmotionResponse, SurveyData } from '../types';
import { LocationInput } from './LocationInput';
import { saveSurveyData } from '../utils/storage';

interface SurveyProps {
  onComplete: () => void;
}

export function Survey({ onComplete }: SurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Partial<EmotionResponse>[]>(
    emotions.map(emotion => ({
      emotionId: emotion.id,
      location: '',
      coordinates: undefined,
      intensity: 5,
      timestamp: Date.now()
    }))
  );

  const currentEmotion = emotions[currentStep];
  const currentResponse = responses[currentStep];

  const updateResponse = (field: keyof EmotionResponse, value: any) => {
    const newResponses = [...responses];
    newResponses[currentStep] = {
      ...newResponses[currentStep],
      [field]: value
    };
    setResponses(newResponses);
  };

  const handleLocationChange = (location: string, coordinates?: [number, number]) => {
    updateResponse('location', location);
    if (coordinates) {
      updateResponse('coordinates', coordinates);
    }
  };

  const canProceed = currentResponse?.location && currentResponse?.coordinates;

  const handleNext = () => {
    if (currentStep < emotions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete survey
      const surveyData: SurveyData = {
        id: `survey_${Date.now()}`,
        responses: responses as EmotionResponse[],
        completedAt: Date.now()
      };
      saveSurveyData(surveyData);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Emotion Mapping Survey</h1>
          </div>
          <p className="text-gray-600">
            Help us understand where emotions are felt most strongly around the world
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentStep + 1} of {emotions.length}</span>
            <span>{Math.round(((currentStep + 1) / emotions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / emotions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentEmotion.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Where do you feel <span style={{ color: currentEmotion.color }}>{currentEmotion.name}</span> most strongly?
            </h2>
            <p className="text-gray-600">
              Think of a specific place where this emotion is most intense for you
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <LocationInput
                value={currentResponse?.location || ''}
                onChange={handleLocationChange}
                placeholder="e.g., Central Park New York, My childhood home, Paris France..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity Level: {currentResponse?.intensity || 5}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentResponse?.intensity || 5}
                onChange={(e) => updateResponse('intensity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${currentEmotion.color}22 0%, ${currentEmotion.color} ${((currentResponse?.intensity || 5) - 1) * 11.11}%, #e5e7eb ${((currentResponse?.intensity || 5) - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Intense</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {currentStep === emotions.length - 1 ? (
              <>
                Complete Survey
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}