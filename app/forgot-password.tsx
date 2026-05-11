import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Input, Button, Card, CardContent, CardHeader, CardTitle, Pressable } from "@/components/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, Link } from "expo-router";
import { Tag, Mail, ArrowLeft, CheckCircle2 } from "lucide-react-native";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In Convex Auth, password reset is handled via 'reset' flow
      await signIn("password", { email, flow: "reset" });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
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
          <Text variant="h2">Forgot Password</Text>
          <Text variant="muted" className="text-center">Enter your email to receive a password reset link</Text>
        </View>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6 gap-4">
            {!success ? (
              <>
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

                {error && (
                  <View className="bg-destructive/10 p-3 rounded-lg">
                    <Text className="text-destructive text-xs text-center">{error}</Text>
                  </View>
                )}

                <Button 
                  onPress={handleReset} 
                  disabled={loading}
                  className="bg-[#4F46E5] mt-2"
                >
                  <Text className="text-white font-bold">{loading ? "Sending..." : "Send Reset Link"}</Text>
                </Button>
              </>
            ) : (
              <View className="items-center py-4 gap-4">
                <View className="bg-[#10B981]/10 p-3 rounded-full">
                  <CheckCircle2 size={32} className="text-[#10B981]" />
                </View>
                <View>
                  <Text className="text-center font-bold text-lg">Check your email</Text>
                  <Text variant="muted" className="text-center">
                    We've sent a password reset link to{"\n"}
                    <Text className="font-bold text-foreground">{email}</Text>
                  </Text>
                </View>
                <Text variant="small" className="text-muted-foreground text-center">
                  Link expires in 1 hour. If you don't see it, check your spam folder.
                </Text>
              </View>
            )}

            <Link href="/login" asChild>
              <Pressable className="flex-row items-center justify-center gap-2 mt-2">
                <ArrowLeft size={16} className="text-muted-foreground" />
                <Text className="text-muted-foreground font-medium">Back to login</Text>
              </Pressable>
            </Link>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
