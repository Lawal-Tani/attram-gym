
import React from 'react';

const WorkoutTips: React.FC = () => {
  return (
    <div className="mt-8 p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">📋 Workout Tips</h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Before You Start:</h4>
          <ul className="space-y-1">
            <li>• Always warm up for 5-10 minutes</li>
            <li>• Stay hydrated throughout your workout</li>
            <li>• Use proper form over heavy weights</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 mb-2">After Your Workout:</h4>
          <ul className="space-y-1">
            <li>• Cool down with light stretching</li>
            <li>• Track your progress</li>
            <li>• Get adequate rest for recovery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTips;
