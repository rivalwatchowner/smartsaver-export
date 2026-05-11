import React from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function PrivacyPolicy() {
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <Text variant="h3">Privacy Policy</Text>
      </View>
      <ScrollView className="flex-1 p-6">
        <View className="mb-10">
          <Text variant="h1" className="mb-2">Privacy Policy</Text>
          <Text variant="muted" className="mb-6">Last Updated: {currentDate}</Text>

          <Text variant="h4" className="mb-2">Information We Collect</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            SmartSaver collects:{"\n"}
            • Account information (email, name){"\n"}
            • Payment information (processed securely via Lemon Squeezy/Stripe - we never store card details){"\n"}
            • Store preferences and coupon usage data{"\n"}
            • Device and usage analytics
          </Text>

          <Text variant="h4" className="mb-2">How We Use Your Information</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            • Provide AI-powered coupon discovery{"\n"}
            • Send deal alerts and notifications (with your permission){"\n"}
            • Process payments and manage subscriptions{"\n"}
            • Improve our service
          </Text>

          <Text variant="h4" className="mb-2">Data Sharing</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            We do NOT sell your personal data to third parties. We share data only with:{"\n"}
            • Payment processors (Lemon Squeezy/Stripe) for transactions{"\n"}
            • Analytics providers for service improvement
          </Text>

          <Text variant="h4" className="mb-2">Your Rights</Text>
          <Text className="mb-6 text-muted-foreground leading-relaxed">
            • Request data export: privacy@smartsaver.app{"\n"}
            • Request data deletion: privacy@smartsaver.app{"\n"}
            • Opt out of marketing: Use the unsubscribe link in emails
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
