import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Button, Card, CardContent, CardHeader, CardTitle, Badge, Pressable, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import { ArrowLeft, Coffee, Heart, Rocket, Star, Sparkles, Check, DollarSign } from "lucide-react-native";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Linking from "expo-linking";

export default function DonatePage() {
  const router = useRouter();
  const createCheckout = useAction(api.lemonSqueezy.createCheckout);
  const [loading, setLoading] = useState<string | null>(null);

  const donationTiers = [
    { id: "coffee", amount: 3, label: "Buy us a coffee ☕", variantId: "variant_coffee_id" },
    { id: "month", amount: 5, label: "Support for a month 💚", variantId: "variant_month_id", popular: true },
    { id: "power", amount: 10, label: "Power user thank you! 🚀", variantId: "variant_power_id" },
    { id: "super", amount: 25, label: "Super supporter! ⭐", variantId: "variant_super_id" },
  ];

  const handleDonate = async (tier: any) => {
    setLoading(tier.id);
    try {
      // Use the existing createCheckout logic, but for one-time donations
      const url = await createCheckout({ 
        variantId: tier.variantId, 
        planId: "donation" 
      });
      if (url) {
        Linking.openURL(url);
      }
    } catch (error) {
      console.error(error);
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
          <Text variant="h1" className="text-center mb-4 text-3xl">Help Us Keep SmartSaver Free</Text>
          <Text className="text-muted-foreground text-center text-lg leading-relaxed max-w-md">
            SmartSaver is built by a small team passionate about helping people save money. Your donations help us:
          </Text>
          
          <View className="gap-3 mt-6 w-full max-w-sm">
            {[
              "Keep the servers running 24/7",
              "Add new stores and features weekly",
              "Maintain the AI deal hunting engine",
              "Provide support to our 10k+ users"
            ].map((text, i) => (
              <View key={i} className="flex-row items-center gap-3 bg-muted/30 p-3 rounded-xl">
                <View className="bg-[#10B981] rounded-full p-1">
                  <Check size={12} className="text-white" />
                </View>
                <Text className="font-medium text-sm">{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text variant="h3" className="mb-6">Choose an amount</Text>
        <View className="gap-4">
          {donationTiers.map((tier) => (
            <Card key={tier.id} className={tier.popular ? "border-[#10B981] bg-[#10B981]/5" : ""}>
              <CardContent className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="bg-muted p-2 rounded-lg">
                    <DollarSign size={20} className="text-foreground" />
                  </View>
                  <View>
                    <Text className="font-bold text-lg">${tier.amount}</Text>
                    <Text variant="small" className="text-muted-foreground">{tier.label}</Text>
                  </View>
                </View>
                <Button 
                  onPress={() => handleDonate(tier)}
                  disabled={!!loading}
                  className={tier.popular ? "bg-[#10B981]" : "bg-[#4F46E5]"}
                  size="sm"
                >
                  <Text className="text-white font-bold">{loading === tier.id ? "..." : "Donate"}</Text>
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>

        <View className="mt-10 p-6 bg-[#4F46E5]/5 rounded-3xl border border-[#4F46E5]/10 items-center">
           <Sparkles size={24} className="text-[#4F46E5] mb-2" />
           <Text className="font-bold text-center mb-1">Every dollar helps!</Text>
           <Text className="text-muted-foreground text-center text-sm">
             We are committed to keeping SmartSaver 100% free and open to everyone. Thank you for your support! ❤️
           </Text>
        </View>

        <View className="mt-8 items-center">
           <Text variant="small" className="text-muted-foreground">Other ways to support:</Text>
           <View className="flex-row gap-4 mt-2">
             <Button variant="link" size="sm"><Text>PayPal</Text></Button>
             <Button variant="link" size="sm"><Text>Venmo</Text></Button>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
