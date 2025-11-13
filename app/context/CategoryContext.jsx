import { createContext, useContext } from "react";

// Tạo context
const CategoryContext = createContext({
  customCategories: [],
});

// Hook để truy cập nhanh
export function useCategories() {
  return useContext(CategoryContext);
}

// Provider component
export function CategoryProvider({ children, customCategories }) {
  return (
    <CategoryContext.Provider value={{ customCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}
