import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Card,
  CardContent,
  Spinner,
  Button,
  Pressable,
} from "@/components/ui";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, Fuel, Sparkles, BadgePercent } from "lucide-react-native";
import { Id } from "@/convex/_generated/dataModel";

export default function GasSavingsScreen() {
  const router = useRouter();
  const stations = useQuery(api.publicCoupons.listGasSavingsStations, {});

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row items-center border-b border-border gap-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ChevronLeft className="text-foreground" />
        </Button>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <View className="bg-[#4F46E5] p-1.5 rounded-lg">
              <Fuel size={18} className="text-white" />
            </View>
            <Text variant="h3" className="font-bold">
              Gas Savings
            </Text>
          </View>
          <Text variant="muted" className="text-xs mt-0.5">
            Lowest posted prices & fuel rewards
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 pb-24 gap-4"
      >
        {stations === undefined ? (
          <View className="py-20 items-center">
            <Spinner size="large" />
            <Text variant="muted" className="mt-4 text-sm">
              Loading stations…
            </Text>
          </View>
        ) : stations.length === 0 ? (
          <Card className="border-dashed border-[#4F46E5]/30 bg-[#4F46E5]/5">
            <CardContent className="p-8 items-center">
              <Sparkles size={40} className="text-[#4F46E5] mb-3 opacity-80" />
              <Text className="font-bold text-lg text-center mb-2">
                AI is discovering deals…
              </Text>
              <Text className="text-muted-foreground text-center text-sm leading-relaxed">
                Fuel prices and loyalty discounts appear here once verified
                from real sources. Check back soon.
              </Text>
            </CardContent>
          </Card>
        ) : (
          stations.map((row) => {
            const name = row.store?.name ?? row.storeName;
            const sid = row.storeId as Id<"stores"> | undefined;
            return (
              <Pressable
                key={String(row._id)}
                disabled={!sid}
                onPress={() => {
                  if (sid) router.push(`/store/${sid}`);
                }}
              >
                <Card className="overflow-hidden border-border active:opacity-90">
                  <View className="flex-row">
                    <View className="bg-[#4F46E5]/10 w-24 items-center justify-center p-3 border-r border-[#4F46E5]/15">
                      <Text className="text-[#4F46E5] text-[10px] font-bold uppercase tracking-wide mb-1">
                        {row.fuelType ?? "Regular"}
                      </Text>
                      <Text className="text-[#4F46E5] font-black text-xl">
                        ${row.fuelPrice!.toFixed(3)}
                      </Text>
                      <Text className="text-muted-foreground text-[9px] mt-1">
                        per gal
                      </Text>
                    </View>
                    <CardContent className="flex-1 p-4 gap-2">
                      <Text className="font-bold text-base" numberOfLines={1}>
                        {name}
                      </Text>
                      {row.fuelDiscountCents != null && row.fuelDiscountCents > 0 ? (
                        <View className="flex-row items-center gap-2">
                          <BadgePercent size={14} className="text-[#4F46E5]" />
                          <Text className="text-sm text-foreground">
                            {row.fuelDiscountCents}¢ off / gal
                          </Text>
                        </View>
                      ) : null}
                      {row.loyaltyProgram ? (
                        <Text
                          variant="muted"
                          className="text-xs"
                          numberOfLines={2}
                        >
                          {row.loyaltyProgram}
                        </Text>
                      ) : null}
                      {sid ? (
                        <Text className="text-[#4F46E5] text-xs font-bold mt-1">
                          View store →
                        </Text>
                      ) : null}
                    </CardContent>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
