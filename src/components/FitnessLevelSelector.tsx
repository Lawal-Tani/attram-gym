
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Star } from 'lucide-react';

interface FitnessLevelSelectorProps {
  selectedLevel: 'beginner' | 'intermediate' | 'advanced';
  onLevelSelect: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

const FitnessLevelSelector: React.FC<FitnessLevelSelectorProps> = ({ selectedLevel, onLevelSelect }) => {
  const levels = [
    {
      level: 'beginner' as const,
      title: 'Beginner',
      description: 'New to fitness or getting back into it',
      icon: Target,
      color: 'text-green-600 border-green-300 bg-green-50',
      features: ['Basic movements', 'Longer rest periods', 'Lower intensity']
    },
    {
      level: 'intermediate' as const,
      title: 'Intermediate',
      description: 'Regular exercise routine for 3-6 months',
      icon: Zap,
      color: 'text-yellow-600 border-yellow-300 bg-yellow-50',
      features: ['Complex exercises', 'Moderate intensity', 'Progressive overload']
    },
    {
      level: 'advanced' as const,
      title: 'Advanced',
      description: 'Consistent training for 1+ years',
      icon: Star,
      color: 'text-red-600 border-red-300 bg-red-50',
      features: ['Advanced movements', 'High intensity', 'Specialized techniques']
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Your Fitness Level</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map((levelOption) => {
          const Icon = levelOption.icon;
          const isSelected = selectedLevel === levelOption.level;
          
          return (
            <Card
              key={levelOption.level}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onLevelSelect(levelOption.level)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-semibold text-gray-900">{levelOption.title}</h4>
                  </div>
                  {isSelected && (
                    <Badge className="bg-emerald-500">Selected</Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {levelOption.description}
                </p>
                
                <div className="space-y-1">
                  {levelOption.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FitnessLevelSelector;
