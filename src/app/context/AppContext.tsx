"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchSummary, getRecurring, getIncomes } from "../actions";
import { getOrCreateDemoUser } from "@/lib/supabase";

interface AppContextType {
  userId: string | null;
  summary: any;
  incomes: any[];
  recurringData: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [recurringData, setRecurringData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // On client side, get the real user ID
        if (typeof window !== "undefined") {
          const id = getOrCreateDemoUser();
          setUserId(id);
          
          // Fetch data with the real user ID
          if (id && id !== "demo-user-placeholder") {
            await refreshData(id);
          }
        } else {
          // On server side, use placeholder
          setUserId("demo-user-placeholder");
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const refreshData = async (id?: string) => {
    const targetId = id || userId;
    if (!targetId || targetId === "demo-user-placeholder") return;

    try {
      setLoading(true);
      const [summaryData, recurringData, incomesData] = await Promise.all([
        fetchSummary(targetId),
        getRecurring(targetId),
        getIncomes(targetId)
      ]);

      setSummary(summaryData);
      setRecurringData(recurringData);
      setIncomes(incomesData);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      userId,
      summary,
      incomes,
      recurringData,
      loading,
      refreshData,
      setLoading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
