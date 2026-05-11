import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Button,
  Card,
  CardContent,
  Input,
} from "@/components/ui";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, Sparkles, Check, DollarSign } from "lucide-react-native";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Linking from "expo-linking";
import { Alert } from "react-native";

/** Base variant used when a custom dollar amount is sent (Lemon `checkout[custom_price]`). */
const CUSTOM_DONATION_VARIANT_ID = "variant_month_id";

type DonationTier = {
  id: string;
  amount: number;
  label: string;
  variantId: string;
  /** If set, preset checkout includes custom price (e.g. $15 on a $5 PWYW variant). */
  customAmountCents?: number;
  popular?: boolean;
};

export default function DonatePage() {
  const router = useRouter();
  const createCheckout = useAction(api.lemonSqueezy.createCheckout);
  const [loading, setLoading] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const donationTiers: DonationTier[] = [
    { id: "5", amount: 5, label: "$5 thank you 💜", variantId: "variant_month_id" },
    {
      id: "10",
      amount: 10,
      label: "$10 power boost 🚀",
      variantId: "variant_power_id",
      popular: true,
    },
    {
      id: "15",
      amount: 15,
      label: "$15 super thanks ⭐",
      variantId: CUSTOM_DONATION_VARIANT_ID,
      customAmountCents: 1500,
    },
    { id: "25", amount: 25, label: "$25 hero supporter 🌟", variantId: "variant_super_id" },
  ];

  const handlePreset = async (tier: DonationTier) => {
    setLoading(tier.id);
    try {
      const url = await createCheckout({
        variantId: tier.variantId,
        planId: "donation",
        ...(tier.customAmountCents != null
          ? { customAmountCents: tier.customAmountCents }
          : {}),
      });
      if (url) Linking.openURL(url);
    } catch (error) {
      console.error(error);
      Alert.alert("Checkout failed", "Could not start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCustomDonate = async () => {
    const parsed = parseFloat(customAmount.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(parsed) || parsed < 1) {
      Alert.alert("Minimum $1", "Enter a valid amount of at least $1.00.");
      return;
    }
    const cents = Math.round(parsed * 100);
    if (cents < 100) {
      Alert.alert("Minimum $1", "Please enter an amount of at least $1.00.");
      return;
    }
    setLoading("custom");
    try {
      const url = await createCheckout({
        variantId: CUSTOM_DONATION_VARIANT_ID,
        planId: "donation",
        customAmountCents: cents,
      });
      if (url) Linking.openURL(url);
    } catch (error) {
      console.error(error);
      Alert.alert("Checkout failed", "Could not start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <Text variant="h3">Support SmartSaver</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        <View className="items-center mb-10">
          <View className="bg-[#10B981]/10 p-4 rounded-full mb-6">
            <Heart size={40} className="text-[#10B981] fill-[#10B981]" />
          </View>
          <Text variant="h1" className="text-center mb-4 text-3xl">
            Help Us Keep SmartSaver Free
          </Text>
          <Text className="text-muted-foreground text-center text-lg leading-relaxed max-w-md">
            SmartSaver is built by a small team passionate about helping people save
            money. Your donations help us:
          </Text>

          <View className="gap-3 mt-6 w-full max-w-sm">
            {[
              "Keep the servers running 24/7",
              "Add new stores and features weekly",
              "Maintain the AI deal hunting engine",
              "Provide support to our 10k+ users",
            ].map((text, i) => (
              <View
                key={i}
                className="flex-row items-center gap-3 bg-muted/30 p-3 rounded-xl"
              >
                <View className="bg-[#10B981] rounded-full p-1">
                  <Check size={12} className="text-white" />
                </View>
                <Text className="font-medium text-sm">{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text variant="h3" className="mb-4">
          Choose an amount
        </Text>
        <View className="gap-4">
          {donationTiers.map((tier) => (
            <Card
              key={tier.id}
              className={
                tier.popular ? "border-[#4F46E5] bg-[#4F46E5]/5" : "border-border"
              }
            >
              <CardContent className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="bg-muted p-2 rounded-lg">
                    <DollarSign size={20} className="text-foreground" />
                  </View>
                  <View>
                    <Text className="font-bold text-lg">${tier.amount}</Text>
                    <Text variant="small" className="text-muted-foreground">
                      {tier.label}
                    </Text>
                  </View>
                </View>
                <Button
                  onPress={() => handlePreset(tier)}
                  disabled={!!loading}
                  className={tier.popular ? "bg-[#4F46E5]" : "bg-[#4F46E5]/90"}
                  size="sm"
                >
                  <Text className="text-white font-bold">
                    {loading === tier.id ? "…" : "Donate"}
                  </Text>
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>

        <View className="mt-8 gap-3">
          <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
            Custom amount
          </Text>
          <Card className="border-border">
            <CardContent className="p-4 gap-3">
              <Text variant="small" className="text-muted-foreground">
                Enter any amount (minimum $1.00). When you donate here, this amount is
                used instead of a preset.
              </Text>
              <View className="flex-row items-center gap-2 border border-border rounded-xl px-3 bg-muted/20">
                <Text className="font-bold text-foreground">$</Text>
                <Input
                  className="flex-1 border-0 bg-transparent h-11"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                />
              </View>
              <Button
                onPress={handleCustomDonate}
                disabled={!!loading}
                variant="outline"
                className="border-[#4F46E5]"
              >
                <Text className="text-[#4F46E5] font-bold">
                  {loading === "custom" ? "…" : "Donate custom amount"}
                </Text>
              </Button>
            </CardContent>
          </Card>
        </View>

        <View className="mt-10 p-6 bg-[#4F46E5]/5 rounded-3xl border border-[#4F46E5]/10 items-center">
          <Sparkles size={24} className="text-[#4F46E5] mb-2" />
          <Text className="font-bold text-center mb-1">Every dollar helps!</Text>
          <Text className="text-muted-foreground text-center text-sm">
            We are committed to keeping SmartSaver 100% free and open to everyone.
            Thank you for your support.
          </Text>
        </View>

        <View className="mt-8 items-center">
          <Text variant="small" className="text-muted-foreground">
            Other ways to support:
          </Text>
          <View className="flex-row gap-4 mt-2">
            <Button variant="link" size="sm">
              <Text>PayPal</Text>
            </Button>
            <Button variant="link" size="sm">
              <Text>Venmo</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
