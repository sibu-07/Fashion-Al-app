
import React from 'react';
import { Recommendation } from '../types';
import Loader from './Loader';

interface RecommendationCardProps {
  recommendation: Recommendation;
  isLoading: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, isLoading }) => {
  const { name, description, tags, imageUrl } = recommendation;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">
        <div className="md:col-span-4 h-64 md:h-auto">
          {isLoading || !imageUrl ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Loader className="w-8 h-8 text-indigo-500" />
                <p className="text-sm text-gray-500 mt-2">Generating Image...</p>
              </div>
            </div>
          ) : (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="md:col-span-8 p-6">
          <h4 style={{fontFamily: "'Playfair Display', serif"}} className="text-2xl font-bold text-gray-900">{name}</h4>
          <p className="mt-2 text-gray-600">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
