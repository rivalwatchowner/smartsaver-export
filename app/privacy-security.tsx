import React from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, Button, Pressable } from "@/components/ui";
import { ChevronLeft, ChevronRight, ShieldCheck, FileText, Lock } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function PrivacySecurityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ChevronLeft size={24} className="text-foreground" />
        </Button>
        <Text variant="h3" className="font-bold">Privacy & Security</Text>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerClassName="pb-20 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex-row gap-3">
            <ShieldCheck size={18} className="text-primary mt-0.5" />
            <Text variant="small" className="text-muted-foreground flex-1">
              SmartSaver only stores what is needed to personalize deals and linked rewards.
              We do not track precise GPS location.
            </Text>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <Pressable onPress={() => router.push("/privacy")}>
            <CardContent className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-blue-100 p-2 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </View>
                <Text className="font-bold">Privacy Policy</Text>
              </View>
              <ChevronRight size={18} className="text-muted-foreground" />
            </CardContent>
          </Pressable>
        </Card>

        <Card className="overflow-hidden">
          <Pressable onPress={() => router.push("/terms")}>
            <CardContent className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-indigo-100 p-2 rounded-lg">
                  <Lock size={20} className="text-indigo-600" />
                </View>
                <Text className="font-bold">Terms of Service</Text>
              </View>
              <ChevronRight size={18} className="text-muted-foreground" />
            </CardContent>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
