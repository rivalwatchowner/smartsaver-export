import React from "react";
import { View, Text, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { X, Info } from "lucide-react-native";
import { Pressable } from "react-native";

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponTitle: string;
  barcodeValue: string;
  barcodeFormat: string;
}

export function BarcodeModal({ isOpen, onClose, couponTitle, barcodeValue, barcodeFormat }: BarcodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none rounded-3xl">
        <DialogHeader className="p-6 bg-[#4F46E5] flex-row justify-between items-center">
          <View>
            <DialogTitle className="text-white text-xl">{couponTitle}</DialogTitle>
            <Text className="text-white/80 text-xs">Scan at register</Text>
          </View>
          <Pressable onPress={onClose} className="bg-white/10 p-2 rounded-full">
            <X size={20} className="text-white" />
          </Pressable>
        </DialogHeader>

        <View className="p-8 items-center bg-white">
          <View className="bg-muted w-full aspect-[2/1] rounded-2xl items-center justify-center border-2 border-dashed border-border mb-6">
            {/* 
               In a real production app with JSBarcode, we would render the SVG here.
               Since we are in a hybrid environment, we'll show a high-fidelity mock
               that includes the barcode value.
            */}
            <View className="items-center">
               <View className="flex-row gap-1 mb-2">
                 {[...Array(40)].map((_, i) => (
                   <View 
                     key={i} 
                     className="bg-black" 
                     style={{ 
                       width: Math.random() > 0.5 ? 2 : 1, 
                       height: 60,
                       opacity: Math.random() > 0.1 ? 1 : 0
                     }} 
                   />
                 ))}
               </View>
               <Text className="font-mono text-lg tracking-[0.5em] font-bold">{barcodeValue}</Text>
               <Text variant="small" className="text-muted-foreground mt-1 uppercase">{barcodeFormat}</Text>
            </View>
          </View>

          <View className="bg-[#10B981]/10 p-4 rounded-2xl flex-row items-start gap-3 w-full">
             <Info size={18} className="text-[#10B981] mt-0.5" />
             <View className="flex-1">
                <Text className="text-[#10B981] font-bold text-sm">Scanning Tips:</Text>
                <Text className="text-[#10B981]/80 text-xs leading-relaxed">
                  • Turn up your phone brightness{"\n"}
                  • Hold the phone steady{"\n"}
                  • Ensure the screen is clean
                </Text>
             </View>
          </View>
        </View>

        <View className="px-6 pb-8 bg-white">
          <Button className="w-full bg-[#4F46E5] py-4 rounded-2xl" onPress={onClose}>
             <Text className="text-white font-bold">Done</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
