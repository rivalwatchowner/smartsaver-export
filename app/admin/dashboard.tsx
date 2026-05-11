import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, Card, CardContent, CardHeader, CardTitle, Spinner, Button, Pressable } from "@/components/ui";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { BarChart3, Users, DollarSign, ArrowUpRight, ArrowDownRight, Settings, Download, Search, TrendingDown } from "lucide-react-native";

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useQuery(api.admin.isAdmin);
  const stats = useQuery(api.admin.getDashboardStats);
  const customers = useQuery(api.admin.getCustomers, { limit: 10 });

  useEffect(() => {
    if (isAdmin === false) {
      router.replace("/");
    }
  }, [isAdmin]);

  if (isAdmin === undefined || stats === undefined || customers === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-6 py-4 border-b border-border flex-row justify-between items-center">
        <View>
          <Text variant="h2">Admin Dashboard</Text>
          <Text variant="muted">Overview of SmartSaver performance</Text>
        </View>
        <Button variant="outline" size="sm" className="flex-row gap-2">
          <Download className="h-4 w-4 text-foreground" />
          <Text>Export CSV</Text>
        </Button>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          <Card className="flex-1 min-w-[160px]">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Text variant="h3">${stats.totalRevenue.toLocaleString()}</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-muted-foreground">All-time lifetime value</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[160px]">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Text variant="h3">${stats.mrr.toLocaleString()}</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-muted-foreground">Total support in current month</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[160px]">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Text variant="h3">{stats.totalDonors}</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-muted-foreground">Unique users who supported</Text>
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[160px]">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Donation</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground transform rotate-180" />
            </CardHeader>
            <CardContent>
              <Text variant="h3">${(stats.averageDonation).toFixed(2)}</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-muted-foreground">Per unique donor</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Recent Customers Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text variant="h3">Recent Customers</Text>
            <Button variant="ghost" size="sm">
              <Text>View all</Text>
            </Button>
          </View>
          
          <Card>
            <CardContent className="p-0">
              {customers?.map((customer, i) => (
                <View key={customer._id} className={`p-4 flex-row items-center justify-between ${i !== customers.length - 1 ? 'border-b border-border' : ''}`}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-muted rounded-full items-center justify-center">
                      <Text className="font-bold">{customer.name?.[0] || customer.email?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text className="font-medium">{customer.name || 'Anonymous User'}</Text>
                      <Text variant="small" className="text-muted-foreground">{customer.email}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-medium capitalize">{customer.plan || 'free'}</Text>
                    <Text variant="small" className="text-muted-foreground">Joined {new Date(customer._creationTime).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        </View>

        {/* Config & Support Section */}
        <View className="flex-row gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Merchant Configuration</CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
              <View className="flex-row justify-between py-2 border-b border-border">
                <Text variant="small">Lemon Squeezy Store ID</Text>
                <Text variant="code">{process.env.LEMON_SQUEEZY_STORE_ID || 'Not set'}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-border">
                <Text variant="small">Webhook Status</Text>
                <Text className="text-primary text-xs font-bold">ACTIVE</Text>
              </View>
              <Button variant="outline" className="mt-2">
                <Settings className="h-4 w-4 mr-2 text-foreground" />
                <Text>Update Config</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
