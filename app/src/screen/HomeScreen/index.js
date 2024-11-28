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
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlashList } from "@shopify/flash-list";

import { useBackend } from "../../component/BareProvider";
import uiEvent, { CONNECTIONS_UI, RECEIVE_MESSAGE_UI } from "../../lib/uiEvent";
import {
  selectMessages,
  selectCurrentRoom,
  selectPeersCount,
  selectIsConnected,
  selectIsLoading,
  selectError,
} from "../../store/messageSlice";
import MessageItem from "../../components/MessageItem";
import { useChatActions } from "../../hooks/useChatActions";
import { COLORS, SPACING, FONTS } from "../../constants/theme";
import { formatRoomTopic } from "../../utils/common";
import { useDispatch } from "react-redux";
import { clearError, setError } from "../../store/messageSlice";

export const HomeScreen = () => {
  const backend = useBackend();
  const listRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [roomTopicIn, setRoomTopicIn] = useState("");

  const messages = useSelector(selectMessages);
  const currentRoom = useSelector(selectCurrentRoom);
  const peersCount = useSelector(selectPeersCount);
  const isConnected = useSelector(selectIsConnected);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const dispatch = useDispatch();

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
    listRef?.current?.scrollToEnd({ animated: true });
  }, [handleSend, inputText]);

  const renderItem = useCallback(({ item }) => <MessageItem item={item} />, []);
  const keyExtractor = useCallback(
    (item, index) => `${item.timestamp}-${index}`,
    []
  );

  const handleCreateRoom = useCallback(() => {
    handleCreate();
  }, [handleCreate]);

  const handleJoinRoom = useCallback(() => {
    if (!roomTopicIn.trim()) {
      dispatch(setError("Please enter a room topic"));
      return;
    }
    handleJoin(roomTopicIn);
  }, [handleJoin, roomTopicIn, dispatch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      {currentRoom ? (
        <>
          <View style={styles.header}>
            <Text style={styles.topic}>{formatRoomTopic(currentRoom)}</Text>
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.connectionStatus,
                  {
                    backgroundColor: isConnected
                      ? COLORS.success
                      : COLORS.error,
                  },
                ]}
              />
              <Text style={styles.peers}>{peersCount} peers</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => dispatch(clearError())}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={COLORS.text.light}
                />
              </TouchableOpacity>
            </View>
          )}

          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
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
                    <Text style={styles.emptySubtext}>
                      Start the conversation!
                    </Text>
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
                style={[
                  styles.sendButton,
                  !inputText.trim() && { opacity: 0.5 },
                ]}
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
        </>
      ) : (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome to PearBareChat</Text>
            <Text style={styles.welcomeSubtitle}>
              Create or join a room to start chatting
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => dispatch(clearError())}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={COLORS.background}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.welcomeActions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.createButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleCreateRoom}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.buttonText}>Create Room</Text>
                )}
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
                    if (roomTopicIn.trim() && !isLoading) {
                      handleJoinRoom();
                    }
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.joinButton,
                    (!roomTopicIn.trim() || isLoading) && styles.buttonDisabled,
                  ]}
                  onPress={handleJoinRoom}
                  disabled={!roomTopicIn.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <Text style={styles.buttonText}>Join Room</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
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
    justifyContent: "center",
    padding: SPACING.xl,
  },
  welcomeContent: {
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  welcomeActions: {
    width: "100%",
    marginTop: SPACING.lg,
  },
  joinSection: {
    marginTop: SPACING.lg,
  },
  topicInput: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
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
  errorContainer: {
    backgroundColor: COLORS.error,
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: COLORS.background,
    flex: 1,
    marginRight: SPACING.sm,
  },
});

export default HomeScreen;
