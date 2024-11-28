import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  addMessage,
  setRoomTopic,
  setPeersCount,
  addReaction,
  setConnectionStatus,
  setLastRoom,
  setCurrentRoom,
  setLoading,
  setError,
} from "../store/messageSlice";
import { createMessage } from "../lib/message";

export const useChatActions = (backend, listRef) => {
  const dispatch = useDispatch();

  const handleMessage = useCallback(
    ({ memberId, message }) => {
      dispatch(addMessage({ ...message, local: false, memberId }));
      listRef.current?.scrollToEnd({ animated: true });
    },
    [dispatch, listRef]
  );

  const handlePeersCount = useCallback(
    (count) => {
      dispatch(setPeersCount(count));
    },
    [dispatch]
  );

  const handleTopic = useCallback(
    (topic) => {
      console.log("handleTopic called with:", topic);
      if (topic) {
        console.log("Setting room topic:", topic);
        dispatch(setCurrentRoom(topic));
        dispatch(setLastRoom(topic));
        dispatch(setConnectionStatus(true));
        console.log("Room state updated");
      } else {
        console.log("No topic received");
        dispatch(setError("Failed to create room. Please try again."));
      }
      dispatch(setLoading(false));
    },
    [dispatch]
  );

  const appendMessage = useCallback(
    (msg, local = false) => {
      if (msg.trim()) {
        dispatch(addMessage(createMessage(msg, local)));
        listRef?.current?.scrollToEnd({ animated: true });
      }
    },
    [dispatch, listRef]
  );

  const handleCreate = useCallback(() => {
    if (!backend) return;
    dispatch(setLoading(true));
    dispatch(setConnectionStatus(false));
    dispatch(setError(null));
    console.log("Creating room...");
    backend.createRoom(handleTopic);
  }, [backend, handleTopic, dispatch]);

  const handleJoin = useCallback(
    async (topic) => {
      if (!backend) return;

      try {
        dispatch(setLoading(true));
        dispatch(setConnectionStatus(false));
        await backend.joinRoom(topic, (roomTopic) => {
          dispatch(setRoomTopic(roomTopic));
          dispatch(setLastRoom(topic));
          dispatch(setCurrentRoom(topic));
          dispatch(setConnectionStatus(true));
        });
      } catch (error) {
        console.error("Failed to join room:", error);
        dispatch(
          setError(
            "Failed to join room. The room may not exist or there might be a connection issue."
          )
        );
        dispatch(setConnectionStatus(false));
        dispatch(setCurrentRoom(null));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [backend, dispatch]
  );

  const handleSend = useCallback(
    async (inputText, setInputText) => {
      if (!backend || !inputText.trim()) {
        console.error("Cannot send message: backend not connected");
        dispatch(setError("Cannot send message: not connected to chat room"));
        return;
      }

      try {
        const message = createMessage(inputText, true);
        dispatch(addMessage(message)); // Add message to Redux store immediately

        console.log("Sending message:", message);
        await backend.sendMessage(JSON.stringify(message), (response) => {
          console.log("Message sent response:", response);
        });

        setInputText("");
        listRef?.current?.scrollToEnd({ animated: true });
      } catch (error) {
        console.error("Failed to send message:", error);
        dispatch(setError("Failed to send message. Please try again."));
      }
    },
    [backend, dispatch, listRef]
  );

  const handleReaction = useCallback(
    (messageTimestamp, reaction) => {
      dispatch(addReaction({ messageTimestamp, reaction, memberId: "You" }));
      if (backend?.sendReaction) {
        backend.sendReaction({ messageTimestamp, reaction });
      }
    },
    [dispatch, backend]
  );

  return {
    handleMessage,
    handlePeersCount,
    handleTopic,
    appendMessage,
    handleCreate,
    handleJoin,
    handleSend,
    handleReaction,
  };
};
