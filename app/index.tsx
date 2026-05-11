import React from "react";
import { SafeAreaView, ScrollView, View, Text, Button, Card, CardContent, CardHeader, CardTitle, Badge, Pressable } from "@/components/ui";
import { Sparkles, Smartphone, Tag, ShoppingBag, Store, Users, Check, Bell, TrendingDown, LayoutGrid, Star, CheckCircle, ChevronRight, Twitter, Facebook, Instagram, Mail, Search, CheckCircle2 } from "lucide-react-native";
import { useRouter, Link } from "expo-router";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      title: "AI-Powered Search",
      description: "Our AI scans 100+ retailers daily to find digital coupons, promo codes, and exclusive member deals automatically.",
      icon: Sparkles
    },
    {
      title: "Track Member Perks",
      description: "Manage all your store memberships in one place - Target Circle, Walmart+, CVS ExtraCare, Costco, and more.",
      icon: Tag
    },
    {
      title: "Never Miss a Deal",
      description: "Get instant alerts for new coupons, expiring deals, and price drops on items you love.",
      icon: Bell
    },
    {
      title: "All Your Stores",
      description: "Target, Walmart, CVS, Walgreens, Kroger, Safeway, Amazon, Costco, Home Depot, and 100+ more retailers.",
      icon: Store
    }
  ];

  const pricing = [
    {
      name: "FREE",
      price: "$0",
      description: "3 stores maximum",
      features: ["AI coupon search", "Manual refresh", "Basic support"],
      buttonText: "Get Started Free"
    },
    {
      name: "BASIC",
      price: "$2.99",
      description: "10 stores",
      features: ["AI coupon search", "Daily auto-refresh", "Email notifications", "Priority support", "7-day free trial"],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "PREMIUM",
      price: "$4.99",
      description: "Unlimited stores",
      features: ["Real-time auto-refresh", "Custom alerts", "Price tracking", "Exclusive deals", "VIP support", "7-day free trial"],
      buttonText: "Start Free Trial"
    },
    {
      name: "FAMILY",
      price: "$7.99",
      description: "Shared savings pool",
      features: ["Everything in Premium", "Up to 5 family members", "Shared shopping lists", "Family savings tracker", "7-day free trial"],
      buttonText: "Start Free Trial"
    }
  ];

  const testimonials = [
    { name: "Sarah M.", text: "I save at least $200 every month! The AI finds deals I never knew existed." },
    { name: "James L.", text: "All my store memberships in one place. No more missing member discounts!" },
    { name: "Mike T.", text: "The family plan is perfect. We share all our coupons now!" }
  ];

  const stores = ["Target", "Walmart", "CVS", "Walgreens", "Kroger", "Safeway", "Amazon", "Costco", "Dollar General", "Rite Aid", "Macy's", "Home Depot"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-0">
        
        {/* Navigation */}
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-border">
          <View className="flex-row items-center gap-2">
            <View className="bg-[#4F46E5] p-1.5 rounded-lg shadow-sm">
              <Tag className="h-5 w-5 text-white" />
            </View>
            <Text className="font-bold text-xl tracking-tight text-foreground">SmartSaver</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-sm font-medium text-muted-foreground">Log In</Text>
              </Pressable>
            </Link>
            <Button variant="ghost" size="sm" onPress={() => router.push("/signup")}>
              <Text>Get Started</Text>
            </Button>
          </View>
        </View>

        {/* Hero Section */}
        <View className="px-6 py-20 items-center">
          <Badge variant="outline" className="mb-6 px-4 py-1 border-[#4F46E5]/30 bg-[#4F46E5]/5">
            <Text className="text-[#4F46E5] font-semibold">New: AI-Powered Coupon Hunting</Text>
          </Badge>
          <Text className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-3xl leading-tight">
            Never Miss a Coupon Again
          </Text>
          <Text className="text-xl font-medium text-center text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            AI-powered coupon discovery for Target, Walmart, CVS, and 100+ stores. Save hundreds every month.
          </Text>
          <View className="flex-row gap-4 mb-16">
            <Button size="lg" className="bg-[#4F46E5] px-8 rounded-full" onPress={() => router.push("/signup")}>
              <Text className="text-white font-bold">Start Saving Free</Text>
            </Button>
            <Button size="lg" variant="outline" className="px-8 rounded-full">
              <Text>See How It Works</Text>
            </Button>
          </View>
          
          <View className="w-full max-w-4xl rounded-3xl border border-border shadow-2xl bg-muted overflow-hidden">
            <View className="aspect-video items-center justify-center bg-muted">
              <View className="w-64 h-full bg-card border-x border-border shadow-sm p-4 pt-10">
                 <View className="flex-row justify-between items-center mb-6">
                    <Text className="font-bold">Coupons</Text>
                    <Search className="h-4 w-4 text-muted-foreground" />
                 </View>
                 <View className="gap-3">
                    {["Target", "Walmart", "CVS"].map(s => (
                       <Card key={s} className="p-3 flex-row items-center gap-3">
                          <View className="w-8 h-8 rounded bg-muted items-center justify-center"><Text className="font-bold">{s[0]}</Text></View>
                          <View className="flex-1">
                             <Text className="text-[10px] font-bold">{s}</Text>
                             <Text className="text-[8px] text-[#10B981] font-bold">$10.00 OFF</Text>
                          </View>
                       </Card>
                    ))}
                 </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View className="px-6 py-24 bg-muted/50">
          <View className="items-center mb-16">
            <Text className="text-[#4F46E5] font-bold mb-2">FEATURES</Text>
            <Text variant="h2" className="text-center">Smart Shopping Made Easy</Text>
          </View>

          <View className="flex-row flex-wrap gap-6 justify-center">
            {features.map((f, i) => (
              <Card key={i} className="w-full md:w-[340px] border-none shadow-sm">
                <CardContent className="pt-6">
                  <View className="w-14 h-14 rounded-2xl bg-[#4F46E5]/10 items-center justify-center mb-6">
                    <f.icon className="h-7 w-7 text-[#4F46E5]" />
                  </View>
                  <Text variant="h4" className="mb-3">{f.title}</Text>
                  <Text className="text-muted-foreground leading-relaxed">{f.description}</Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Social Proof */}
        <View className="px-6 py-20 bg-background border-y border-border">
          <View className="items-center mb-16">
             <Text variant="h2" className="mb-4">Join Thousands of Smart Savers</Text>
          </View>
          <View className="flex-row flex-wrap justify-center gap-10 md:gap-20 mb-20">
            {[
              { label: "Active Users", val: "10,000+" },
              { label: "Saved This Year", val: "$2.4M+", color: "text-[#10B981]" },
              { label: "Coupons Found", val: "50,000+" },
              { label: "Rating", val: "4.9★" }
            ].map((s, i) => (
              <View key={i} className="items-center">
                <Text className={`text-4xl font-bold ${s.color || "text-foreground"}`}>{s.val}</Text>
                <Text className="text-muted-foreground font-medium mt-1">{s.label}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap justify-center gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="w-full md:w-[350px] bg-muted/30 border-dashed">
                <CardContent className="pt-6">
                  <View className="flex-row gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-4 w-4 text-orange-400 fill-orange-400" />)}
                  </View>
                  <Text className="italic text-muted-foreground mb-4 leading-relaxed">"{t.text}"</Text>
                  <Text className="font-bold">— {t.name}</Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Pricing Section */}
        <View className="px-6 py-24 bg-muted/50">
          <View className="items-center mb-16">
            <Text className="text-[#4F46E5] font-bold mb-2">PRICING</Text>
            <Text variant="h2" className="text-center">100% FREE Forever</Text>
            <Text className="text-muted-foreground text-center max-w-xl mt-4">
              SmartSaver is built to help everyone save money. No trials, no limits, no catches.
            </Text>
          </View>

          <View className="items-center">
            <Card className="w-full max-w-lg border-2 border-[#4F46E5] bg-background shadow-xl">
              <CardHeader className="items-center pt-8 pb-4">
                <View className="bg-[#10B981]/10 px-4 py-1 rounded-full mb-4">
                  <Text className="text-[#10B981] font-bold text-xs">UNLIMITED ACCESS</Text>
                </View>
                <CardTitle className="text-3xl font-black">Free</CardTitle>
                <Text className="text-muted-foreground">Every feature included</Text>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <View className="gap-4 my-8">
                  {[
                    "Unlimited stores",
                    "AI-powered coupon discovery",
                    "Real-time deal alerts",
                    "Price tracking",
                    "Shared family lists",
                    "No credit card required"
                  ].map((f, i) => (
                    <View key={i} className="flex-row items-center gap-3">
                      <CheckCircle2 size={20} className="text-[#10B981]" />
                      <Text className="font-medium">{f}</Text>
                    </View>
                  ))}
                </View>
                
                <Button className="bg-[#4F46E5] w-full py-6 rounded-full shadow-lg shadow-[#4F46E5]/20" onPress={() => router.push("/signup")}>
                   <Text className="text-white font-bold text-lg">Start Saving Now</Text>
                </Button>

                <View className="mt-8 pt-8 border-t border-border items-center">
                  <Text className="text-sm font-medium text-center mb-4">💚 Like what we do?</Text>
                  <Button variant="outline" className="border-[#10B981] text-[#10B981]" onPress={() => router.push("/donate")}>
                    <Text className="text-[#10B981] font-bold">Support Us with a Donation</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Store Logos Grid */}
        <View className="px-6 py-20 bg-background border-t border-border">
          <View className="items-center mb-12">
            <Text variant="h3" className="text-center">We Find Coupons For These Stores & More</Text>
          </View>
          <View className="flex-row flex-wrap justify-center gap-x-12 gap-y-8">
            {stores.map(s => (
              <Text key={s} className="font-black text-2xl text-muted-foreground/30">{s.toUpperCase()}</Text>
            ))}
            <Text className="font-black text-2xl text-[#4F46E5]/40 italic">...and 100+ more</Text>
          </View>
        </View>

        {/* Final CTA */}
        <View className="px-6 py-24 items-center bg-[#4F46E5]">
          <Text className="text-4xl font-bold text-white text-center mb-4">Ready to Start Saving?</Text>
          <Text className="text-xl text-white/80 text-center mb-10 max-w-xl leading-relaxed">
            Join thousands who save hundreds every month with the power of AI coupon discovery.
          </Text>
          <Button size="lg" className="bg-white px-12 py-6 rounded-full shadow-xl" onPress={() => router.push("/signup")}>
            <Text className="text-[#4F46E5] text-lg font-black">Start Saving Now (100% Free)</Text>
          </Button>
          <Text className="text-white/60 text-xs mt-6 font-medium">No credit card required • No limits • No catches</Text>
        </View>

        {/* Footer */}
        <View className="px-6 py-16 border-t border-border bg-muted/30">
          <View className="flex-row flex-wrap justify-between gap-12">
            <View className="max-w-xs">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="bg-[#4F46E5] p-1 rounded-lg">
                  <Tag className="h-4 w-4 text-white" />
                </View>
                <Text className="font-bold text-lg">SmartSaver</Text>
              </View>
              <Text className="text-muted-foreground text-sm leading-relaxed mb-6">
                AI finds the deals, you keep the cash. The ultimate assistant for smart shoppers.
              </Text>
              <View className="flex-row gap-4">
                <Twitter className="h-5 w-5 text-muted-foreground" />
                <Facebook className="h-5 w-5 text-muted-foreground" />
                <Instagram className="h-5 w-5 text-muted-foreground" />
              </View>
            </View>
            
            <View className="flex-row gap-16">
               <View className="gap-3">
                 <Text className="font-bold text-xs uppercase tracking-widest text-foreground">Support</Text>
                 <Pressable onPress={() => router.push("/privacy")}>
                   <Text className="text-muted-foreground text-sm">Privacy Policy</Text>
                 </Pressable>
                 <Pressable onPress={() => router.push("/terms")}>
                   <Text className="text-muted-foreground text-sm">Terms of Service</Text>
                 </Pressable>
                 <Pressable onPress={() => router.push("/refund")}>
                   <Text className="text-muted-foreground text-sm">Refund Policy</Text>
                 </Pressable>
                 <View className="flex-row items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Text className="text-muted-foreground text-sm">support@smartsaver.app</Text>
                 </View>
               </View>
            </View>
          </View>
          <Text className="text-muted-foreground text-xs mt-16 text-center">
            © 2026 SmartSaver - All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
