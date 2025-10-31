import React, { createContext, ReactNode } from "react";
import useWhatsApps from "src/hooks/useWhatsApps";

const WhatsAppsContext = createContext<any>(null);

interface WhatsAppsProviderProps {
	children: ReactNode
}

const WhatsAppsProvider = ({ children }: WhatsAppsProviderProps) => {
	const { loading, whatsApps } = useWhatsApps();

	return (
		<WhatsAppsContext.Provider value={{ whatsApps, loading }}>
			{children}
		</WhatsAppsContext.Provider>
	);
};

export { WhatsAppsContext, WhatsAppsProvider };
