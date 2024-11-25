import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlashList } from "@shopify/flash-list";

import { useBackend } from "../../component/BareProvider";
import uiEvent, { CONNECTIONS_UI, RECEIVE_MESSAGE_UI } from "../../lib/uiEvent";
import {
  selectMessages,
  selectRoomTopic,
  selectPeersCount,
} from "../../store/messageSlice";
import MessageItem from "../../components/MessageItem";
import { useChatActions } from "../../hooks/useChatActions";
import { COLORS, SPACING, FONTS } from "../../constants/theme";
import { formatRoomTopic } from "../../utils/common";

export const HomeScreen = () => {
  const backend = useBackend();
  const listRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [roomTopicIn, setRoomTopicIn] = useState("");

  const messages = useSelector(selectMessages);
  const roomTopic = useSelector(selectRoomTopic);
  const peersCount = useSelector(selectPeersCount);

  const {
    handleMessage,
    handlePeersCount,
    handleCreate,
    handleJoin,
    handleSend,
  } = useChatActions(backend, listRef);

  useEffect(() => {
    const messageListener = uiEvent.on(RECEIVE_MESSAGE_UI, handleMessage);
    const peerCountListener = uiEvent.on(CONNECTIONS_UI, handlePeersCount);
    return () => {
      messageListener.off();
      peerCountListener.off();
    };
  }, [handleMessage, handlePeersCount]);

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    handleSend(inputText, setInputText);
    listRef.current?.scrollToEnd({ animated: true });
  }, [handleSend, inputText]);

  const renderItem = useCallback(({ item }) => <MessageItem item={item} />, []);
  const keyExtractor = useCallback(
    (item, index) => `${item.timestamp}-${index}`,
    []
  );

  if (!roomTopic) {
    return (
      <SafeAreaView style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Welcome to PearBareChat</Text>
          <Text style={styles.welcomeSubtitle}>
            Create or join a room to start chatting
          </Text>

          <View style={styles.welcomeActions}>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
            >
              <Text style={styles.buttonText}>Create Room</Text>
            </TouchableOpacity>

            <View style={styles.joinSection}>
              <TextInput
                style={styles.topicInput}
                value={roomTopicIn}
                onChangeText={setRoomTopicIn}
                placeholder="Enter room topic..."
                placeholderTextColor={COLORS.text.light}
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (roomTopicIn.trim()) {
                    handleJoin(roomTopicIn);
                  }
                }}
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.joinButton,
                  !roomTopicIn.trim() && { opacity: 0.5 },
                ]}
                onPress={() => handleJoin(roomTopicIn)}
                disabled={!roomTopicIn.trim()}
              >
                <Text style={styles.buttonText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.topic}>{formatRoomTopic(roomTopic)}</Text>
          <Text style={styles.peers}>{peersCount} online</Text>
        </View>

        <View style={styles.listContainer}>
          <FlashList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={80}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                listRef.current?.scrollToEnd({ animated: true });
              }
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
            contentContainerStyle={messages.length === 0 && { flexGrow: 1 }}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.text.light}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={24}
              color={inputText.trim() ? COLORS.primary : COLORS.disabled}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  welcomeSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },
  welcomeActions: {
    width: "100%",
    maxWidth: 400,
  },
  joinSection: {
    marginTop: SPACING.lg,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  topic: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    width: "70%",
  },
  peers: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.light,
  },
  inputContainer: {
    flexDirection: "row",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  topicInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
});

export default HomeScreen;
