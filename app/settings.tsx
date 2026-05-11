import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Button, Card, CardContent, Spinner, Pressable, Badge } from "@/components/ui";
import { MapPin, ChevronLeft, ChevronRight, Check, LogOut, Heart, Shield, Bell, User } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getMe);
  const updateLocation = useMutation(api.users.updateLocation);
  
  const [isChangingState, setIsChangingState] = useState(false);

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

  const handleStateSelect = async (st: {name: string, code: string}) => {
    await updateLocation({ state: st.name, stateCode: st.code });
    setIsChangingState(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  if (isChangingState) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => setIsChangingState(false)}>
            <ChevronLeft size={24} className="text-foreground" />
          </Button>
          <Text variant="h3" className="font-bold">Select Your State</Text>
        </View>
        <ScrollView className="flex-1 p-6">
          <View className="gap-2 pb-10">
            {states.map((st) => (
              <Pressable 
                key={st.code} 
                onPress={() => handleStateSelect(st)}
                className={`p-4 rounded-xl border-2 mb-2 ${user.stateCode === st.code ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`text-lg ${user.stateCode === st.code ? 'font-bold text-primary' : ''}`}>{st.name}</Text>
                  {user.stateCode === st.code && (
                    <Check size={20} className="text-primary" />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ChevronLeft size={24} className="text-foreground" />
        </Button>
        <Text variant="h3" className="font-bold">Settings</Text>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerClassName="pb-20">
        {/* Account Info */}
        <View className="items-center mb-8">
           <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
              <User size={40} className="text-primary" />
           </View>
           <Text className="font-bold text-xl">{user.email || "User"}</Text>
           <Badge variant="secondary" className="mt-1">
              <Text className="text-xs">{user.plan === "pro" ? "Pro Member" : "Free Member"}</Text>
           </Badge>
        </View>

        <Text variant="small" className="text-muted-foreground font-bold uppercase mb-3 ml-1">Location</Text>
        <Card className="mb-8 overflow-hidden">
          <Pressable onPress={() => setIsChangingState(true)}>
            <CardContent className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-primary/10 p-2 rounded-lg">
                  <MapPin size={20} className="text-primary" />
                </View>
                <View>
                  <Text className="font-bold">Current State</Text>
                  <Text variant="small" className="text-muted-foreground">{user.state || "Not Selected"}</Text>
                </View>
              </View>
              <Text className="text-primary font-bold">Change</Text>
            </CardContent>
          </Pressable>
        </Card>

        <Text variant="small" className="text-muted-foreground font-bold uppercase mb-3 ml-1">Preferences</Text>
        <View className="gap-3 mb-8">
           <Card className="overflow-hidden">
              <Pressable onPress={() => router.push("/notifications") }>
                <CardContent className="p-4 flex-row items-center justify-between">
                   <View className="flex-row items-center gap-3">
                      <View className="bg-orange-100 p-2 rounded-lg">
                         <Bell size={20} className="text-orange-600" />
                      </View>
                      <View>
                        <Text className="font-bold">Notifications</Text>
                        <Text variant="small" className="text-muted-foreground">Enabled</Text>
                      </View>
                   </View>
                   <ChevronRight size={18} className="text-muted-foreground" />
                </CardContent>
              </Pressable>
           </Card>
           <Card className="overflow-hidden">
              <Pressable onPress={() => router.push("/privacy-security") }>
                <CardContent className="p-4 flex-row items-center justify-between">
                   <View className="flex-row items-center gap-3">
                      <View className="bg-blue-100 p-2 rounded-lg">
                         <Shield size={20} className="text-blue-600" />
                      </View>
                      <Text className="font-bold">Privacy & Security</Text>
                   </View>
                   <ChevronRight size={18} className="text-muted-foreground" />
                </CardContent>
              </Pressable>
           </Card>
        </View>

        <Text variant="small" className="text-muted-foreground font-bold uppercase mb-3 ml-1">Support</Text>
        <View className="gap-3 mb-8">
           <Card className="overflow-hidden">
              <Pressable onPress={() => router.push("/donate")}>
                <CardContent className="p-4 flex-row items-center justify-between">
                   <View className="flex-row items-center gap-3">
                      <View className="bg-pink-100 p-2 rounded-lg">
                         <Heart size={20} className="text-pink-600" />
                      </View>
                      <Text className="font-bold">Support Us</Text>
                   </View>
                   <ChevronLeft size={20} className="text-muted-foreground rotate-180" />
                </CardContent>
              </Pressable>
           </Card>
        </View>

        <Button variant="destructive" className="h-14 rounded-2xl flex-row gap-3" onPress={handleLogout}>
           <LogOut size={20} className="text-white" />
           <Text className="text-white font-bold">Sign Out</Text>
        </Button>

        <View className="mt-8 items-center">
           <Text variant="small" className="text-muted-foreground">SmartSaver v1.0.0</Text>
           <Text variant="small" className="text-muted-foreground">© 2026 SmartSaver - All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Privacy Note */}
      {!isChangingState && (
        <View className="px-6 py-4 border-t border-border bg-muted/20">
          <Text variant="small" className="text-muted-foreground text-center italic">
            "We only use your state to show relevant coupons. We never track your precise location or share this information."
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
