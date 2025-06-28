import React, { useState, useEffect } from 'react';
import { Survey } from './components/Survey';
import { EmotionMap } from './components/EmotionMap';
import { getSurveyData } from './utils/storage';

function App() {
  const [currentView, setCurrentView] = useState<'survey' | 'map'>('survey');
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const data = getSurveyData();
    setHasData(data.length > 0);
    if (data.length > 0) {
      setCurrentView('map');
    }
  }, []);

  const handleSurveyComplete = () => {
    setHasData(true);
    setCurrentView('map');
  };

  const handleBackToSurvey = () => {
    setCurrentView('survey');
  };

  return (
    <div className="App">
      {currentView === 'survey' ? (
        <Survey onComplete={handleSurveyComplete} />
      ) : (
        <EmotionMap onBackToSurvey={handleBackToSurvey} />
      )}
    </div>
  );
}

export default App;