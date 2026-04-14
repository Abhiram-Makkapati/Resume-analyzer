import { Platform } from "react-native";
import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import { mobileEnv } from "./env";

let configuredUserId: string | null = null;

export const configureRevenueCat = async (userId: string) => {
  if (configuredUserId === userId) {
    return;
  }

  const apiKey = Platform.select({
    ios: mobileEnv.revenueCatIosKey,
    android: mobileEnv.revenueCatAndroidKey,
    default: ""
  });

  if (!apiKey) {
    return;
  }

  await Purchases.configure({ apiKey, appUserID: userId });
  configuredUserId = userId;
};

export const getRevenueCatOfferings = async () => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
};

export const purchaseRevenueCatPackage = async (selectedPackage: PurchasesPackage): Promise<CustomerInfo> => {
  const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
  return customerInfo;
};
