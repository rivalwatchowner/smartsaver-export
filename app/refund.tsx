import React from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function RefundPolicy() {
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <Text variant="h3">Refund Policy</Text>
      </View>
      <ScrollView className="flex-1 p-6">
        <View className="mb-10">
          <Text variant="h1" className="mb-2">Refund Policy</Text>
          <Text variant="muted" className="mb-6">Last Updated: {currentDate}</Text>

          <Text variant="h4" className="mb-2">7-Day Free Trial</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            All paid plans (Basic, Premium, Family) come with a 7-day free trial. You can cancel at any time during the trial and you will not be charged.
          </Text>

          <Text variant="h4" className="mb-2">Subscription Refunds</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            We offer a 14-day "no questions asked" refund policy for your first subscription payment. If you are not satisfied with SmartSaver within the first 14 days after your trial ends, please contact us for a full refund.
          </Text>

          <Text variant="h4" className="mb-2">Renewal Refunds</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            Automatic renewals are generally non-refundable. We send reminder emails 3 days before your subscription renews. If you forget to cancel and are charged, please contact us within 48 hours and we may issue a partial refund at our discretion.
          </Text>

          <Text variant="h4" className="mb-2">How to Request a Refund</Text>
          <Text className="mb-6 text-muted-foreground leading-relaxed">
            Email your request to: support@smartsaver.app{"\n"}
            Please include the email address associated with your account.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
