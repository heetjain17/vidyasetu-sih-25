import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useTheme } from "../../constants/theme";
import { router } from "expo-router";
import { login, register } from "@/services/authService";
import { UserRole } from "@/store/auth";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react-native";

export default function Login() {
  const theme = useTheme();
  const s = styles(theme);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, role, name);
      }

      if (result.success) {
        router.replace("/(auth)/value-proposition");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={s.subtitle}>
            {isLogin
              ? "Sign in to continue your journey"
              : "Start your career guidance journey"}
          </Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          {/* Name Input (Register only) */}
          {!isLogin && (
            <View style={s.inputContainer}>
              <User size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={s.input}
                placeholder="Full Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Email Input */}
          <View style={s.inputContainer}>
            <Mail size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={s.inputContainer}>
            <Lock size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.textSecondary} />
              ) : (
                <Eye size={20} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Role Selection (Register only) */}
          {!isLogin && (
            <View style={s.roleContainer}>
              <Text style={s.roleLabel}>I am a:</Text>
              <View style={s.roleButtons}>
                {(["STUDENT", "PARENT"] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[s.roleButton, role === r && s.roleButtonActive]}
                    onPress={() => setRole(r)}
                  >
                    <User
                      size={16}
                      color={role === r ? "#fff" : theme.colors.text}
                    />
                    <Text style={[s.roleText, role === r && s.roleTextActive]}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Error Message */}
          {error ? <Text style={s.errorText}>{error}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.buttonText}>
                {isLogin ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Register */}
          <TouchableOpacity
            style={s.toggleButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            <Text style={s.toggleText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Skip for now (development) */}
          {/* <TouchableOpacity
            style={s.skipButton}
            onPress={() => router.replace("/(auth)/value-proposition")}
          >
            <Text style={s.skipText}>Skip for now →</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 40,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    roleContainer: {
      marginTop: 8,
    },
    roleLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    roleButtons: {
      flexDirection: "row",
      gap: 12,
    },
    roleButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
    },
    roleButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    roleText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    roleTextActive: {
      color: "#fff",
    },
    errorText: {
      color: "#ef4444",
      fontSize: 14,
      textAlign: "center",
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
    toggleButton: {
      alignItems: "center",
      paddingVertical: 12,
    },
    toggleText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    skipButton: {
      alignItems: "center",
      paddingVertical: 8,
    },
    skipText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
  });
