import { cn } from '@/lib/utils';

interface StreakHeatmapProps {
  data: { date: string; value: number }[]; // value 0-4 for intensity
  className?: string;
}

export function StreakHeatmap({ data, className }: StreakHeatmapProps) {
  // Generate 365 days of sample data for demo
  const generateSampleData = () => {
    const result = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const intensity = Math.floor(Math.random() * 5); // 0-4
      result.push({
        date: date.toISOString().split('T')[0],
        value: intensity
      });
    }
    return result;
  };

  const heatmapData = data.length > 0 ? data : generateSampleData();
  
  const getIntensityClass = (value: number) => {
    if (value === 0) return 'bg-muted/20';
    if (value === 1) return 'bg-primary/20';
    if (value === 2) return 'bg-primary/40';
    if (value === 3) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  // Group by weeks for proper grid layout (like GitHub)
  const weeks = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364); // Start 364 days ago
  
  // Create 53 weeks of 7 days each
  for (let week = 0; week < 53; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const dateIndex = week * 7 + day;
      if (dateIndex < heatmapData.length) {
        weekData.push(heatmapData[dateIndex]);
      } else {
        // Fill empty days
        weekData.push({ date: '', value: 0 });
      }
    }
    weeks.push(weekData);
  }

  return (
    <div className={cn("p-4", className)}>
      {/* GitHub-style grid: weeks as columns, days as rows */}
      <div className="flex gap-0.5 overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "w-2.5 h-2.5 rounded-sm transition-colors duration-200 hover:ring-1 hover:ring-primary/50",
                  getIntensityClass(day.value)
                )}
                title={day.date ? `${day.date}: ${day.value > 0 ? 'Active' : 'No activity'}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}