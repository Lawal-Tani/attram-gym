
import React from 'react';
import { Button } from '@/components/ui/button';
import NavigationBar from '@/components/NavigationBar';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading workout plans: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
