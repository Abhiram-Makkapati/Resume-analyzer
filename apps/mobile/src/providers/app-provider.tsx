import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAuthProvider } from "./auth-provider";

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MobileAuthProvider>{children}</MobileAuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};
