import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Button,
} from "@/components/ui";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-background">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="mr-1">
          <ChevronLeft size={24} className="text-[#4F46E5]" />
        </Button>
        <Text className="text-lg font-bold text-foreground">Terms of Service</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerClassName="pb-10"
      >
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-1">SMARTSAVER TERMS OF SERVICE</Text>
        <Text className="text-sm text-gray-500 mb-6">Last Updated: May 10, 2026</Text>

        {/* Section 1 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">1. ACCEPTANCE OF TERMS</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          By accessing or using SmartSaver ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
        </Text>

        {/* Section 2 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">2. DESCRIPTION OF SERVICE</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          SmartSaver is a free mobile and web application that helps users save money by finding coupons, tracking loyalty rewards, and optimizing credit card usage at 230+ retailers.
        </Text>

        {/* Section 3 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">3. FREE SERVICE</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          SmartSaver is 100% FREE. No subscriptions, no hidden fees. Optional donations support development but are never required.
        </Text>

        {/* Section 4 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">4. ELIGIBILITY</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          You must be 18 years or older to use SmartSaver. By using the App, you confirm you meet this requirement.
        </Text>

        {/* Section 5 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">5. USER ACCOUNTS</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You must provide accurate information when creating your account</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You are responsible for maintaining account security</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You may not share your account with others</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You can delete your account anytime in Settings</Text>
        </View>

        {/* Section 6 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">6. COUPON USAGE</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Coupons are subject to availability and retailer policies</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Some coupons may not be valid in all states</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We aggregate publicly available coupon information</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We do not control store policies or coupon acceptance</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Verify coupon validity before use</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Expiration dates are set by retailers, not SmartSaver</Text>
        </View>

        {/* Section 7 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">7. LOYALTY PROGRAM INTEGRATION</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Linking store loyalty accounts is optional</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You provide loyalty information at your own risk</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• SmartSaver is not affiliated with any loyalty programs</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We are not responsible for changes to loyalty programs</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You may unlink accounts anytime</Text>
        </View>

        {/* Section 8 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">8. CREDIT CARD RECOMMENDATIONS</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Recommendations are informational only</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Based on publicly available rewards rates</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We do not issue credit cards</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We receive no compensation for recommendations</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Verify all information with your card issuer</Text>
        </View>

        {/* Section 9 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">9. PROHIBITED CONDUCT</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-2">You agree NOT to:</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Use automated systems (bots, scrapers)</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Attempt unauthorized access</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Misuse or abuse the service</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Violate any laws</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Impersonate others</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Interfere with app functionality</Text>
        </View>

        {/* Section 10 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">10. THIRD-PARTY CONTENT</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• SmartSaver links to third-party websites and stores</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We are not responsible for third-party content or policies</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Store policies are controlled by retailers</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Use third-party sites at your own risk</Text>
        </View>

        {/* Section 11 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">11. INTELLECTUAL PROPERTY</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• All app content, design, and functionality are owned by SmartSaver</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You may not copy, modify, or distribute the app</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Store logos are property of their respective owners</Text>
        </View>

        {/* Section 12 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">12. DISCLAIMER OF WARRANTIES</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-2">
          SmartSaver is provided "AS IS" without warranties of any kind including:
        </Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Accuracy of coupon information</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Availability of deals</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Acceptance of coupons by stores</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Uninterrupted service</Text>
        </View>

        {/* Section 13 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">13. LIMITATION OF LIABILITY</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-2">
          To the fullest extent permitted by law, SmartSaver shall not be liable for:
        </Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Any direct, indirect, or consequential damages</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Lost savings or declined coupons</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Retailer policy changes</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Data loss or security breaches</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Any damages exceeding $100 USD</Text>
        </View>

        {/* Section 14 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">14. INDEMNIFICATION</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          You agree to defend and hold SmartSaver harmless from any claims arising from your use of the App or violation of these Terms.
        </Text>

        {/* Section 15 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">15. MODIFICATIONS TO SERVICE</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          We may modify, suspend, or discontinue any feature at any time without notice.
        </Text>

        {/* Section 16 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">16. MODIFICATIONS TO TERMS</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          We may update these Terms from time to time. Changes will be posted with an updated date. Continued use constitutes acceptance.
        </Text>

        {/* Section 17 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">17. TERMINATION</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You may delete your account anytime</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• We may suspend accounts that violate these Terms</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Upon termination, your access ceases</Text>
        </View>

        {/* Section 18 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">18. DISPUTE RESOLUTION</Text>
        <View className="ml-2 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Disputes will first be resolved through informal negotiation</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• If unresolved after 30 days, binding arbitration in Iowa, USA</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• You waive the right to jury trial or class action</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Arbitration fees: we pay if excessive</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Time limit: must bring claims within applicable statute of limitations</Text>
        </View>

        {/* Section 19 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">19. GOVERNING LAW</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          These Terms are governed by the laws of Iowa, United States.
        </Text>

        {/* Section 20 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">20. SEVERABILITY</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          If any provision is unenforceable, the remaining provisions remain in effect.
        </Text>

        {/* Section 21 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">21. ENTIRE AGREEMENT</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          These Terms and our Privacy Policy constitute the entire agreement.
        </Text>

        {/* Section 22 */}
        <Text className="text-lg font-bold text-gray-900 mb-2 mt-2">22. CONTACT</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-1">For questions:</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-1">Email: usesmartsaver@gmail.com</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4">Website: usesmartsaver.com</Text>

        {/* Footer */}
        <View className="bg-indigo-50 rounded-lg p-4 my-4">
          <Text className="text-sm text-gray-700 leading-6 italic text-center">
            By using SmartSaver, you acknowledge you have read, understood, and agree to these Terms of Service.
          </Text>
        </View>

        <Text className="text-sm font-bold text-indigo-600 text-center mt-2">
          SmartSaver - Save money on everything. 100% Free. Forever.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
