import { createContext, useContext, useState, ReactNode } from "react";

interface ClinicContextType {
  selectedClinic: string | null;
  setSelectedClinic: (clinic: string) => void;
}

const AgentIAContext = createContext<ClinicContextType | undefined>(undefined);

export function AgentIAProvider({ children }: { children: ReactNode }) {
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);

  return (
    <AgentIAContext.Provider value={{ selectedClinic, setSelectedClinic }}>
      {children}
    </AgentIAContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(AgentIAContext);
  if (!context) {
    throw new Error("useClinic deve ser usado dentro de um ClinicProvider");
  }
  
return context;
}