'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Complaint } from '@/lib/definitions';
import { DUMMY_COMPLAINTS } from '@/lib/data';

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(DUMMY_COMPLAINTS);

  const addComplaint = (complaint: Complaint) => {
    setComplaints(prevComplaints => [...prevComplaints, complaint]);
  };

  return (
    <ComplaintsContext.Provider value={{ complaints, addComplaint }}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
}
