import React from "react";
import { View } from "react-native";

type SpacerProps = {
  size?: number; // default value optional
};

export default function Spacer({ size = 10 }: SpacerProps) {
  return <View style={{ height: size }} />;
}
