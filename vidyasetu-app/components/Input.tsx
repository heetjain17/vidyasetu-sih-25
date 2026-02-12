import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../constants/theme";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function Input({
  value,
  onChangeText,
  placeholder,
}: InputProps) {
  const theme = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          borderColor: theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.inputBackground,
        },
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
});
