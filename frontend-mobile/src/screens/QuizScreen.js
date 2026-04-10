import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Modal, ScrollView, Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const QuizScreen = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setQuizResult] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [qRes, rRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/quizzes?status=Published`, config),
        axios.get(`${API_BASE_URL}/quizzes/results/me`, config)
      ]);
      setQuizzes(qRes.data.data);
      setResults(rRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setStartTime(new Date());
    setQuizFinished(false);
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const submitQuiz = async () => {
    const durationTaken = Math.round((new Date() - startTime) / 60000);
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_BASE_URL}/quizzes/${activeQuiz._id}/submit`, {
        userAnswers: answers,
        durationTaken
      }, config);
      setQuizResult(data.data);
      setQuizFinished(true);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const isTaken = (quizId) => results.some(r => r.quiz?._id === quizId);
  const getResult = (quizId) => results.find(r => r.quiz?._id === quizId);

  const renderQuizItem = ({ item }) => {
    const taken = isTaken(item._id);
    const result = getResult(item._id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.subject}>{item.subject?.name}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="help-circle-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{item.questions.length} Questions</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="clock-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{item.duration} mins</Text>
          </View>
        </View>
        {taken ? (
          <View style={styles.resultBadge}>
            <Icon name="check-decagram" size={20} color="#4CAF50" />
            <Text style={styles.resultText}>Score: {result?.percentage}%</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={() => startQuiz(item)}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (activeQuiz && !quizFinished) {
    const q = activeQuiz.questions[currentQuestion];
    return (
      <SafeAreaView style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{activeQuiz.title}</Text>
          <Text style={styles.progress}>Question {currentQuestion + 1} of {activeQuiz.questions.length}</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.questionScroll}>
          <Text style={styles.questionText}>{q.questionText}</Text>
          {q.options.map((opt, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.optionButton, 
                answers[currentQuestion] === i && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect(i)}
            >
              <View style={[styles.radio, answers[currentQuestion] === i && styles.radioActive]}>
                {answers[currentQuestion] === i && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionText, answers[currentQuestion] === i && styles.selectedOptionText]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.quizFooter}>
          <TouchableOpacity 
            disabled={currentQuestion === 0} 
            onPress={() => setCurrentQuestion(v => v - 1)}
            style={[styles.navButton, currentQuestion === 0 && { opacity: 0.5 }]}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          {currentQuestion < activeQuiz.questions.length - 1 ? (
            <TouchableOpacity 
              onPress={() => setCurrentQuestion(v => v + 1)}
              style={[styles.navButton, styles.primaryNav]}
            >
              <Text style={[styles.navButtonText, styles.primaryNavText]}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={submitQuiz}
              style={[styles.navButton, styles.successNav]}
            >
              <Text style={[styles.navButtonText, styles.primaryNavText]}>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quizzes</Text>
        <Text style={styles.headerSubtitle}>Assessment & Evaluations</Text>
      </View>

      {loading && !activeQuiz ? (
        <ActivityIndicator size="large" color="#0062FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item._id}
          renderItem={renderQuizItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No active quizzes found.</Text>}
        />
      )}

      {/* Result Modal */}
      <Modal visible={quizFinished} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="trophy-outline" size={80} color="#FFD700" />
            <Text style={styles.modalTitle}>Quiz Completed!</Text>
            <Text style={styles.scoreText}>{finalScore?.percentage}%</Text>
            <Text style={styles.subScore}>Your Score: {finalScore?.score} / {activeQuiz?.totalMarks}</Text>
            <View style={styles.twinImpact}>
              <Text style={styles.impactText}>Digital Twin Updated! 🚀</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setQuizFinished(false); setActiveQuiz(null); }}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1C1E' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  list: { padding: 16 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  subject: { fontSize: 10, fontWeight: '800', color: '#7C4DFF', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1C1E' },
  meta: { flexDirection: 'row', marginTop: 12, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666' },
  startButton: { backgroundColor: '#0062FF', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  startButtonText: { color: '#FFF', fontWeight: '700' },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: '#E8F5E9', padding: 10, borderRadius: 12 },
  resultText: { color: '#2E7D32', fontWeight: '700' },
  
  quizContainer: { flex: 1, backgroundColor: '#FFF' },
  quizHeader: { padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
  quizTitle: { fontSize: 20, fontWeight: '800', color: '#333' },
  progress: { fontSize: 12, color: '#666', marginTop: 4 },
  questionScroll: { padding: 20 },
  questionText: { fontSize: 18, fontWeight: '600', color: '#1A1C1E', marginBottom: 24 },
  optionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#EEE', 
    marginBottom: 12 
  },
  selectedOption: { borderColor: '#0062FF', backgroundColor: '#F0F6FF' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#0062FF' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0062FF' },
  optionText: { fontSize: 16, color: '#444' },
  selectedOptionText: { fontWeight: '600', color: '#0062FF' },
  quizFooter: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#EEE' },
  navButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  navButtonText: { fontWeight: '700', color: '#666' },
  primaryNav: { backgroundColor: '#0062FF' },
  primaryNavText: { color: '#FFF' },
  successNav: { backgroundColor: '#4CAF50' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 30, padding: 40, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '800', marginVertical: 16 },
  scoreText: { fontSize: 64, fontWeight: '900', color: '#0062FF' },
  subScore: { fontSize: 16, color: '#666', marginBottom: 24 },
  twinImpact: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 32 },
  impactText: { color: '#1976D2', fontWeight: '700' },
  closeButton: { backgroundColor: '#333', paddingVertical: 16, width: '100%', borderRadius: 16, alignItems: 'center' },
  closeButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default QuizScreen;
