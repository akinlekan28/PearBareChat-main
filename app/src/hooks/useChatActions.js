import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { addMessage, setRoomTopic, setPeersCount } from "../store/messageSlice";
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
    (topic) => dispatch(setRoomTopic(topic)),
    [dispatch]
  );

  const appendMessage = useCallback(
    (msg, local = false) => {
      if (msg.trim()) {
        dispatch(addMessage(createMessage(msg, local)));
        listRef.current?.scrollToEnd({ animated: true });
      }
    },
    [dispatch, listRef]
  );

  const handleCreate = useCallback(
    () => backend.createRoom(handleTopic),
    [backend, handleTopic]
  );

  const handleJoin = useCallback(
    (roomTopicIn) => {
      const topic = roomTopicIn.replace("Topic: ", "");
      handleTopic(topic);
      backend.joinRoom(topic, handleTopic);
    },
    [backend, handleTopic]
  );

  const handleSend = useCallback(
    (inputText, setInputText) => {
      if (inputText.trim()) {
        backend.sendMessage(inputText, appendMessage);
        setInputText("");
      }
    },
    [backend, appendMessage]
  );

  return {
    handleMessage,
    handlePeersCount,
    handleTopic,
    appendMessage,
    handleCreate,
    handleJoin,
    handleSend,
  };
};
