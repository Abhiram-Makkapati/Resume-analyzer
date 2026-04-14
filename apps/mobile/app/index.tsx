import { Redirect } from "expo-router";
import { useMobileAuth } from "../src/providers/auth-provider";

export default function Index() {
  const { user, isLoading } = useMobileAuth();

  if (isLoading) {
    return null;
  }

  return <Redirect href={user ? "/(tabs)" : "/auth"} />;
}
