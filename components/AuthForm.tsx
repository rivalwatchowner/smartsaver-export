import React, { useState } from "react";
import { View, Text, Button, Input, Card, CardContent, CardHeader, CardTitle, Spinner } from "@/components/ui";
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, Key } from "lucide-react-native";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"email" | { email: string }>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      await signIn("resend-otp", { email });
      setStep({ email });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (code: string) => {
    if (step === "email") return;
    setLoading(true);
    setError("");
    try {
      await signIn("resend-otp", { email: step.email, code });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <Text variant="muted">Enter your email to receive a login code.</Text>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
            <Input
              placeholder="email@example.com"
              keyboardType="email-address"
              className="pl-10"
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={() => handleEmailSubmit(email)}
            />
          </View>
          {error && <Text className="text-destructive text-sm">{error}</Text>}
          <Button onPress={() => handleEmailSubmit(email)} disabled={loading}>
            {loading ? <Spinner size="small" /> : "Send Code"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
        <Text variant="muted">We sent a code to {step.email}</Text>
      </CardHeader>
      <CardContent className="gap-4">
        <View className="relative">
          <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
          <Input
            placeholder="123456"
            keyboardType="number-pad"
            className="pl-10"
            value={code}
            onChangeText={setCode}
            onSubmitEditing={() => handleCodeSubmit(code)}
          />
        </View>
        {error && <Text className="text-destructive text-sm">{error}</Text>}
        <Button onPress={() => handleCodeSubmit(code)} disabled={loading}>
          {loading ? <Spinner size="small" /> : "Verify & Sign In"}
        </Button>
        <Button variant="ghost" onPress={() => setStep("email")}>
          Back to Email
        </Button>
      </CardContent>
    </Card>
  );
}
