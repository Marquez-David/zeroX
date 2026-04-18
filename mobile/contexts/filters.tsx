import {
  createContext,
  use,
  useState,
  type PropsWithChildren,
} from 'react';

interface FiltersValue {
  reportsYear: number | null;
  setReportsYear: (value: number | null) => void;
  categoriesYear: number | null;
  setCategoriesYear: (value: number | null) => void;
}

const FiltersContext = createContext<FiltersValue>({
  reportsYear: null,
  setReportsYear: () => {},
  categoriesYear: null,
  setCategoriesYear: () => {},
});

/**
 * Lives at the (app) layout level so filter selections survive when a screen
 * is popped off the Stack and pushed again later.
 */
export function FiltersProvider({ children }: PropsWithChildren) {
  const [reportsYear, setReportsYear] = useState<number | null>(null);
  const [categoriesYear, setCategoriesYear] = useState<number | null>(null);

  return (
    <FiltersContext
      value={{
        reportsYear,
        setReportsYear,
        categoriesYear,
        setCategoriesYear,
      }}
    >
      {children}
    </FiltersContext>
  );
}

export function useFilters() {
  return use(FiltersContext);
}
