import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, Switch, Button } from "@/components/ui";
import { Bell, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
  const router = useRouter();

  const [couponAlertsEnabled, setCouponAlertsEnabled] = useState(true);
  const [expiringAlertsEnabled, setExpiringAlertsEnabled] = useState(true);
  const [loyaltyUpdatesEnabled, setLoyaltyUpdatesEnabled] = useState(true);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ChevronLeft size={24} className="text-foreground" />
        </Button>
        <Text variant="h3" className="font-bold">Notifications</Text>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerClassName="pb-20 gap-3">
        <Card>
          <CardContent className="p-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-bold">New Coupon Alerts</Text>
              <Text variant="small" className="text-muted-foreground">
                Get notified when fresh deals are discovered.
              </Text>
            </View>
            <Switch checked={couponAlertsEnabled} onCheckedChange={setCouponAlertsEnabled} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-bold">Expiring Coupon Reminders</Text>
              <Text variant="small" className="text-muted-foreground">
                Reminders before your clipped coupons expire.
              </Text>
            </View>
            <Switch checked={expiringAlertsEnabled} onCheckedChange={setExpiringAlertsEnabled} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-bold">Loyalty Balance Updates</Text>
              <Text variant="small" className="text-muted-foreground">
                Alerts when linked loyalty balances change.
              </Text>
            </View>
            <Switch checked={loyaltyUpdatesEnabled} onCheckedChange={setLoyaltyUpdatesEnabled} />
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 mt-4">
          <CardContent className="p-4 flex-row gap-3">
            <Bell size={18} className="text-primary mt-0.5" />
            <Text variant="small" className="text-muted-foreground flex-1">
              Notification settings are saved on this device for now. Server sync can be added next.
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
