import React from "react";
import { View, Text, SafeAreaView, ScrollView, Spinner, Card, CardContent, Badge, Button, Pressable } from "@/components/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, Info, ExternalLink, Ticket, CreditCard, CheckCircle2, Barcode, Sparkles, Plus, Wallet, Trash2, RefreshCw } from "lucide-react-native";
import { BarcodeModal } from "@/components/BarcodeModal";
import { CardRecommendation } from "@/components/CardRecommendation";
import { LoyaltyLinkForm } from "@/components/LoyaltyLinkForm";
import { Id } from "@/convex/_generated/dataModel";
import { Alert } from "react-native";

const LOYALTY_PROGRAMS: Record<string, string> = {
  "Target": "Target Circle",
  "Walmart": "Walmart+",
  "CVS": "CVS ExtraCare",
  "Walgreens": "Walgreens myWalgreens",
  "Kroger": "Kroger Plus Card",
  "Amazon": "Amazon Prime",
  "Costco": "Costco Membership",
  "Sam's Club": "Sam's Club Membership",
  "Shell": "Shell Fuel Rewards",
  "ExxonMobil": "Exxon Rewards+",
  "BP": "BPme Rewards",
  "Starbucks": "Starbucks Rewards",
  "McDonald's": "McDonald's Rewards",
  "Chipotle": "Chipotle Rewards",
  "Safeway": "Safeway for U",
  "Albertsons": "Albertsons for U",
  "Publix": "Publix Partners",
};

export default function StoreDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const stores = useQuery(api.stores.list, {});
  const store = stores?.find(s => s._id === id);
  const coupons = useQuery(api.publicCoupons.getStoreCoupons, { storeId: id as Id<"stores"> });
  const linkedAccount = useQuery(api.loyalty.getLinkedAccountForStore, { storeId: id as Id<"stores"> });
  
  const clipMutation = useMutation(api.publicCoupons.clipCoupon);
  const unclipMutation = useMutation(api.publicCoupons.unclipCoupon);
  const unlinkMutation = useMutation(api.loyalty.unlinkAccount);
  
  const [selectedBarcode, setSelectedBarcode] = React.useState<{title: string, value: string, format: string} | null>(null);
  const [showLoyaltyForm, setShowLoyaltyForm] = React.useState(false);

  const handleUnlink = async () => {
    if (linkedAccount) {
      Alert.alert(
        "Unlink Account",
        `Are you sure you want to disconnect your ${linkedAccount.loyaltyProgramName} account from SmartSaver?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Unlink", 
            style: "destructive",
            onPress: async () => {
              await unlinkMutation({ accountId: linkedAccount._id });
            }
          }
        ]
      );
    }
  };

  const handleClip = async (couponId: any, isClipped: boolean) => {
    if (isClipped) {
      await unclipMutation({ couponId });
    } else {
      await clipMutation({ couponId });
    }
  };

  if (!store) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row items-center border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="mr-2">
          <ChevronLeft className="text-foreground" />
        </Button>
        <View>
          <Text variant="h3">{store.name}</Text>
          <Text variant="muted" className="text-xs">Store Deals & Optimizer</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        {/* Optimizer Card */}
        <View className="mb-8">
           <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Best Card to Use</Text>
           <CardRecommendation storeId={store._id} />
        </View>

        {/* Member Perks */}
        {store.memberPerks && (
           <View className="mb-8">
             <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Member Perks</Text>
             <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex-row gap-3">
                   <Info size={20} className="text-primary mt-1" />
                   <Text className="flex-1 text-sm leading-relaxed">
                      {store.memberPerks}
                   </Text>
                </CardContent>
             </Card>
           </View>
        )}

        {/* Loyalty Integration */}
        {store && LOYALTY_PROGRAMS[store.name] && (
          <View className="mb-8">
            <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Loyalty Program</Text>
            {linkedAccount ? (
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="font-bold text-lg">{linkedAccount.loyaltyProgramName}</Text>
                      <Text variant="muted" className="text-xs">Linked Account: {linkedAccount.accountIdentifier}</Text>
                    </View>
                    <Badge variant="outline" className="bg-green-500/10 border-green-500/50">
                      <Text className="text-green-600 font-bold text-[10px]">CONNECTED</Text>
                    </Badge>
                  </View>
                  
                  <View className="flex-row gap-6 mb-4">
                    <View>
                      <Text className="text-[10px] uppercase font-bold text-muted-foreground">Points</Text>
                      <Text className="text-xl font-bold">{linkedAccount.pointsBalance.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text className="text-[10px] uppercase font-bold text-muted-foreground">Cashback</Text>
                      <Text className="text-xl font-bold">${linkedAccount.cashbackBalance.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onPress={() => setShowLoyaltyForm((prev) => !prev)}
                    >
                      <RefreshCw size={14} className="text-foreground mr-1" />
                      <Text>{showLoyaltyForm ? "Close" : "Update"}</Text>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onPress={handleUnlink}
                    >
                      <Trash2 size={14} className="text-destructive mr-1" />
                      <Text className="text-destructive">Unlink</Text>
                    </Button>
                  </View>

                  {showLoyaltyForm && (
                    <View className="mt-4 border-t border-border pt-4">
                      <LoyaltyLinkForm
                        storeId={store._id}
                        storeName={store.name}
                        loyaltyProgramName={LOYALTY_PROGRAMS[store.name]}
                        onSuccess={() => setShowLoyaltyForm(false)}
                        onCancel={() => setShowLoyaltyForm(false)}
                      />
                    </View>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-primary/30">
                <CardContent className="p-6 items-center">
                  <Wallet size={32} className="text-primary/40 mb-3" />
                  <Text className="font-bold text-center">Link your {LOYALTY_PROGRAMS[store.name]} account</Text>
                  <Text className="text-muted-foreground text-center text-sm mb-4">
                    Track your points and rewards alongside your coupons.
                  </Text>

                  <Button className="w-full" onPress={() => setShowLoyaltyForm(true)}>
                    <Plus size={16} className="text-white mr-2" />
                    <Text>Link Account</Text>
                  </Button>

                  {showLoyaltyForm && (
                    <View className="w-full mt-4 border-t border-border pt-4">
                      <LoyaltyLinkForm
                        storeId={store._id}
                        storeName={store.name}
                        loyaltyProgramName={LOYALTY_PROGRAMS[store.name]}
                        onSuccess={() => setShowLoyaltyForm(false)}
                        onCancel={() => setShowLoyaltyForm(false)}
                      />
                    </View>
                  )}
                </CardContent>
              </Card>
            )}
          </View>
        )}

        {/* Coupons */}
        <Text className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Active Coupons ({coupons?.length || 0})</Text>
        
        {coupons === undefined ? (
          <View className="py-10 items-center">
             <Spinner />
          </View>
        ) : coupons.length === 0 ? (
          <Card className="p-8 items-center border-dashed">
            <Ticket size={40} className="text-muted-foreground/30 mb-2" />
            <Text className="text-muted-foreground">No active coupons found for this store.</Text>
          </Card>
        ) : (
          <View className="gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon._id} className={coupon.isManufacturer ? 'border-dashed border-primary/50' : ''}>
                <CardContent className="p-4">
                   <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                         <View className="flex-row items-center gap-2 mb-1">
                            {coupon.isManufacturer && (
                               <Badge variant="outline" className="px-1.5 py-0 border-primary bg-primary/5">
                                  <Sparkles size={10} className="text-primary mr-1" />
                                  <Text className="text-[8px] text-primary font-bold uppercase">BRAND STACKABLE</Text>
                               </Badge>
                            )}
                         </View>
                         <Text className="font-bold text-lg">{coupon.title}</Text>
                         <Text variant="small" className="text-muted-foreground mt-1">{coupon.description}</Text>
                      </View>
                      <View className="items-end gap-2">
                         <Badge variant="secondary"><Text className="font-bold text-primary">{coupon.discount}</Text></Badge>
                         <Pressable onPress={() => handleClip(coupon._id, coupon.isClipped)}>
                            <Badge variant={coupon.isClipped ? "default" : "outline"} className={`px-1.5 py-0 ${coupon.isClipped ? 'bg-primary border-primary' : 'border-primary'}`}>
                               <Text className={`text-[8px] font-black uppercase ${coupon.isClipped ? 'text-white' : 'text-primary'}`}>
                                  {coupon.isClipped ? "CLIPPED ✓" : "CLIP"}
                               </Text>
                            </Badge>
                         </Pressable>
                      </View>
                   </View>
                   
                   <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-border">
                      <View>
                         <Text className="text-[10px] uppercase font-bold text-muted-foreground">Code</Text>
                         <Text className="font-mono font-bold text-base">{coupon.code}</Text>
                      </View>
                      
                      <View className="flex-row gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onPress={() => setSelectedBarcode({
                            title: coupon.title,
                            value: coupon.barcode || "1234567890",
                            format: "CODE128"
                          })}
                        >
                           <Barcode size={14} className="text-foreground mr-1" />
                           <Text className="text-xs">View</Text>
                        </Button>
                      </View>
                   </View>
                   
                   <View className="mt-3 flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                         <CheckCircle2 size={12} className="text-green-500" />
                         <Text className="text-[10px] text-green-600 font-bold">{coupon.verifiedCount} verified</Text>
                      </View>
                      <Text className="text-[10px] text-muted-foreground">Expires: {coupon.expiresAt}</Text>
                   </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

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
