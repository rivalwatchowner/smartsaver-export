import React, { useState } from "react";
import { View, Text, Input, Button, Label, Spinner } from "@/components/ui";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";

interface LoyaltyLinkFormProps {
  storeId: Id<"stores">;
  storeName: string;
  loyaltyProgramName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LoyaltyLinkForm({
  storeId,
  storeName,
  loyaltyProgramName,
  onSuccess,
  onCancel,
}: LoyaltyLinkFormProps) {
  const [memberId, setMemberId] = useState("");
  const [points, setPoints] = useState("");
  const [cashback, setCashback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const linkAccount = useMutation(api.loyalty.linkAccount);

  const handleSubmit = async () => {
    if (!memberId) {
      setError("Please enter your Member ID or Email.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await linkAccount({
        storeId,
        storeName,
        loyaltyProgramName,
        accountIdentifier: memberId,
        pointsBalance: parseFloat(points) || 0,
        cashbackBalance: parseFloat(cashback) || 0,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError("Failed to link account. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <View className="items-center justify-center py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
        <Text variant="h3" className="text-center">Account Linked!</Text>
        <Text className="text-muted-foreground text-center mt-2">
          Your {loyaltyProgramName} account has been connected.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4 py-4">
      <View>
        <Text variant="h3">Link {loyaltyProgramName}</Text>
        <Text className="text-muted-foreground">
          Enter your {storeName} membership details to track your rewards.
        </Text>
      </View>

      {error && (
        <View className="bg-destructive/10 p-3 rounded-lg flex-row items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <Text className="text-destructive text-sm flex-1">{error}</Text>
        </View>
      )}

      <View className="gap-2">
        <Label nativeID="memberId">Member ID or Email</Label>
        <Input
          placeholder="e.g. 123456789 or sarah@email.com"
          value={memberId}
          onChangeText={setMemberId}
          aria-labelledby="memberId"
        />
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 gap-2">
          <Label nativeID="points">Current Points</Label>
          <Input
            placeholder="0"
            keyboardType="numeric"
            value={points}
            onChangeText={setPoints}
            aria-labelledby="points"
          />
        </View>
        <View className="flex-1 gap-2">
          <Label nativeID="cashback">Cashback ($)</Label>
          <Input
            placeholder="0.00"
            keyboardType="numeric"
            value={cashback}
            onChangeText={setCashback}
            aria-labelledby="cashback"
          />
        </View>
      </View>

      <View className="flex-row gap-3 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text>Cancel</Text>
        </Button>
        <Button
          className="flex-1"
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner size="small" color="white" /> : <Text>Link Account</Text>}
        </Button>
      </View>

      <Text className="text-[10px] text-muted-foreground text-center mt-2">
        We securely store your member ID to track rewards. We never access your account.
      </Text>
    </View>
  );
}
