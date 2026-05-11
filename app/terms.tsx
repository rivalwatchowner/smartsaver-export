import React from "react";
import { SafeAreaView, ScrollView, View, Text, Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function TermsOfService() {
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <Text variant="h3">Terms of Service</Text>
      </View>
      <ScrollView className="flex-1 p-6">
        <View className="mb-10">
          <Text variant="h1" className="mb-2">Terms of Service</Text>
          <Text variant="muted" className="mb-6">Last Updated: {currentDate}</Text>

          <Text variant="h4" className="mb-2">1. Acceptance of Terms</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            By accessing or using SmartSaver, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </Text>

          <Text variant="h4" className="mb-2">2. Subscription Services</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            Certain features of the app require a paid subscription. All paid plans include a 7-day free trial. You will be billed at the end of the trial unless you cancel.
          </Text>

          <Text variant="h4" className="mb-2">3. User Conduct</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            You agree not to use the service for any illegal purposes or to circumvent store policies. SmartSaver provides information about coupons but does not guarantee the availability or validity of any specific deal.
          </Text>

          <Text variant="h4" className="mb-2">4. Disclaimer of Warranties</Text>
          <Text className="mb-4 text-muted-foreground leading-relaxed">
            The service is provided "as is". SmartSaver makes no warranties regarding the accuracy or reliability of the AI-discovered coupons.
          </Text>

          <Text variant="h4" className="mb-2">5. Contact</Text>
          <Text className="mb-6 text-muted-foreground leading-relaxed">
            Questions about terms should be sent to: legal@smartsaver.app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
