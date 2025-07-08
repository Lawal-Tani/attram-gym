import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';

interface StreakCalendarProps {
  completedDates: string[];
  currentStreak: number;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ completedDates, currentStreak }) => {
  // Get current date and calculate the start of the month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();
  
  // Convert completed dates to a Set for quick lookup
  const completedSet = new Set(
    completedDates.map(date => new Date(date).toDateString())
  );
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toDateString();
    const isCompleted = completedSet.has(dateString);
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    
    calendarDays.push({
      day,
      date,
      isCompleted,
      isToday,
      isPast
    });
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <Card className="group relative overflow-hidden card-hover border-0 shadow-2xl" style={{background: 'var(--gradient-ocean)', boxShadow: 'var(--shadow-electric)'}}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
        <CardTitle className="text-lg font-medium text-white font-poppins flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Workout Calendar
        </CardTitle>
        <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm">
          <Flame className="h-6 w-6 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="mb-4">
          <div className="text-2xl font-semibold text-white mb-1 font-poppins">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold text-white font-poppins">{currentStreak}</div>
            <div className="text-sm text-white/80">day streak</div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-white/70 p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={index} className="w-8 h-8"></div>;
            }
            
            const { day, isCompleted, isToday, isPast } = dayData;
            
            return (
              <div
                key={index}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-lg transform scale-110' 
                    : isPast 
                      ? 'bg-white/10 text-white/50' 
                      : 'bg-white/20 text-white/80'
                  }
                  ${isToday ? 'ring-2 ring-white ring-opacity-50' : ''}
                  hover:scale-105
                `}
              >
                {day}
                {isCompleted && (
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-white/10"></div>
            <span>Missed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;