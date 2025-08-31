"use client";
import React, { useContext } from 'react';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
};

const AppContext = React.createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export { AppContext }
export type { AppContextType }
