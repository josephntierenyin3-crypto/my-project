import React, { createContext, useState } from "react";
import "./BookingContext.css"; // CSS import

// 1. Create context
export const BookingContext = createContext();

// 2. Context provider
export const BookingProvider = ({ children }) => {
  // State
  const [submissions, setSubmissions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [petrolLogs, setPetrolLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);

  // Booking functions
  const addSubmission = (submission) => {
    setSubmissions([...submissions, submission]);
  };

  const approveSubmission = (id) => {
    setSubmissions(
      submissions.map((s) =>
        s.id === id ? { ...s, status: "Approved" } : s
      )
    );
  };

  // Transaction functions
  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  // Petrol log functions
  const addPetrolLog = (log) => {
    setPetrolLogs([...petrolLogs, log]);
  };

  // Maintenance log functions
  const addMaintenanceLog = (log) => {
    setMaintenanceLogs([...maintenanceLogs, log]);
  };

  // 3. Provide context
  return (
    <BookingContext.Provider
      value={{
        submissions,
        addSubmission,
        approveSubmission,
        transactions,
        addTransaction,
        petrolLogs,
        addPetrolLog,
        maintenanceLogs,
        addMaintenanceLog,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
