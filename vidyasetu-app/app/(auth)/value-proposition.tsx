import { View, Text, Dimensions, StyleSheet, Image } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../constants/theme";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useState } from "react";

const TestDrive = require("../../assets/carousel/test-drive-career.png");
const Target = require("../../assets/carousel/find-your-perfect-path.png");
const BrainCircuit = require("../../assets/carousel/explained-by-ai.png");

const slides = [
  {
    image: Target as any,
    title: "Find Your Perfect Path",
    subtitle:
      "Our advanced quiz combines aptitude and personality to match you with your ideal career.",
  },
  {
    image: BrainCircuit as any,
    title: "Explained by AI",
    subtitle:
      "Get simple, transparent reasons for every career and college recommendation.",
  },
  {
    image: TestDrive as any,
    title: "Test-Drive Your Career",
    subtitle:
      "Our platform is backed by leading career counsellors and educational institutions across India. ",
  },
];

export default function ValueProposition() {
  const theme = useTheme();
  const s = styles(theme);
  const [index, setIndex] = useState(0);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* CAROUSEL */}
      <Carousel
        loop={true}
        autoPlay={true}
        autoPlayInterval={2500}
        width={350}
        height={400}
        data={slides}
        scrollAnimationDuration={800}
        onProgressChange={(_, absoluteProgress) => {
          setIndex(Math.round(absoluteProgress));
        }}
        renderItem={({ item }) => (
          <View style={s.slideContainer}>
            <Image source={item.image} style={s.image} resizeMode="contain" />

            <Text style={[s.title, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[s.subtitle, { color: theme.colors.text + "CC" }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* DOT INDICATORS */}
      <View style={s.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor:
                  i === index
                    ? theme.colors.secondary
                    : theme.colors.secondary + "55",
              },
            ]}
          />
        ))}
      </View>

      {/* GET STARTED BUTTON */}
      <TouchableOpacity
        style={[s.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/(auth)/profile-setup")}
      >
        <Text style={s.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    slideContainer: {
      width: "100%",
      height: 400,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
      textAlign: "center",
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      marginTop: 20,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      marginTop: 10,
      textAlign: "center",
      lineHeight: 22,
    },
    button: {
      width: "100%",
      paddingVertical: 16,
      paddingHorizontal: 100,
      borderRadius: 12,
      marginTop: 40,
      alignItems: "center",
      maxWidth: 350,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      gap: 8,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    image: {
      width: 220,
      height: 220,
      marginBottom: 20,
    },
  });
