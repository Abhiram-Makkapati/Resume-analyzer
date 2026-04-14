import analytics from "@react-native-firebase/analytics";

export const trackMobileEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null>
) => {
  await analytics().logEvent(
    eventName,
    Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== null))
  );
};
