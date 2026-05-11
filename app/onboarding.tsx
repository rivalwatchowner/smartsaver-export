import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, Button, Badge, Spinner, Pressable } from "@/components/ui";
import { CreditCard, Check, ChevronRight, Sparkles } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingPage() {
  const router = useRouter();
  const allCards = useQuery(api.cards.listAllCards);
  const addCard = useMutation(api.cards.addCardToWallet);
  const wallet = useQuery(api.cards.getUserWallet);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [step, setStep] = useState(1); // 1: Select Cards, 2: Select State, 3: Explainer
  const [selectedState, setSelectedState] = useState<{name: string, code: string} | null>(null);
  const updateLocation = useMutation(api.users.updateLocation);

  const states = [
    { name: "Alabama", code: "AL" }, { name: "Alaska", code: "AK" }, { name: "Arizona", code: "AZ" },
    { name: "Arkansas", code: "AR" }, { name: "California", code: "CA" }, { name: "Colorado", code: "CO" },
    { name: "Connecticut", code: "CT" }, { name: "Delaware", code: "DE" }, { name: "Florida", code: "FL" },
    { name: "Georgia", code: "GA" }, { name: "Hawaii", code: "HI" }, { name: "Idaho", code: "ID" },
    { name: "Illinois", code: "IL" }, { name: "Indiana", code: "IN" }, { name: "Iowa", code: "IA" },
    { name: "Kansas", code: "KS" }, { name: "Kentucky", code: "KY" }, { name: "Louisiana", code: "LA" },
    { name: "Maine", code: "ME" }, { name: "Maryland", code: "MD" }, { name: "Massachusetts", code: "MA" },
    { name: "Michigan", code: "MI" }, { name: "Minnesota", code: "MN" }, { name: "Mississippi", code: "MS" },
    { name: "Missouri", code: "MO" }, { name: "Montana", code: "MT" }, { name: "Nebraska", code: "NE" },
    { name: "Nevada", code: "NV" }, { name: "New Hampshire", code: "NH" }, { name: "New Jersey", code: "NJ" },
    { name: "New Mexico", code: "NM" }, { name: "New York", code: "NY" }, { name: "North Carolina", code: "NC" },
    { name: "North Dakota", code: "ND" }, { name: "Ohio", code: "OH" }, { name: "Oklahoma", code: "OK" },
    { name: "Oregon", code: "OR" }, { name: "Pennsylvania", code: "PA" }, { name: "Rhode Island", code: "RI" },
    { name: "South Carolina", code: "SC" }, { name: "South Dakota", code: "SD" }, { name: "Tennessee", code: "TN" },
    { name: "Texas", code: "TX" }, { name: "Utah", code: "UT" }, { name: "Vermont", code: "VT" },
    { name: "Virginia", code: "VA" }, { name: "Washington", code: "WA" }, { name: "West Virginia", code: "WV" },
    { name: "Wisconsin", code: "WI" }, { name: "Wyoming", code: "WY" }
  ];

  const toggleCard = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    try {
      if (step === 1) {
         // Save selected cards
         if (selectedIds.length > 0) {
           for (const id of selectedIds) {
              try {
                await addCard({ cardId: id as any });
              } catch (e) {
                console.error("Failed to add card", id, e);
              }
           }
         }
         setStep(2);
      } else if (step === 2) {
         if (selectedState) {
           try {
             await updateLocation({ 
               state: selectedState.name, 
               stateCode: selectedState.code 
             });
           } catch (e) {
             console.error("Failed to update location", e);
           }
         }
         setStep(3);
      } else {
         router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      // Fallback: move to next step or home
      if (step < 3) setStep(step + 1);
      else router.replace("/(tabs)/home");
    }
  };

  if (allCards === undefined || wallet === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <View className="flex-row gap-2 mb-8">
           <View className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#4F46E5]' : 'bg-muted'}`} />
           <View className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#4F46E5]' : 'bg-muted'}`} />
           <View className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#4F46E5]' : 'bg-muted'}`} />
        </View>

        {step === 1 ? (
          <ScrollView className="flex-1">
            <View className="mb-8">
               <Text variant="h1" className="text-3xl mb-2">Which cards do you have?</Text>
               <Text variant="muted">Select your cards to see how much you can save. You can always add more later.</Text>
            </View>

            <View className="gap-3">
              {allCards.map((card) => {
                const isSelected = selectedIds.includes(card._id);
                return (
                  <Pressable key={card._id} onPress={() => toggleCard(card._id)}>
                    <Card className={isSelected ? "border-[#4F46E5] border-2 bg-[#4F46E5]/5" : "border-border"}>
                       <CardContent className="p-4 flex-row items-center justify-between">
                          <View className="flex-row items-center gap-4">
                             <View className="w-12 h-8 bg-white rounded border border-border items-center justify-center overflow-hidden">
                                {card.logoUrl && <Image source={{ uri: card.logoUrl }} className="w-full h-full" resizeMode="contain" />}
                             </View>
                             <View>
                                <Text className="font-bold">{card.name}</Text>
                                <Text variant="small" className="text-muted-foreground">{card.issuer}</Text>
                             </View>
                          </View>
                          {isSelected ? (
                             <View className="bg-[#4F46E5] rounded-full p-1">
                                <Check size={16} className="text-white" />
                             </View>
                          ) : (
                             <View className="w-6 h-6 border-2 border-muted rounded-full" />
                          )}
                       </CardContent>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        ) : step === 2 ? (
          <View className="flex-1">
            <View className="mb-8">
               <Text variant="h1" className="text-3xl mb-2">Where are you shopping?</Text>
               <Text variant="muted">Help us show you the best deals for your area. Some coupons vary by state.</Text>
            </View>

            <ScrollView className="flex-1 gap-2">
              {states.map((st) => (
                <Pressable 
                  key={st.code} 
                  onPress={() => setSelectedState(st)}
                  className={`p-4 rounded-xl border-2 mb-2 ${selectedState?.code === st.code ? 'border-[#4F46E5] bg-[#4F46E5]/5' : 'border-border'}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-lg ${selectedState?.code === st.code ? 'font-bold text-[#4F46E5]' : ''}`}>{st.name}</Text>
                    {selectedState?.code === st.code && (
                      <Check size={20} className="text-[#4F46E5]" />
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            
            <View className="mt-4 p-4 bg-muted/30 rounded-xl">
               <Text variant="small" className="text-muted-foreground text-center italic">
                 "We only use your state to show relevant coupons. We never track your precise location or share this information."
               </Text>
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-8">
             <View className="bg-[#4F46E5]/10 p-8 rounded-full">
                <Sparkles size={80} className="text-[#4F46E5]" />
             </View>
             <View className="items-center">
                <Text variant="h1" className="text-center mb-4">You're All Set!</Text>
                <Text variant="muted" className="text-center px-10 text-lg">
                   SmartSaver will now show you the absolute best card to use at every store, factoring in bonus categories and point values.
                </Text>
             </View>
             
             <Card className="w-full bg-[#10B981]/5 border-[#10B981]/20">
                <CardContent className="p-4 flex-row items-center gap-4">
                   <View className="bg-[#10B981] p-2 rounded-xl">
                      <CreditCard size={24} className="text-white" />
                   </View>
                   <View className="flex-1">
                      <Text className="font-bold">Optimization Active</Text>
                      <Text variant="small" className="text-muted-foreground">We found the best deals in {selectedState?.name || "your area"}!</Text>
                   </View>
                </CardContent>
             </Card>
          </View>
        )}

        <View className="pt-6 border-t border-border gap-3">
           <Button className="bg-[#4F46E5] h-16 rounded-2xl" onPress={handleNext}>
              <Text className="text-white font-bold text-lg">{step === 3 ? "Start Saving" : "Continue"}</Text>
           </Button>
           {step < 3 && (
              <Button variant="ghost" onPress={() => setStep(step + 1)}>
                 <Text className="text-muted-foreground">Skip for now</Text>
              </Button>
           )}
        </View>
      </View>
    </SafeAreaView>
  );
}
