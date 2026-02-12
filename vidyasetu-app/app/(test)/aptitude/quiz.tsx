import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../constants/theme";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import ProgressBar from "../../../components/ProgressBar";
import { useAptitudeStore } from "@/store/aptitude";
import Spacer from "@/components/Spacer";
import { select10Questions } from "@/services/logic/question.selector";

export default function AptitudeQuiz() {
  const theme = useTheme();
  const s = styles(theme);

  const saveToStore = useAptitudeStore((s) => s.saveAnswer);
  const getAnswer = useAptitudeStore((s) => s.getAnswer);

  // Load 10 questions
  const QUESTIONS = useMemo(() => select10Questions(), []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const q = QUESTIONS[index];

  // Restore previously selected answer when user moves back/forward
  useEffect(() => {
    const saved = getAnswer(index);
    if (saved) setSelected(saved.optionId);
    else setSelected(null);
  }, [index]);

  const handleNext = async () => {
    if (!selected) return;

    const chosen = q.options.find((o) => o.id === selected);
    if (!chosen) return;

    // Save answer including vector
    saveToStore(index, chosen.id, chosen.vector);

    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      router.push("/(test)/aptitude/short-report");
    }
  };

  const progress = (index + 1) / QUESTIONS.length;

  return (
    <View style={{ flex: 1, paddingTop: 40, paddingHorizontal: 10 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => {
              if (index > 0) {
                setIndex(index - 1);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft size={26} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={s.title}>Aptitude Test</Text>

          <View style={{ width: 26 }} />
        </View>

        <Text style={s.counter}>
          Question {index + 1} of {QUESTIONS.length}
        </Text>

        <ProgressBar progress={progress} />
        <Spacer size={30} />

        {/* QUESTION */}
        <Text style={s.question}>{q.text}</Text>
        <Spacer size={20} />

        {/* OPTIONS */}
        {q.options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              s.option,
              selected === opt.id && { borderColor: theme.colors.primary },
            ]}
            onPress={() => setSelected(opt.id)}
          >
            <Text
              style={[
                s.optionText,
                selected === opt.id && { color: theme.colors.primary },
              ]}
            >
              {opt.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* NEXT BUTTON */}
      <View style={s.bottomContainer}>
        <TouchableOpacity
          disabled={!selected}
          onPress={handleNext}
          style={[s.nextBtn, { opacity: selected ? 1 : 0.4 }]}
        >
          <Text style={s.nextText}>
            {index === QUESTIONS.length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// STYLES
const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 30,
      marginTop: 4,
      width: "100%",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    question: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
    },
    option: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      padding: 16,
      marginBottom: 14,
      backgroundColor: theme.colors.card,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    nextBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      width: "100%",
    },
    nextText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    counter: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      fontWeight: "500",
    },
    bottomContainer: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
    },
  });
