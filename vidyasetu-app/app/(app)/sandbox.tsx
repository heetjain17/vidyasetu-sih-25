import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Send, Bot, User } from "lucide-react-native";
import { useChatStore, Message } from "@/store/chatStore";
import { useTheme } from "@/constants/theme";

export default function Sandbox() {
  const { messages, isLoading, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const theme = useTheme();
  const styles = makeStyles(theme);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    await sendMessage(text);
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Helper function to render formatted text (handles markdown-like formatting)
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim() !== ""); // Remove empty lines

    return lines.map((line, index) => {
      // Handle bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);

      return (
        <Text key={index} style={styles.messageText}>
          {parts.map((part, i) => {
            // Check if it's bold
            if (part.startsWith("**") && part.endsWith("**")) {
              const boldText = part.slice(2, -2);
              return (
                <Text key={i} style={styles.boldText}>
                  {boldText}
                </Text>
              );
            }
            // Check for bullet points
            if (part.startsWith("• ") || part.startsWith("- ")) {
              return (
                <Text key={i} style={styles.bulletText}>
                  {"  " + part}
                </Text>
              );
            }
            // Regular text
            return part;
          })}
          {index < lines.length - 1 && "\n"}
        </Text>
      );
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Bot size={20} color={theme.colors.text} />
          </View>
        )}
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          <View>{renderFormattedText(item.text)}</View>
        </View>
        {isUser && (
          <View style={[styles.avatarContainer, styles.userAvatar]}>
            <User size={20} color={theme.colors.text} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Sandbox",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text },
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about colleges..."
              placeholderTextColor={theme.colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: 16,
      paddingBottom: 20,
    },
    messageContainer: {
      flexDirection: "row",
      marginBottom: 16,
      alignItems: "flex-end",
    },
    userMessageContainer: {
      justifyContent: "flex-end",
    },
    botMessageContainer: {
      justifyContent: "flex-start",
    },
    avatarContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    userAvatar: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    bubble: {
      maxWidth: "75%",
      padding: 12,
      borderRadius: 20,
      ...theme.shadow.light,
    },
    userBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    userText: {
      color: theme.colors.text,
    },
    botText: {
      color: theme.colors.text,
    },
    boldText: {
      fontWeight: "bold",
      fontSize: 15,
      lineHeight: 20,
    },
    bulletText: {
      fontSize: 15,
      lineHeight: 20,
      marginLeft: 8,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 56,
      marginBottom: 16,
    },
    loadingText: {
      marginLeft: 8,
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    inputWrapper: {
      backgroundColor: theme.colors.background,
      padding: 10,
      paddingBottom: Platform.OS === "ios" ? 10 : 16,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.search, // Using search color for input background
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      maxHeight: 100,
      paddingVertical: 4,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
  });
