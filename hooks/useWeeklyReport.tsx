import { useContext } from 'react';
import { WeeklyReportContext } from '../contexts/WeeklyReportContext';

export function useWeeklyReport() {
  const context = useContext(WeeklyReportContext);
  if (!context) {
    throw new Error('useWeeklyReport must be used within WeeklyReportProvider');
  }
  return context;
}
