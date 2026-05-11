import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Input, Card, CardContent, CardHeader, CardTitle, Badge, Pressable, Spinner, Button } from "@/components/ui";
import { Search, MapPin, Tag, Sparkles, ChevronDown, ChevronUp, Barcode, Heart, ShoppingBag, Settings, Fuel } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { BarcodeModal } from "@/components/BarcodeModal";
import { CardRecommendation } from "@/components/CardRecommendation";

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "clipped">("all");
  const groupedCoupons = useQuery(api.publicCoupons.listGroupedByStore, {});
  const groupedClipped = useQuery(api.publicCoupons.listClippedGroupedByStore, {});
  const gasSavingsStations = useQuery(api.publicCoupons.listGasSavingsStations, {});
  const clipMutation = useMutation(api.publicCoupons.clipCoupon);
  const unclipMutation = useMutation(api.publicCoupons.unclipCoupon);
  const isAdmin = useQuery(api.admin.isAdmin, {});
  const user = useQuery(api.users.getMe);
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<"alpha" | "count" | "savings">("alpha");

  const handleClip = async (couponId: any, isClipped: boolean) => {
    if (isClipped) {
      await unclipMutation({ couponId });
    } else {
      await clipMutation({ couponId });
    }
  };
  
  // Barcode Modal State
  const [selectedBarcode, setSelectedBarcode] = useState<{title: string, value: string, format: string} | null>(null);

  const toggleStore = (storeId: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    rawData?.forEach((g: any) => {
      const id = g.isManufacturer ? "manufacturer" : g.storeId;
      if (id) all[id] = true;
    });
    setExpandedStores(all);
  };

  const collapseAll = () => {
    setExpandedStores({});
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  // Filtering and Sorting
  const rawData = activeTab === "all" ? groupedCoupons : groupedClipped;
  const totalClippedCount = groupedClipped?.reduce((sum, g) => sum + g.coupons.length, 0) || 0;

  const filteredData = rawData?.filter(g =>
    (g.storeName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    g.coupons.some((c: any) => (c.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  ).sort((a: any, b: any) => {
    if (sortBy === "alpha") return (a.storeName || "").localeCompare(b.storeName || "");
    if (sortBy === "count") return (b.coupons?.length || 0) - (a.coupons?.length || 0);
    if (sortBy === "savings") {
      const aSavings = a.coupons.reduce((acc: number, c: any) => acc + (c.originalPrice ? c.originalPrice - (c.discountedPrice || 0) : 0), 0);
      const bSavings = b.coupons.reduce((acc: number, c: any) => acc + (c.originalPrice ? c.originalPrice - (c.discountedPrice || 0) : 0), 0);
      return bSavings - aSavings;
    }
    return 0;
  });

  const hasGasFuelDeals = (gasSavingsStations?.length ?? 0) > 0;
  const filteredOutBySearch =
    rawData !== undefined &&
    rawData.length > 0 &&
    (filteredData?.length ?? 0) === 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-background border-b border-border">
        <View className="flex-row items-center gap-2">
          <View className="bg-[#4F46E5] p-1 rounded-lg">
            <Tag size={20} className="text-white" />
          </View>
          <Text variant="h3" className="font-bold">My Coupons</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {isAdmin && (
            <Button variant="ghost" size="icon" onPress={() => router.push("/admin/dashboard")}>
              <Sparkles size={20} className="text-primary" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onPress={() => router.push("/donate")}>
            <Heart size={20} className="text-[#10B981]" />
          </Button>
          <Button variant="ghost" size="icon" onPress={() => router.push("/settings")}>
            <Settings size={20} className="text-muted-foreground" />
          </Button>
        </View>
      </View>

      {/* Search and Sort */}
      <View className="px-6 pt-4 pb-2 gap-4">
        {user?.state && (
          <View className="flex-row items-center gap-1.5 mb-1">
            <MapPin size={12} className="text-[#4F46E5]" />
            <Text variant="small" className="text-[#4F46E5] font-bold">Shopping in {user.state}</Text>
          </View>
        )}
        {/* Tabs */}
        <View className="flex-row bg-muted/50 p-1 rounded-xl mb-2">
          <Pressable
            onPress={() => setActiveTab("all")}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === "all" ? "bg-background shadow-sm" : ""}`}
          >
            <Text
              className={`text-xs font-bold ${activeTab === "all" ? "text-primary" : "text-muted-foreground"}`}
            >
              All Coupons
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("clipped")}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === "clipped" ? "bg-background shadow-sm" : ""}`}
          >
            <View className="flex-row items-center gap-1.5">
              <Text
                className={`text-xs font-bold ${activeTab === "clipped" ? "text-primary" : "text-muted-foreground"}`}
              >
                My Clipped
              </Text>
              {totalClippedCount > 0 && (
                <View className="bg-primary px-1.5 py-0.5 rounded-full">
                  <Text className="text-[8px] text-white font-bold">
                    {totalClippedCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        <View className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
          <Input
            placeholder="Search stores or coupons..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-10 h-12 rounded-xl border-border bg-muted/30"
          />
        </View>

        {filteredData && filteredData.length > 0 && (
          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-2">
              <Button variant="ghost" size="sm" onPress={expandAll}>
                <Text className="text-xs font-medium">Expand All</Text>
              </Button>
              <Button variant="ghost" size="sm" onPress={collapseAll}>
                <Text className="text-xs font-medium">Collapse All</Text>
              </Button>
            </View>

            <View className="flex-row items-center gap-2">
              <Text variant="small" className="text-muted-foreground">
                Sort:
              </Text>
              <Pressable
                onPress={() => {
                  if (sortBy === "alpha") setSortBy("count");
                  else if (sortBy === "count") setSortBy("savings");
                  else setSortBy("alpha");
                }}
                className="bg-muted px-3 py-1 rounded-full border border-border"
              >
                <Text className="text-xs font-bold capitalize">{sortBy}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Grouped Coupon List */}
      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-20 pt-2">
        {rawData === undefined ? (
          <View className="items-center py-20">
            <Spinner size="large" />
          </View>
        ) : (
          <View className="gap-3">
            {hasGasFuelDeals && (
              <Pressable
                onPress={() => router.push("/gas-savings")}
                className="rounded-2xl border border-[#4F46E5]/25 bg-[#4F46E5]/8 p-4 flex-row items-center gap-4 active:opacity-90"
              >
                <View className="bg-[#4F46E5] p-2.5 rounded-xl">
                  <Fuel size={22} className="text-white" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-base text-foreground">
                    Gas Savings
                  </Text>
                  <Text variant="muted" className="text-xs">
                    {gasSavingsStations!.length} station
                    {gasSavingsStations!.length === 1 ? "" : "s"} with fuel deals — tap to compare prices
                  </Text>
                </View>
                <Sparkles size={18} className="text-[#4F46E5]" />
              </Pressable>
            )}

            {filteredData?.length === 0 ? (
              <View className="items-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                {activeTab === "clipped" ? (
                  <>
                    <Tag size={48} className="text-muted-foreground mb-4 opacity-20" />
                    <Text className="font-bold text-lg text-muted-foreground">
                      No clipped coupons
                    </Text>
                    <Text variant="muted" className="text-center px-10">
                      Clip coupons to save them here for quick access at checkout!
                    </Text>
                    <Button
                      variant="outline"
                      className="mt-4 border-[#4F46E5]"
                      onPress={() => setActiveTab("all")}
                    >
                      <Text className="text-[#4F46E5] font-bold">Browse All Coupons</Text>
                    </Button>
                  </>
                ) : filteredOutBySearch ? (
                  <>
                    <Search size={48} className="text-muted-foreground mb-4 opacity-20" />
                    <Text className="font-bold text-lg text-muted-foreground">
                      No matching coupons
                    </Text>
                    <Text variant="muted" className="text-center px-8">
                      Try a different search term or clear the search box.
                    </Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={48} className="text-[#4F46E5] mb-4 opacity-90" />
                    <Text className="font-bold text-lg text-[#4F46E5]">
                      AI is discovering deals…
                    </Text>
                    <Text variant="muted" className="text-center px-10">
                      SmartSaver is scanning verified sources for new coupons. Pull
                      to refresh or check back soon.
                    </Text>
                  </>
                )}
              </View>
            ) : null}

            {(filteredData?.length ?? 0) > 0
              ? filteredData?.map((group: any) => {
              const storeId = group.storeId;
              const isExpanded = expandedStores[storeId];
              const storeName = group.storeName;

              return (
                <View key={storeId} className="gap-2">
                  <Pressable 
                    onPress={() => toggleStore(storeId)}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${isExpanded ? 'bg-muted/50 border-[#4F46E5]/30' : 'bg-card border-border'} ${group.isManufacturer ? 'border-dashed border-primary/50' : ''}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${isExpanded ? 'bg-[#4F46E5]' : 'bg-muted'}`}>
                        {group.isManufacturer ? (
                          <Sparkles size={20} className={isExpanded ? 'text-white' : 'text-primary'} />
                        ) : (
                          <Text className={`font-bold text-lg ${isExpanded ? 'text-white' : 'text-foreground'}`}>{(storeName || "?")[0]}</Text>
                        )}
                      </View>
                      <View>
                        <Text className="font-bold text-base">{storeName}</Text>
                        <View className="flex-row items-center gap-2">
                          <Badge variant="secondary" className="px-1.5 py-0">
                            <Text className="text-[10px]">{group.coupons.length} {activeTab === "clipped" ? 'clipped' : 'coupons'}</Text>
                          </Badge>
                          {group.isManufacturer && (
                            <Badge variant="outline" className="px-1.5 py-0 border-primary">
                               <Text className="text-[8px] text-primary font-bold">STACKABLE</Text>
                            </Badge>
                          )}
                        </View>
                      </View>
                    </View>
                    {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                  </Pressable>

                  {isExpanded && (
                    <View className="gap-3 mt-1 ml-4 border-l-2 border-muted pl-4">
                      {!group.isManufacturer && group.store && <CardRecommendation storeId={group.store._id} />}
                      {group.coupons.map((coupon: any) => (
                        <Card key={coupon._id} className="overflow-hidden border-muted-foreground/10">
                          <View className="flex-row">
                            <View className={`${group.isManufacturer ? 'bg-primary/10' : 'bg-[#4F46E5]/10'} w-20 items-center justify-center p-2`}>
                              <Text className={`${group.isManufacturer ? 'text-primary' : 'text-[#4F46E5]'} font-black text-lg text-center leading-tight`}>{coupon.discount}</Text>
                            </View>
                            <View className="flex-1 p-3">
                              <View className="flex-row justify-between items-start mb-1">
                                <Text className="font-bold text-sm flex-1" numberOfLines={1}>{coupon.title}</Text>
                                <Pressable onPress={() => handleClip(coupon._id, coupon.isClipped)}>
                                   <Badge variant={coupon.isClipped ? "default" : "outline"} className={`px-1.5 py-0 ${coupon.isClipped ? 'bg-primary border-primary' : 'border-primary'}`}>
                                      <Text className={`text-[8px] font-black uppercase ${coupon.isClipped ? 'text-white' : 'text-primary'}`}>
                                         {coupon.isClipped ? "CLIPPED ✓" : "CLIP"}
                                      </Text>
                                   </Badge>
                                </Pressable>
                              </View>
                              <Text variant="muted" className="text-[11px] mb-2" numberOfLines={2}>{coupon.description}</Text>
                              
                              <View className="flex-row justify-between items-end">
                                <View>
                                  {coupon.originalPrice && (
                                    <Text className="text-muted-foreground line-through text-[10px]">${coupon.originalPrice.toFixed(2)}</Text>
                                  )}
                                  <Text className="text-base font-black text-foreground">
                                    {group.isManufacturer ? "ANY STORE" : `${coupon.discountedPrice?.toFixed(2) || "0.00"}`}
                                  </Text>
                                </View>
                                
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 rounded-lg flex-row gap-1.5 px-3"
                                  onPress={() => setSelectedBarcode({
                                    title: coupon.title,
                                    value: coupon.barcode || coupon.code || "",
                                    format: "CODE128"
                                  })}
                                >
                                   <Barcode size={14} className="text-foreground" />
                                   <Text className="text-[10px] font-bold">VIEW</Text>
                                </Button>
                              </View>
                            </View>
                          </View>
                        </Card>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
              : null}
          </View>
        )}
      </ScrollView>
      
      {/* Donation Banner */}
      <Card className="mx-6 mb-8 border-[#10B981]/30 bg-[#10B981]/5 rounded-2xl overflow-hidden shadow-sm shadow-[#10B981]/10">
         <CardContent className="p-4 flex-row items-center gap-4">
            <View className="bg-[#10B981] p-2 rounded-xl">
               <Heart size={20} className="text-white fill-white" />
            </View>
            <View className="flex-1">
               <Text className="font-bold text-sm">Support SmartSaver</Text>
               <Text className="text-[11px] text-muted-foreground">Keep the AI running with a small donation!</Text>
            </View>
            <Button size="sm" className="bg-[#10B981] h-8 rounded-full" onPress={() => router.push("/donate")}>
               <Text className="text-white text-xs font-bold px-2">Donate</Text>
            </Button>
         </CardContent>
      </Card>

      {selectedBarcode && (
        <BarcodeModal 
          isOpen={!!selectedBarcode}
          onClose={() => setSelectedBarcode(null)}
          couponTitle={selectedBarcode.title}
          barcodeValue={selectedBarcode.value}
          barcodeFormat={selectedBarcode.format}
        />
      )}
    </SafeAreaView>
  );
}
