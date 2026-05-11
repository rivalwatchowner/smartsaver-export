import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, Button, Badge, Spinner, Pressable, Input } from "@/components/ui";
import { CreditCard, Plus, Trash2, Check, Search, Smartphone, ChevronRight, Star } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "react-native";
import { useRouter } from "expo-router";

export default function CardWalletPage() {
  const router = useRouter();
  const wallet = useQuery(api.cards.getUserWallet);
  const allCards = useQuery(api.cards.listAllCards);
  const addCard = useMutation(api.cards.addCardToWallet);
  const removeCard = useMutation(api.cards.removeCardFromWallet);
  const setDefault = useMutation(api.cards.setDefaultCard);
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = allCards?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (wallet === undefined || allCards === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border">
        <View>
          <Text variant="h2">My Wallet</Text>
          <Text variant="muted">Manage your credit cards</Text>
        </View>
        <Button size="icon" variant="ghost" className="bg-primary/10 rounded-full" onPress={() => setIsAdding(!isAdding)}>
           {isAdding ? <Check size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
        </Button>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        {isAdding ? (
          <View className="gap-6">
            <View className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Search cards (e.g. Chase, Amex)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="pl-10"
              />
            </View>

            <View className="gap-3">
              <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Available Cards</Text>
              {filteredCards?.map((card) => {
                const isInWallet = wallet.some(w => w._id === card._id);
                return (
                  <Card key={card._id} className={isInWallet ? "opacity-50" : ""}>
                    <CardContent className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                         <View className="w-12 h-8 bg-muted rounded border border-border items-center justify-center overflow-hidden">
                            {card.logoUrl ? (
                               <Image source={{ uri: card.logoUrl }} className="w-full h-full" resizeMode="contain" />
                            ) : (
                               <CreditCard size={18} className="text-muted-foreground" />
                            )}
                         </View>
                         <View>
                            <Text className="font-bold">{card.name}</Text>
                            <Text variant="small" className="text-muted-foreground">{card.issuer}</Text>
                         </View>
                      </View>
                      <Button 
                        size="sm" 
                        variant={isInWallet ? "outline" : "default"}
                        onPress={() => !isInWallet && addCard({ cardId: card._id })}
                        disabled={isInWallet}
                      >
                         <Text>{isInWallet ? "Added" : "Add"}</Text>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="gap-4">
            {wallet.length === 0 ? (
              <View className="items-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border gap-4">
                 <View className="bg-muted p-4 rounded-full">
                    <Smartphone size={40} className="text-muted-foreground opacity-50" />
                 </View>
                 <View className="items-center">
                    <Text className="font-bold text-lg">Your wallet is empty</Text>
                    <Text variant="muted" className="text-center px-10">Add your cards to see the best one to use at every store.</Text>
                 </View>
                 <Button className="bg-[#4F46E5]" onPress={() => setIsAdding(true)}>
                    <Text className="text-white font-bold">Add My First Card</Text>
                 </Button>
              </View>
            ) : (
              wallet.map((card) => (
                <Card key={card.userCardId} className={card.isDefault ? "border-[#4F46E5] border-2 shadow-lg" : ""}>
                  <CardContent className="p-5">
                    <View className="flex-row justify-between items-start mb-4">
                       <View className="flex-row items-center gap-4">
                          <View className="w-16 h-10 bg-white rounded-lg border border-border items-center justify-center overflow-hidden">
                             {card.logoUrl ? (
                                <Image source={{ uri: card.logoUrl }} className="w-full h-full" resizeMode="contain" />
                             ) : (
                                <CreditCard size={24} className="text-muted-foreground" />
                             )}
                          </View>
                          <View>
                             <View className="flex-row items-center gap-2">
                                <Text className="font-black text-lg">{card.name}</Text>
                                {card.isDefault && (
                                   <Badge className="bg-[#4F46E5] px-1.5 py-0">
                                      <Text className="text-[8px] text-white font-bold">DEFAULT</Text>
                                   </Badge>
                                )}
                             </View>
                             <Text variant="small" className="text-muted-foreground">{card.issuer} • ${card.annualFee} Annual Fee</Text>
                          </View>
                       </View>
                    </View>

                    <View className="bg-muted/50 p-3 rounded-xl gap-2 mb-4">
                       <View className="flex-row justify-between items-center">
                          <Text variant="small" className="font-medium">Base Earning Rate</Text>
                          <Text className="font-bold">{(card.baseRate * 100).toFixed(1)}%</Text>
                       </View>
                       {card.categories.map((cat: any, i: number) => (
                          <View key={i} className="flex-row justify-between items-center">
                             <Text variant="small" className="text-muted-foreground">{cat.name}</Text>
                             <Text className="font-bold text-[#10B981]">{(cat.rate * 100).toFixed(1)}%</Text>
                          </View>
                       ))}
                    </View>

                    <View className="flex-row gap-2">
                       {!card.isDefault && (
                          <Button variant="outline" size="sm" className="flex-1" onPress={() => setDefault({ userCardId: card.userCardId })}>
                             <Text className="text-xs">Make Default</Text>
                          </Button>
                       )}
                       <Button variant="ghost" size="sm" className="bg-destructive/5" onPress={() => removeCard({ userCardId: card.userCardId })}>
                          <Trash2 size={16} className="text-destructive" />
                       </Button>
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
            
            {wallet.length > 0 && (
               <Button variant="outline" className="mt-4 border-dashed border-2 py-8" onPress={() => setIsAdding(true)}>
                  <Plus size={20} className="text-muted-foreground mr-2" />
                  <Text className="text-muted-foreground">Add Another Card</Text>
               </Button>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
