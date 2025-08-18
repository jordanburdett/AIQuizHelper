import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StudyRecommendation } from '@shared/interfaces/LLMProvider';
import ReactMarkdown from 'react-markdown';

interface StudyRecommendationsProps {
  recommendations: StudyRecommendation[] | null;
  isLoading: boolean;
  error: any;
}

export const StudyRecommendations = ({ recommendations, isLoading, error }: StudyRecommendationsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (recommendations && !isLoading) {
      setHasLoaded(true);
    }
  }, [recommendations, isLoading]);

  const generateSummary = (): string => {
    if (!recommendations || recommendations.length === 0) {
      return "Great performance! No specific areas need immediate attention.";
    }

    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    const mediumPriority = recommendations.filter(r => r.priority === 'medium').length;
    const topics = recommendations.slice(0, 2).map(r => r.topic).join(' and ');
    
    if (highPriority > 0) {
      return `Focus on ${highPriority} high-priority area${highPriority > 1 ? 's' : ''}, especially ${topics}. These topics need immediate attention to improve your understanding.`;
    } else if (mediumPriority > 0) {
      return `Consider reviewing ${mediumPriority} area${mediumPriority > 1 ? 's' : ''}: ${topics}. Some additional practice would strengthen your knowledge.`;
    } else {
      return `Minor improvements suggested in ${topics}. You're doing well overall!`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#64748b';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fefbeb';
      case 'low': return '#f0fdf4';
      default: return '#f1f5f9';
    }
  };

  return (
    <div className="study-recommendations">
      <button
        className="recommendations-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="recommendations-info">
          <h3 className="recommendations-title">AI Study Recommendations</h3>
          <div className="recommendations-status">
            {isLoading ? (
              <span className="loading-indicator">Analyzing your results...</span>
            ) : hasLoaded ? (
              <>
                <CheckCircleIcon className="check-icon" />
                {!isExpanded && (
                  <p className="recommendations-summary">{generateSummary()}</p>
                )}
              </>
            ) : error ? (
              <span className="error-indicator">Failed to load recommendations</span>
            ) : null}
          </div>
        </div>
        <div className="expand-icon">
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </button>

      {isExpanded && (
        <div className="recommendations-details">
          {isLoading ? (
            <div className="loading-content">
              <div className="spinner-small"></div>
              <p>Generating personalized recommendations based on your performance...</p>
            </div>
          ) : error ? (
            <p className="error-message">
              Failed to generate recommendations. Please try refreshing the page.
            </p>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="recommendations-list">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-header">
                    <span 
                      className="priority-dot"
                      style={{ backgroundColor: getPriorityColor(recommendation.priority) }}
                    />
                    <span className="recommendation-topic">{recommendation.topic}</span>
                    <span 
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityBgColor(recommendation.priority),
                        color: getPriorityColor(recommendation.priority)
                      }}
                    >
                      {recommendation.priority}
                    </span>
                  </div>
                  <div className="recommendation-reason markdown-content">
                    <ReactMarkdown>
                      {recommendation.reason}
                    </ReactMarkdown>
                  </div>
                  <ul className="resource-list">
                    {recommendation.resources.map((resource, resourceIndex) => (
                      <li key={resourceIndex} className="resource-item">
                        <span className="resource-dot" />
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-recommendations">
              No specific recommendations needed. Great performance!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
