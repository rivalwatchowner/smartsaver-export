import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Input, Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Pressable } from "@/components/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, Link } from "expo-router";
import { Tag, Mail, Lock, Eye, EyeOff } from "lucide-react-native";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn("password", { 
        email, 
        password, 
        flow: "signIn" 
      });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-6 justify-center min-h-full">
        <View className="items-center mb-8">
          <View className="bg-[#4F46E5] p-2 rounded-xl mb-4">
            <Tag className="h-8 w-8 text-white" />
          </View>
          <Text variant="h2">Welcome Back</Text>
          <Text variant="muted">Sign in to access your coupons</Text>
        </View>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6 gap-4">
            <View className="gap-1.5">
              <Text variant="small" className="font-medium">Email</Text>
              <View className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  className="pl-10"
                />
              </View>
            </View>

            <View className="gap-1.5">
              <View className="flex-row justify-between items-center">
                <Text variant="small" className="font-medium">Password</Text>
                <Link href="/forgot-password" asChild>
                  <Pressable>
                    <Text variant="small" className="text-[#4F46E5] font-medium">Forgot password?</Text>
                  </Pressable>
                </Link>
              </View>
              <View className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="pl-10 pr-10"
                />
                <Pressable 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 z-10"
                >
                  {showPassword ? <EyeOff size={20} className="text-muted-foreground" /> : <Eye size={20} className="text-muted-foreground" />}
                </Pressable>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
              <Text variant="small">Remember me</Text>
            </View>

            {error && (
              <View className="bg-destructive/10 p-3 rounded-lg">
                <Text className="text-destructive text-xs text-center">{error}</Text>
              </View>
            )}

            <Button 
              onPress={handleLogin} 
              disabled={loading}
              className="bg-[#4F46E5] mt-2"
            >
              <Text className="text-white font-bold">{loading ? "Logging in..." : "Log In"}</Text>
            </Button>

            {/* Social Logins */}
            <View className="flex-row items-center gap-4 my-2">
              <View className="flex-1 h-[1px] bg-border" />
              <Text variant="small" className="text-muted-foreground">OR</Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>

            <Button variant="outline" className="w-full">
               <Text>Continue with Google</Text>
            </Button>

            <View className="flex-row justify-center mt-4">
              <Text className="text-muted-foreground">Don't have an account? </Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text className="text-[#4F46E5] font-bold">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
