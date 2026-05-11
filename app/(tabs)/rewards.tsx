import React from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, Spinner, Badge, Button, Pressable } from "@/components/ui";
import { TrendingUp, DollarSign, Award, ShoppingBag, CreditCard, ChevronRight, Wallet, Sparkles, ExternalLink } from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "react-native";
import { useRouter } from "expo-router";

export default function RewardsDashboard() {
  const router = useRouter();
  const wallet = useQuery(api.cards.getUserWallet);
  const loyaltyAccounts = useQuery(api.loyalty.getLinkedAccounts);
  
  // In a real app, we'd query cardEarnings and sum them up. 
  // For MVP, we'll use a mix of real loyalty data and the card stats logic.
  
  const totalLoyaltyPoints = loyaltyAccounts?.reduce((sum, acc) => sum + acc.pointsBalance, 0) || 0;
  const totalLoyaltyCashback = loyaltyAccounts?.reduce((sum, acc) => sum + acc.cashbackBalance, 0) || 0;
  
  const cardPoints = 12450; // Mock for card points until we have real transaction data
  const cardCashback = 87.50; // Mock for card savings
  
  const totalEstimatedValue = (cardPoints * 0.01) + totalLoyaltyCashback + cardCashback + (totalLoyaltyPoints * 0.005);

  if (wallet === undefined || loyaltyAccounts === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border">
        <Text variant="h2">My Rewards</Text>
        <Text variant="muted">Unified Dashboard</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        {/* Total Value Hero */}
        <Card className="mb-6 bg-primary border-0 overflow-hidden">
           <View className="absolute -right-4 -top-4 opacity-10">
              <Sparkles size={120} color="white" />
           </View>
           <CardContent className="p-6">
              <Text className="text-white/80 font-bold uppercase text-[10px] tracking-widest mb-1">Total Estimated Rewards Value</Text>
              <Text className="text-white text-4xl font-black">${totalEstimatedValue.toFixed(2)}</Text>
              
              <View className="flex-row gap-4 mt-6">
                 <View className="flex-1 bg-white/10 rounded-xl p-3 border border-white/20">
                    <Text className="text-white/60 text-[8px] font-bold uppercase mb-1">Points</Text>
                    <Text className="text-white text-lg font-bold">{(cardPoints + totalLoyaltyPoints).toLocaleString()}</Text>
                 </View>
                 <View className="flex-1 bg-white/10 rounded-xl p-3 border border-white/20">
                    <Text className="text-white/60 text-[8px] font-bold uppercase mb-1">Cashback</Text>
                    <Text className="text-white text-lg font-bold">${(cardCashback + totalLoyaltyCashback).toFixed(2)}</Text>
                 </View>
              </View>
           </CardContent>
        </Card>

        {/* Linked Loyalty Accounts */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
             <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Store Loyalty Programs</Text>
             <Pressable onPress={() => router.push("/(tabs)/explore")}>
                <Text className="text-primary text-xs font-bold">Add Store</Text>
             </Pressable>
          </View>

          {loyaltyAccounts.length === 0 ? (
            <Card className="border-dashed py-10 items-center">
               <Wallet size={40} className="text-muted-foreground/20 mb-3" />
               <Text className="text-muted-foreground font-medium mb-1">No store accounts linked yet</Text>
               <Text className="text-muted-foreground/60 text-xs mb-4">Link programs like Target Circle to track rewards here.</Text>
               <Button size="sm" variant="outline" onPress={() => router.push("/(tabs)/explore")}>
                  <Text>Explore Stores</Text>
               </Button>
            </Card>
          ) : (
            <View className="gap-3">
              {loyaltyAccounts.map((account) => (
                <Pressable key={account._id} onPress={() => router.push(`/store/${account.storeId}`)}>
                  <Card>
                    <CardContent className="p-4 flex-row items-center justify-between">
                       <View className="flex-row items-center gap-3">
                          <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                             <ShoppingBag size={20} className="text-primary" />
                          </View>
                          <View>
                             <Text className="font-bold">{account.storeName}</Text>
                             <Text variant="small" className="text-muted-foreground text-[10px]">{account.loyaltyProgramName}</Text>
                          </View>
                       </View>
                       <View className="items-end">
                          {account.pointsBalance > 0 && (
                            <Text className="font-bold">{account.pointsBalance.toLocaleString()} pts</Text>
                          )}
                          {account.cashbackBalance > 0 && (
                            <Text className="text-green-600 font-bold">${account.cashbackBalance.toFixed(2)}</Text>
                          )}
                          <ChevronRight size={14} className="text-muted-foreground mt-1" />
                       </View>
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Credit Card Rewards */}
        <View className="mb-8">
           <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Credit Card Rewards</Text>
           <View className="gap-3">
              {wallet.map((card) => (
                <Card key={card.userCardId}>
                   <CardContent className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                         <View className="w-10 h-6 bg-muted rounded border border-border items-center justify-center overflow-hidden">
                            {card.logoUrl && <Image source={{ uri: card.logoUrl }} className="w-full h-full" resizeMode="contain" />}
                         </View>
                         <Text className="font-medium text-sm">{card.name}</Text>
                      </View>
                      <View className="items-end">
                         <Text className="font-bold">{(Math.random() * 3000 + 1000).toFixed(0)} pts</Text>
                         <Text className="text-[10px] text-[#10B981] font-bold">+${(Math.random() * 30 + 5).toFixed(2)} saved</Text>
                      </View>
                   </CardContent>
                </Card>
              ))}
           </View>
        </View>

        {/* Pro Tips */}
        <Card className="bg-primary/5 border-primary/10">
           <CardContent className="p-4">
              <View className="flex-row items-center gap-2 mb-2">
                 <Sparkles size={16} className="text-primary" />
                 <Text className="font-bold text-primary text-sm">Stacking Tip</Text>
              </View>
              <Text className="text-xs text-muted-foreground leading-relaxed">
                 Maximize your rewards by combining a Manufacturer coupon, a Store loyalty discount, and your best-earning Credit Card. Some users save up to 40% per trip!
              </Text>
           </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
