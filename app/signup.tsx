import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Input, Button, Card, CardContent, CardHeader, CardTitle, Pressable } from "@/components/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, Link } from "expo-router";
import { Tag, Mail, Lock, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react-native";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!hasMinLength || !hasNumber || !hasUppercase) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn("password", { 
        email, 
        password, 
        flow: "signUp" 
      });
      router.replace("/onboarding");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
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
          <Text variant="h2">Create Account</Text>
          <Text variant="muted">Start saving with SmartSaver AI</Text>
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
              <Text variant="small" className="font-medium">Password</Text>
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

            <View className="gap-1.5">
              <Text variant="small" className="font-medium">Confirm Password</Text>
              <View className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="pl-10"
                />
              </View>
            </View>

            {/* Password Requirements */}
            <View className="bg-muted/50 p-3 rounded-lg gap-2">
              <View className="flex-row items-center gap-2">
                {hasMinLength ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <Circle size={14} className="text-muted-foreground" />}
                <Text variant="small" className={hasMinLength ? "text-[#10B981]" : "text-muted-foreground"}>At least 8 characters</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {hasNumber ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <Circle size={14} className="text-muted-foreground" />}
                <Text variant="small" className={hasNumber ? "text-[#10B981]" : "text-muted-foreground"}>At least one number</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {hasUppercase ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <Circle size={14} className="text-muted-foreground" />}
                <Text variant="small" className={hasUppercase ? "text-[#10B981]" : "text-muted-foreground"}>At least one uppercase letter</Text>
              </View>
            </View>

            {error && (
              <View className="bg-destructive/10 p-3 rounded-lg">
                <Text className="text-destructive text-xs text-center">{error}</Text>
              </View>
            )}

            <Button 
              onPress={handleSignup} 
              disabled={loading}
              className="bg-[#4F46E5] mt-2"
            >
              <Text className="text-white font-bold">{loading ? "Creating Account..." : "Create Account"}</Text>
            </Button>

            <View className="flex-row justify-center mt-2">
              <Text className="text-muted-foreground">Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text className="text-[#4F46E5] font-bold">Log in</Text>
                </Pressable>
              </Link>
            </View>
          </CardContent>
        </Card>

        <View className="mt-8 items-center">
           <Text variant="small" className="text-muted-foreground text-center">
             By creating an account, you agree to our{"\n"}
             <Link href="/terms" className="text-foreground underline">Terms of Service</Link> and <Link href="/privacy" className="text-foreground underline">Privacy Policy</Link>.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
