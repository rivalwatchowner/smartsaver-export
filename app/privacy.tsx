import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#4F46E5" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Privacy Policy</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-1">PRIVACY POLICY</Text>
        <Text className="text-sm text-gray-500 mb-6">Last updated May 10, 2026</Text>

        {/* Intro */}
        <Text className="text-sm text-gray-700 leading-6 mb-4">
          This Privacy Notice for SmartSaver ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
        </Text>

        <View className="ml-4 mb-4">
          <Text className="text-sm text-gray-700 leading-6 mb-2">• Visit our website at usesmartsaver.com or any website of ours that links to this Privacy Notice</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• Download and use our mobile application (Smart Saver), or any other application of ours that links to this Privacy Notice</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• Use Smart Saver. SmartSaver is a free mobile and web application that helps users save money by finding coupons, tracking loyalty rewards, and optimizing credit card usage at over 230 retailers including grocery stores, gas stations, restaurants, and retail shops.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• Engage with us in other related ways, including any marketing or events</Text>
        </View>

        <Text className="text-sm text-gray-700 leading-6 mb-6">
          <Text className="font-bold">Questions or concerns? </Text>Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at usesmartsaver@gmail.com.
        </Text>

        {/* Summary */}
        <Text className="text-xl font-bold text-gray-900 mb-3">SUMMARY OF KEY POINTS</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-4 italic">
          This summary provides key points from our Privacy Notice. You can find more details about any of these topics below.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">What personal information do we process? </Text>
          When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Do we process any sensitive personal information? </Text>
          We do not process sensitive personal information.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Do we collect any information from third parties? </Text>
          We do not collect any information from third parties.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">How do we process your information? </Text>
          We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">In what situations and with which parties do we share personal information? </Text>
          We may share information in specific situations and with specific third parties.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">How do we keep your information safe? </Text>
          We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">What are your rights? </Text>
          Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.
        </Text>

        <Text className="text-sm text-gray-700 leading-6 mb-6">
          <Text className="font-bold">How do you exercise your rights? </Text>
          The easiest way to exercise your rights is by visiting usesmartsaver.com/settings, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
        </Text>

        {/* Section 1 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">1. WHAT INFORMATION DO WE COLLECT?</Text>
        <Text className="text-base font-semibold text-gray-900 mb-2">Personal information you disclose to us</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We collect personal information that you provide to us.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Personal Information Provided by You.</Text> The personal information we collect may include the following:
        </Text>
        <View className="ml-4 mb-3">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• names</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• email addresses</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• usernames</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• passwords</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• loyalty program member ids (optional)</Text>
        </View>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Sensitive Information. </Text>We do not process sensitive information.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Payment Data. </Text>We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number and security code. All payment data is handled and stored by Lemon Squeezy, PayPal and Venmo. Their privacy notices: lemonsqueezy.com/privacy and paypal.com/us/legalhub/privacy-full.
        </Text>

        <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Application Data</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold italic">Mobile Device Data. </Text>We automatically collect device information (such as your mobile device ID, model, and manufacturer), operating system, version information and system configuration information, device and application identification numbers, browser type and version, hardware model, Internet service provider and/or mobile carrier, and Internet Protocol (IP) address.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold italic">Push Notifications. </Text>We may request to send you push notifications regarding your account or certain features of the application(s). If you wish to opt out, you may turn them off in your device's settings.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes.
        </Text>

        <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Information automatically collected</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>Some information — such as your IP address and/or browser and device characteristics — is collected automatically when you visit our Services.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and other technical information.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          The information we collect includes:
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold italic">Log and Usage Data. </Text>Service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          <Text className="font-bold italic">Device Data. </Text>Information about your computer, phone, tablet, or other device you use to access the Services.
        </Text>

        {/* Section 2 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">2. HOW DO WE PROCESS YOUR INFORMATION?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">We process your personal information for a variety of reasons, including:</Text>
        </Text>
        <View className="ml-4 mb-6">
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To facilitate account creation and authentication</Text> and otherwise manage user accounts.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To deliver and facilitate delivery of services</Text> to the user.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To respond to user inquiries/offer support</Text> to users.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To send administrative information</Text> to you.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To request feedback.</Text></Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To protect our Services,</Text> including fraud monitoring and prevention.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To identify usage trends.</Text></Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">To save or protect an individual's vital interest.</Text></Text>
        </View>

        {/* Section 3 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">3. WHAT LEGAL BASES DO WE RELY ON?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We only process your personal information when we believe it is necessary and we have a valid legal reason under applicable law.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 font-bold italic">
          If you are located in the EU or UK:
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          The GDPR and UK GDPR require us to explain the valid legal bases we rely on. We may rely on:
        </Text>
        <View className="ml-4 mb-3">
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">Consent.</Text> When you give us permission for a specific purpose.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">Performance of a Contract.</Text> To fulfill our contractual obligations.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">Legitimate Interests.</Text> To analyze how our Services are used, diagnose problems, prevent fraud, and improve user experience.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">Legal Obligations.</Text> To comply with our legal obligations.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">• <Text className="font-bold">Vital Interests.</Text> To protect your vital interests or those of a third party.</Text>
        </View>
        <Text className="text-sm text-gray-700 leading-6 mb-6 font-bold italic">
          If you are located in Canada, we may process your information with your express or implied consent.
        </Text>

        {/* Section 4 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We may share information in specific situations described in this section and/or with the following third parties.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Vendors, Consultants, and Other Third-Party Service Providers.</Text> We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us. We have contracts with our third parties designed to safeguard your personal information.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          The third parties we may share personal information with are as follows:
        </Text>
        <View className="ml-4 mb-3">
          <Text className="text-sm text-gray-700 leading-6 mb-1"><Text className="font-bold">Cloud Computing Services:</Text> Convex</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1"><Text className="font-bold">Invoice and Billing:</Text> Lemon Squeezy, PayPal and Venmo</Text>
        </View>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          <Text className="font-bold">Business Transfers.</Text> We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition.
        </Text>

        {/* Section 5 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We may use cookies and other tracking technologies to collect and store your information.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising.
        </Text>

        {/* Section 6 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          As part of our Services, we offer products, features, or tools powered by AI ("AI Products"). The terms in this Privacy Notice govern your use of the AI Products.
        </Text>
        <Text className="text-base font-semibold text-gray-900 mb-2 mt-2">Use of AI Technologies</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          We provide the AI Products through third-party service providers, including OpenAI. Your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products.
        </Text>
        <Text className="text-base font-semibold text-gray-900 mb-2">Our AI Products</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          Our AI Products are designed for:
        </Text>
        <View className="ml-4 mb-3">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Coupon discovery and aggregation</Text>
        </View>
        <Text className="text-base font-semibold text-gray-900 mb-2">How We Process Your Data Using AI</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties.
        </Text>

        {/* Section 7 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">7. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We may transfer, store, and process your information in countries other than your own.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          Our servers are located in the United States. Regardless of your location, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of third parties.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          If you are a resident in the EEA, UK, or Switzerland, then these countries may not necessarily have data protection laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information.
        </Text>

        {/* Section 8 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">8. HOW LONG DO WE KEEP YOUR INFORMATION?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law. No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
        </Text>

        {/* Section 9 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">9. HOW DO WE KEEP YOUR INFORMATION SAFE?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We aim to protect your personal information through a system of organizational and technical security measures.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, no electronic transmission over the Internet can be guaranteed to be 100% secure.
        </Text>

        {/* Section 10 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">10. DO WE COLLECT INFORMATION FROM MINORS?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>We do not knowingly collect data from or market to children under 18 years of age.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          We do not knowingly collect, solicit data from, or market to children under 18. By using the Services, you represent that you are at least 18 or are the parent or guardian of such a minor. If you become aware of any data we may have collected from children under 18, please contact us at privacy@usesmartsaver.com.
        </Text>

        {/* Section 11 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">11. WHAT ARE YOUR PRIVACY RIGHTS?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>Depending on your location, you may have rights that allow you greater access to and control over your personal information.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right to: (i) request access and obtain a copy of your personal information, (ii) request rectification or erasure, (iii) restrict the processing of your personal information, (iv) data portability, and (v) not be subject to automated decision-making.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          <Text className="font-bold">Withdrawing your consent:</Text> If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time.
        </Text>
        <Text className="text-base font-semibold text-gray-900 mb-2">Account Information</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          If you would at any time like to review or change the information in your account or terminate your account, you can:
        </Text>
        <View className="ml-4 mb-3">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Log in to your account settings and update your user account.</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• Contact us using the contact information provided.</Text>
        </View>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          If you have questions or comments about your privacy rights, you may email us at usesmartsaver@gmail.com.
        </Text>

        {/* Section 12 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">12. CONTROLS FOR DO-NOT-TRACK FEATURES</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          Most web browsers and some mobile operating systems include a Do-Not-Track ("DNT") feature. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals.
        </Text>

        {/* Section 13 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have specific rights regarding your personal information.
        </Text>
        <Text className="text-base font-semibold text-gray-900 mb-2">Your Rights</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          You have rights under certain US state data protection laws. These include:
        </Text>
        <View className="ml-4 mb-3">
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to know</Text> whether or not we are processing your personal data</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to access</Text> your personal data</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to correct</Text> inaccuracies in your personal data</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to request</Text> the deletion of your personal data</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to obtain a copy</Text> of the personal data you previously shared with us</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to non-discrimination</Text> for exercising your rights</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-1">• <Text className="font-bold">Right to opt out</Text> of the processing of your personal data for targeted advertising, sale, or profiling</Text>
        </View>
        <Text className="text-base font-semibold text-gray-900 mb-2 mt-2">How to Exercise Your Rights</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          To exercise these rights, you can contact us by visiting usesmartsaver.com/settings, emailing us at support@usesmartsaver.com, or by referring to the contact details below.
        </Text>

        {/* Section 14 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">14. DO WE MAKE UPDATES TO THIS NOTICE?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3 italic">
          <Text className="font-bold not-italic">In Short: </Text>Yes, we will update this notice as necessary to stay compliant with relevant laws.
        </Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. We encourage you to review this Privacy Notice frequently.
        </Text>

        {/* Section 15 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-3">
          If you have questions or comments about this notice, you may email us at privacy@usesmartsaver.com or contact us by post at:
        </Text>
        <View className="ml-4 mb-6">
          <Text className="text-sm text-gray-700 leading-6">SmartSaver</Text>
          <Text className="text-sm text-gray-700 leading-6">Waterloo, IA</Text>
          <Text className="text-sm text-gray-700 leading-6">United States</Text>
        </View>

        {/* Section 16 */}
        <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</Text>
        <Text className="text-sm text-gray-700 leading-6 mb-6">
          Based on the applicable laws of your country or state of residence, you may have the right to request access to the personal information we collect, details about how we have processed it, correct inaccuracies, or delete your personal information. To request to review, update, or delete your personal information, please visit: usesmartsaver.com/settings.
        </Text>
      </ScrollView>
    </View>
  );
}
