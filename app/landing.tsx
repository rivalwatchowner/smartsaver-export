import React from "react";
import { SafeAreaView, ScrollView, View, Text, Button, Card, CardContent, CardHeader, CardTitle, Badge, Pressable } from "@/components/ui";
import { Sparkles, Smartphone, ShieldCheck, TrendingDown, Layers, Globe, Check, Facebook, Twitter, Instagram, Github } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function LandingPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-20">
        {/* Navigation Bar */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-background/80 border-b border-border">
          <View className="flex-row items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <Text className="font-bold text-xl tracking-tight">SmartSaver</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <Pressable className="hidden md:flex">
              <Text className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Text>
            </Pressable>
            <Pressable className="hidden md:flex">
              <Text className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</Text>
            </Pressable>
            <Button size="sm" onPress={() => router.push("/")}>
              <Text>Open App</Text>
            </Button>
          </View>
        </View>

        {/* Hero Section */}
        <View className="px-6 py-20 items-center text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1 border-primary/30 bg-primary/5">
            <Text className="text-primary font-medium">New: AI-Powered Coupon Hunting</Text>
          </Badge>
          <Text className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-3xl leading-tight">
            Never Miss a Coupon Again
          </Text>
          <Text variant="large" className="text-muted-foreground text-center mb-10 max-w-2xl">
            Our AI finds every deal, member perk, and secret discount automatically so you always pay the lowest price possible.
          </Text>
          <View className="flex-row gap-4">
            <Button size="lg" className="px-8 shadow-lg shadow-primary/20" onPress={() => router.push("/")}>
              <Text>Get Started Free</Text>
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              <Text>Watch Demo</Text>
            </Button>
          </View>
          <View className="mt-16 w-full max-w-4xl rounded-2xl overflow-hidden border border-border shadow-2xl">
             <View className="bg-muted aspect-video items-center justify-center">
                <Smartphone className="h-20 w-20 text-muted-foreground/30" />
                <Text className="text-muted-foreground font-medium mt-4">App Preview Interface</Text>
             </View>
          </View>
        </View>

        {/* Features Section */}
        <View className="px-6 py-20 bg-muted/30">
          <View className="items-center mb-16">
            <Text variant="h2" className="mb-4">Why SmartSaver?</Text>
            <Text className="text-muted-foreground text-center max-w-xl">
              We built the ultimate tool for couponers who want to save time and money without the endless searching.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-6 justify-center">
            {[
              { title: "AI-Powered", desc: "Our AI agents scan thousands of stores in real-time to find hidden coupons.", icon: Sparkles },
              { title: "Saves Money", desc: "Users save an average of $120 per month on groceries and household items.", icon: TrendingDown },
              { title: "Member Perks", desc: "Automatically tracks Target Circle, Walmart+, and more to stack discounts.", icon: ShieldCheck },
              { title: "Mobile-First", desc: "Coupons at your fingertips. Scan at the register directly from your phone.", icon: Smartphone },
            ].map((f, i) => (
              <Card key={i} className="w-full md:w-72 border-none bg-background shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </View>
                  <Text variant="h4" className="mb-2">{f.title}</Text>
                  <Text className="text-muted-foreground text-sm leading-relaxed">{f.desc}</Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Pricing Section */}
        <View className="px-6 py-20">
          <View className="items-center mb-16">
            <Text variant="h2" className="mb-4">Simple, Transparent Pricing</Text>
            <Text className="text-muted-foreground text-center max-w-xl">
              Choose the plan that fits your shopping habits. All paid plans include a 7-day free trial.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-6 justify-center">
            {[
              { name: "Free", price: "$0", desc: "Perfect for casual shoppers", features: ["Up to 3 stores", "Daily AI deals", "Basic perks"], color: "border-border" },
              { name: "Basic", price: "$2.99", desc: "Great for regular grocery runs", features: ["Up to 10 stores", "Real-time pricing", "Priority support"], color: "border-primary/20 bg-primary/5", popular: true },
              { name: "Premium", price: "$4.99", desc: "For the ultimate couponer", features: ["Unlimited stores", "Advanced AI analytics", "Early access"], color: "border-border" },
              { name: "Family", price: "$7.99", desc: "Share savings with the whole team", features: ["Unlimited stores", "5 user seats", "Shared savings pool"], color: "border-border" },
            ].map((p, i) => (
              <Card key={i} className={`w-full md:w-64 flex-1 min-w-[250px] ${p.color} ${p.popular ? 'border-primary' : ''}`}>
                <CardHeader>
                  {p.popular && <Badge className="w-fit mb-2"><Text>Most Popular</Text></Badge>}
                  <CardTitle>{p.name}</CardTitle>
                  <Text className="text-muted-foreground text-sm">{p.desc}</Text>
                </CardHeader>
                <CardContent>
                  <Text className="text-4xl font-bold mb-6">{p.price}<Text className="text-lg font-normal text-muted-foreground">/mo</Text></Text>
                  <View className="gap-3 mb-8">
                    {p.features.map((f, j) => (
                      <View key={j} className="flex-row items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <Text className="text-sm">{f}</Text>
                      </View>
                    ))}
                  </View>
                  <Button variant={p.popular ? "default" : "outline"} className="w-full">
                    <Text>Get Started</Text>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View className="px-6 py-20 bg-primary items-center rounded-3xl mx-6">
          <Text className="text-3xl font-bold text-primary-foreground mb-4 text-center">Ready to start saving?</Text>
          <Text className="text-primary-foreground/80 mb-8 text-center max-w-lg">
            Join 10,000+ shoppers who are saving more than ever with SmartSaver AI.
          </Text>
          <Button size="lg" className="bg-background hover:bg-muted px-10">
            <Text className="text-primary font-bold">Download the App</Text>
          </Button>
        </View>

        {/* Footer */}
        <View className="px-6 py-12 mt-20 border-t border-border">
          <View className="flex-row flex-wrap justify-between gap-10">
            <View className="max-w-xs">
              <View className="flex-row items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <Text className="font-bold text-lg">SmartSaver</Text>
              </View>
              <Text className="text-muted-foreground text-sm">
                The smart AI-powered assistant that finds coupons and stacks discounts automatically.
              </Text>
            </View>
            
            <View className="flex-row gap-20">
              <View className="gap-4">
                <Text className="font-semibold text-sm">Product</Text>
                <Text className="text-muted-foreground text-sm">Features</Text>
                <Text className="text-muted-foreground text-sm">Pricing</Text>
                <Text className="text-muted-foreground text-sm">Stores</Text>
              </View>
              <View className="gap-4">
                <Text className="font-semibold text-sm">Company</Text>
                <Text className="text-muted-foreground text-sm">Privacy Policy</Text>
                <Text className="text-muted-foreground text-sm">Terms of Service</Text>
                <Text className="text-muted-foreground text-sm">Contact</Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <Button variant="ghost" size="icon"><Twitter className="h-5 w-5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon"><Facebook className="h-5 w-5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon"><Instagram className="h-5 w-5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon"><Github className="h-5 w-5 text-muted-foreground" /></Button>
            </View>
          </View>
          <Text className="text-center text-muted-foreground text-xs mt-12">
            © 2026 SmartSaver - All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
