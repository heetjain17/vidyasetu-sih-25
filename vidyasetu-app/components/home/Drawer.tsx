import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "../../constants/theme";
import {
  X,
  User,
  MessageSquare,
  Bookmark,
  Info,
  ChevronRight,
} from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export default function Drawer({ visible, onClose }: any) {
  const theme = useTheme();
  const { t } = useTranslation("common");
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Slide animation
  if (visible) {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  } else {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  const menuItems = [
    {
      icon: User,
      label: t("drawer.profileSettings"),
      route: "/(app)/profile",
      color: "#3B82F6",
    },
    {
      icon: MessageSquare,
      label: t("nav.feedback"),
      route: "/(app)/feedback",
      color: "#10B981",
    },
    // {
    //   icon: Bookmark,
    //   label: t("drawer.savedCareers"),
    //   route: "/(app)/career-hub",
    //   color: "#F59E0B",
    // },
    // {
    //   icon: Info,
    //   label: t("drawer.about"),
    //   route: null,
    //   color: "#8B5CF6",
    // },
  ];

  const handleNavigate = (route: string | null) => {
    onClose();
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <Animated.View
      style={[
        styles.drawer,
        {
          backgroundColor: theme.colors.background,
          left: slideAnim,
          paddingTop: 50,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t("drawer.menu")}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              { backgroundColor: theme.colors.container },
            ]}
            onPress={() => handleNavigate(item.route)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <item.icon size={20} color={item.color} />
            </View>
            <Text style={[styles.itemText, { color: theme.colors.text }]}>
              {item.label}
            </Text>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 290,
    padding: 20,
    zIndex: 999,
    elevation: 10,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
  },
  menu: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});
