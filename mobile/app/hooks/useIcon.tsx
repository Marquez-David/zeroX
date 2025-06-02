import { useState, useEffect } from 'react';

interface UseIconReturn {
  icon: string;
  setIcon: React.Dispatch<React.SetStateAction<string>>;
}

export const useIcon = (
  condition: boolean,
  icon1: string,
  icon2: string
): UseIconReturn => {
  const [icon, setIcon] = useState<string>(condition ? icon1 : icon2);

  useEffect(() => {
    setIcon(condition ? icon1 : icon2);
  }, [condition, icon1, icon2]);

  return { icon, setIcon };
};
