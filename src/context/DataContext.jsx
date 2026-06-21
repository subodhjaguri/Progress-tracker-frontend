/* eslint-disable react-refresh/only-export-components -- context hook co-located with its provider */
import React, { createContext, useContext, useState } from "react";

// App-wide UI state: the active modal ({ type, ...payload }) and the toast message.
// (All domain data now comes from the API via React Query hooks in src/api/.)
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const value = { modal, setModal, toast, announce };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
