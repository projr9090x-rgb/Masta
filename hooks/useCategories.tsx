import { useContext } from 'react';
import { CategoryContext } from '../contexts/CategoryContext';

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
}
