import React from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, Input, Spinner, Pressable } from "@/components/ui";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, ChevronRight, Store, ShoppingBag, Pill, Zap, Utensils, Home } from "lucide-react-native";
import { useRouter } from "expo-router";

const CATEGORIES = [
  { name: "Grocery", id: "grocery", icon: ShoppingBag, color: "bg-green-100 text-green-600", activeColor: "bg-green-600 text-white" },
  { name: "Pharmacy", id: "pharmacy", icon: Pill, color: "bg-red-100 text-red-600", activeColor: "bg-red-600 text-white" },
  { name: "Electronics", id: "electronics", icon: Zap, color: "bg-blue-100 text-blue-600", activeColor: "bg-blue-600 text-white" },
  { name: "Home", id: "home", icon: Home, color: "bg-orange-100 text-orange-600", activeColor: "bg-orange-600 text-white" },
  { name: "Dining", id: "restaurants", icon: Utensils, color: "bg-purple-100 text-purple-600", activeColor: "bg-purple-600 text-white" },
];

export default function ExploreScreen() {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const stores = useQuery(api.stores.list, { 
    search: search || undefined,
    category: selectedCategory || undefined
  });
  const router = useRouter();

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4">
        <Text variant="h1" className="mb-4">Explore Stores</Text>
        <View className="relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground z-10" />
          <Input
            placeholder="Search stores..."
            value={search}
            onChangeText={setSearch}
            className="pl-10"
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pt-0 pb-20">
        {/* Categories */}
        <View className="flex-row justify-between items-center mb-3 mt-4">
           <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Categories</Text>
           {selectedCategory && (
              <Pressable onPress={() => setSelectedCategory(null)}>
                 <Text className="text-primary text-xs font-bold">Clear Filter</Text>
              </Pressable>
           )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 mb-8">
           {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Pressable 
                  key={cat.id} 
                  className="items-center mr-4"
                  onPress={() => handleToggleCategory(cat.id)}
                >
                   <View className={`w-14 h-14 rounded-2xl ${isActive ? cat.activeColor.split(' ')[0] : cat.color.split(' ')[0]} items-center justify-center mb-2`}>
                      <cat.icon size={24} className={isActive ? "text-white" : cat.color.split(' ')[1]} />
                   </View>
                   <Text variant="small" className={`font-medium ${isActive ? 'text-primary font-bold' : ''}`}>{cat.name}</Text>
                </Pressable>
              );
           })}
        </ScrollView>

        <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          {selectedCategory 
            ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Stores (${stores?.length || 0})` 
            : `All Stores (${stores?.length || 0})`}
        </Text>
        
        {stores === undefined ? (
          <View className="py-10 items-center">
             <Spinner />
          </View>
        ) : stores.length === 0 ? (
          <View className="py-10 items-center">
             <Text className="text-muted-foreground">No stores found matching your search.</Text>
          </View>
        ) : (
          <View className="gap-3">
             {stores.map((store) => (
                <Pressable 
                  key={store._id}
                  onPress={() => router.push(`/store/${store._id}`)}
                >
                  <Card>
                    <CardContent className="p-4 flex-row items-center justify-between">
                       <View className="flex-row items-center gap-3">
                          <View className="w-10 h-10 bg-muted rounded-xl items-center justify-center">
                             <Store size={20} className="text-muted-foreground" />
                          </View>
                          <View>
                             <Text className="font-bold">{store.name}</Text>
                             <Text variant="small" className="text-muted-foreground">View deals & best cards</Text>
                          </View>
                       </View>
                       <ChevronRight size={18} className="text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Pressable>
             ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
