import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { HelpMessage, QuickReply } from '../../types/helpBot';
import { helpBotService } from '../../services/helpBotService';
import { useAlert } from '@/template';

interface HelpBotModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export function HelpBotModal({ visible, onClose, onOpenFeedback }: HelpBotModalProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { showAlert } = useAlert();
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [currentQuickReplies, setCurrentQuickReplies] = useState<QuickReply[]>(
    helpBotService.getInitialQuickReplies()
  );
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // Reset to initial state when modal opens
      const welcomeMessage: HelpMessage = {
        id: 'welcome',
        sender: 'bot',
        text: 'Hi! I\'m here to help you get the most out of TaskMaster. What can I help you with?',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setCurrentQuickReplies(helpBotService.getInitialQuickReplies());
      setShowQuickReplies(true);
    }
  }, [visible]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleQuickReply = (reply: QuickReply) => {
    const question = reply.question || reply.label;
    handleSendMessage(question, reply.id);
  };

  const handleSendMessage = (text: string, replyId?: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: HelpMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();

    // Get bot response
    setTimeout(() => {
      let response = replyId
        ? helpBotService.getResponseById(replyId)
        : helpBotService.getResponseByQuestion(text);

      if (!response) {
        // Fallback response
        const botMessage: HelpMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'I\'m not sure about that. Here are some common topics I can help with:',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setCurrentQuickReplies(helpBotService.getInitialQuickReplies());
        setShowQuickReplies(true);
      } else {
        const botMessage: HelpMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: response.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Show follow-up quick replies if available
        if (response.quickReplies && response.quickReplies.length > 0) {
          setCurrentQuickReplies(response.quickReplies);
          setShowQuickReplies(true);

          // Add "Did this help?" message after a short delay
          setTimeout(() => {
            const helpfulMessage: HelpMessage = {
              id: `helpful-${Date.now()}`,
              sender: 'bot',
              text: 'Did this answer your question?',
              timestamp: new Date(),
              quickReplies: [
                { id: 'yes', label: '👍 Yes' },
                { id: 'no', label: '👎 No' },
              ],
            };
            setMessages((prev) => [...prev, helpfulMessage]);
          }, 1000);
        }
      }
    }, 500);
  };

  const handleHelpfulResponse = (wasHelpful: boolean) => {
    if (wasHelpful) {
      const thankYouMessage: HelpMessage = {
        id: `thankyou-${Date.now()}`,
        sender: 'bot',
        text: 'Great! Let me know if you need anything else.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, thankYouMessage]);
      setCurrentQuickReplies(helpBotService.getInitialQuickReplies());
    } else {
      const feedbackMessage: HelpMessage = {
        id: `feedback-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry I couldn\'t help better. You can submit feedback to get personalized assistance from our team!',
        timestamp: new Date(),
        quickReplies: [
          { id: 'send_feedback', label: '📝 Send Feedback' },
          { id: 'try_again', label: '🔄 Try Another Question' },
        ],
      };
      setMessages((prev) => [...prev, feedbackMessage]);
      setShowQuickReplies(false);
    }
  };

  const handleSpecialQuickReply = (id: string) => {
    if (id === 'yes' || id === 'no') {
      handleHelpfulResponse(id === 'yes');
    } else if (id === 'send_feedback') {
      onClose();
      onOpenFeedback?.();
    } else if (id === 'try_again') {
      setCurrentQuickReplies(helpBotService.getInitialQuickReplies());
      setShowQuickReplies(true);
    }
  };

  const renderMessage = (message: HelpMessage) => {
    const isBot = message.sender === 'bot';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View
            style={[
              styles.botAvatar,
              { backgroundColor: colors.primary, borderRadius: borderRadius.round },
            ]}
          >
            <MaterialCommunityIcons name="robot-happy" size={20} color="#FFF" />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isBot ? colors.card : colors.primary,
              borderRadius: borderRadius.md,
              maxWidth: '75%',
            },
            isBot ? shadows.sm : {},
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                fontSize: fontSize.base,
                color: isBot ? colors.text : '#FFF',
              },
            ]}
          >
            {message.text}
          </Text>
        </View>

        {/* Quick reply buttons for specific messages */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <View style={[styles.inlineQuickReplies, { marginTop: spacing.xs }]}>
            {message.quickReplies.map((reply) => (
              <TouchableOpacity
                key={reply.id}
                style={[
                  styles.inlineQuickReplyButton,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: borderRadius.sm,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    marginRight: spacing.xs,
                    marginBottom: spacing.xs,
                  },
                ]}
                onPress={() => handleSpecialQuickReply(reply.id)}
              >
                <Text
                  style={[
                    styles.inlineQuickReplyText,
                    { fontSize: fontSize.sm, color: colors.primary },
                  ]}
                >
                  {reply.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.divider },
            shadows.sm,
          ]}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.headerAvatar,
                { backgroundColor: colors.primary, borderRadius: borderRadius.round },
              ]}
            >
              <MaterialCommunityIcons name="robot-happy" size={24} color="#FFF" />
            </View>
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={[styles.headerTitle, { fontSize: fontSize.lg, color: colors.text }]}>
                Help Assistant
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { fontSize: fontSize.xs, color: colors.success },
                ]}
              >
                ● Online
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{ padding: spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Quick Replies */}
        {showQuickReplies && currentQuickReplies.length > 0 && (
          <View
            style={[
              styles.quickRepliesContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                padding: spacing.sm,
                borderTopColor: colors.divider,
              },
            ]}
          >
            <Text
              style={[
                styles.quickRepliesTitle,
                { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
              ]}
            >
              Quick Questions:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {currentQuickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply.id}
                  style={[
                    styles.quickReplyButton,
                    {
                      backgroundColor: colors.card,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      marginRight: spacing.sm,
                    },
                    shadows.sm,
                  ]}
                  onPress={() => handleQuickReply(reply)}
                >
                  <Text
                    style={[
                      styles.quickReplyText,
                      { fontSize: fontSize.sm, color: colors.text },
                    ]}
                  >
                    {reply.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.divider, padding: spacing.sm },
            shadows.md,
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                fontSize: fontSize.base,
                color: colors.text,
                flex: 1,
              },
            ]}
            placeholder="Type your question..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage(inputText)}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.backgroundTertiary,
                borderRadius: borderRadius.round,
                width: 44,
                height: 44,
                marginLeft: spacing.sm,
              },
            ]}
            onPress={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={inputText.trim() ? '#FFF' : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
  },
  messageText: {
    lineHeight: 20,
  },
  inlineQuickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 40,
  },
  inlineQuickReplyButton: {},
  inlineQuickReplyText: {
    fontWeight: '600',
  },
  quickRepliesContainer: {
    borderTopWidth: 1,
  },
  quickRepliesTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickReplyButton: {},
  quickReplyText: {
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  input: {},
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
