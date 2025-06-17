
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, Smartphone } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            Attram Gym Assistant
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Your personal fitness companion. Track workouts, monitor progress, and achieve your fitness goals with our intelligent gym assistant.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-8">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Why Choose Attram Gym Assistant?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built for modern fitness enthusiasts, our app combines simplicity with powerful features to help you stay on track.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Target className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <CardTitle className="text-lg">Goal-Based Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalized workout plans tailored to your specific fitness goals - muscle gain or weight loss.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your workout completion rates, streaks, and overall progress with detailed analytics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle className="text-lg">Member Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete member management system for gym administrators with renewal tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-lg">Mobile Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Install as a PWA on your phone for quick access. Works perfectly on all devices.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of gym members who are already using Attram Gym Assistant to achieve their fitness goals.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 px-8">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Attram Gym Assistant. Built with 💪 for fitness enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
