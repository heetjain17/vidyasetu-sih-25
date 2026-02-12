import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
} from "react-native";
import { useTheme } from "../constants/theme";
import { ChevronDown, ChevronUp } from "lucide-react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type SelectInputProps = {
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
};

export default function SelectInput({
  placeholder,
  value,
  options,
  onSelect,
}: SelectInputProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const s = styles(theme);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Keyboard.dismiss();
    setOpen(!open);
  };

  return (
    <View style={s.wrapper}>
      {/* Select Box */}
      <Pressable style={s.inputBox} onPress={toggle}>
        <Text
          style={[
            s.placeholderText,
            { color: value ? theme.colors.text : theme.colors.textSecondary },
          ]}
        >
          {value ? value : placeholder}
        </Text>

        {open ? (
          <ChevronUp size={20} color={theme.colors.text} />
        ) : (
          <ChevronDown size={20} color={theme.colors.text} />
        )}
      </Pressable>

      {/* Dropdown */}
      {open && (
        <View style={s.dropdown}>
          {options.map((item, index) => (
            <Pressable
              key={index}
              style={s.option}
              onPress={() => {
                onSelect(item);
                toggle();
              }}
            >
              <Text style={s.optionText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 20,
      width: "100%",
    },
    inputBox: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.inputBackground,
    },
    placeholderText: {
      fontSize: 16,
    },
    dropdown: {
      marginTop: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      backgroundColor: theme.colors.inputBackground,
      overflow: "hidden",
    },
    option: {
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text,
    },
  });
