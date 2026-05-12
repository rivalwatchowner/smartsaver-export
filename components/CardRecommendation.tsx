import React, { useState } from "react";
import { View, Text, Card, CardContent, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { CreditCard, ArrowRight, Info, TrendingUp, X, Trophy } from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Image, Pressable, ScrollView } from "react-native";

interface CardRecommendationProps {
  storeId: Id<"stores">;
}

export function CardRecommendation({ storeId }: CardRecommendationProps) {
  const recommendation = useQuery(api.cards.getBestCardForStore, { storeId });
  const [showComparison, setShowComparison] = useState(false);

  if (recommendation === undefined) return null;

  if (!recommendation) {
    return (
      <Card className="bg-muted/30 border-dashed border-border mb-4">
        <CardContent className="p-4 flex-row items-center justify-between">
           <View className="flex-row items-center gap-3">
              <View className="bg-muted p-2 rounded-lg">
                <CreditCard size={20} className="text-muted-foreground" />
              </View>
              <Text className="text-sm font-medium text-muted-foreground">Add cards to optimize rewards</Text>
           </View>
           <Button variant="ghost" size="sm"><Text className="text-xs">Add Cards</Text></Button>
        </CardContent>
      </Card>
    );
  }

  const { best, all } = recommendation;
  const earnPer100 = best.effectiveRate * 100;

  return (
    <>
      <Card className="bg-[#4F46E5]/5 border-[#4F46E5]/20 mb-4 overflow-hidden">
        <CardContent className="p-0">
          <Pressable onPress={() => setShowComparison(true)}>
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-8 bg-card rounded-md border border-border items-center justify-center overflow-hidden">
                    {best.logoUrl ? (
                      <Image source={{ uri: best.logoUrl }} className="w-full h-full" resizeMode="contain" />
                    ) : (
                      <CreditCard size={18} className="text-muted-foreground" />
                    )}
                </View>
                <View>
                    <Text className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Best Card to Use</Text>
                    <Text className="font-bold text-base">{best.name}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-black text-[#4F46E5] text-lg">{(best.effectiveRate * 100).toFixed(1)}%</Text>
                <Text className="text-[10px] text-muted-foreground">REWARDS</Text>
              </View>
            </View>
            
            <View className="bg-[#4F46E5]/10 px-4 py-2 flex-row items-center justify-between">
               <View className="flex-row items-center gap-2">
                  <TrendingUp size={14} className="text-[#4F46E5]" />
                  <Text className="text-xs font-bold text-[#4F46E5]">
                    Earn ${earnPer100.toFixed(2)} per $100 spent
                  </Text>
               </View>
               <ArrowRight size={14} className="text-[#4F46E5]" />
            </View>
          </Pressable>
        </CardContent>
      </Card>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none rounded-3xl">
           <DialogHeader className="p-6 bg-[#4F46E5] flex-row justify-between items-center">
              <View>
                 <DialogTitle className="text-white text-xl">Card Comparison</DialogTitle>
                 <Text className="text-white/80 text-xs">Maximize your points at this store</Text>
              </View>
              <Pressable onPress={() => setShowComparison(false)} className="bg-white/10 p-2 rounded-full">
                 <X size={20} className="text-white" />
              </Pressable>
           </DialogHeader>

           <ScrollView className="max-h-[60vh] p-6">
              <View className="gap-4">
                 {all.map((card: any, index: number) => (
                    <View key={card.cardId} className={`flex-row items-center justify-between p-4 rounded-2xl border ${index === 0 ? 'bg-[#4F46E5]/5 border-[#4F46E5]' : 'bg-muted/30 border-border'}`}>
                       <View className="flex-row items-center gap-4">
                          <View className="w-6 items-center">
                             {index === 0 ? <Trophy size={18} className="text-[#EAB308]" /> : <Text className="font-bold text-muted-foreground">{index + 1}</Text>}
                          </View>
                          <View className="w-12 h-8 bg-card rounded border border-border items-center justify-center overflow-hidden">
                             {card.logoUrl && <Image source={{ uri: card.logoUrl }} className="w-full h-full" resizeMode="contain" />}
                          </View>
                          <View>
                             <Text className="font-bold text-sm">{card.name}</Text>
                             <Text variant="small" className="text-muted-foreground">{(card.effectiveRate * 100).toFixed(1)}% effective rate</Text>
                          </View>
                       </View>
                       <View className="items-end">
                          <Text className="font-black text-foreground">${(card.effectiveRate * 100).toFixed(2)}</Text>
                          <Text className="text-[8px] text-muted-foreground">BACK PER $100</Text>
                       </View>
                    </View>
                 ))}
              </View>
           </ScrollView>

           <View className="p-6 bg-muted/20 border-t border-border">
              <Button className="w-full bg-[#4F46E5] rounded-2xl h-14" onPress={() => setShowComparison(false)}>
                 <Text className="text-white font-bold text-lg">Got it!</Text>
              </Button>
           </View>
        </DialogContent>
      </Dialog>
    </>
  );
}
