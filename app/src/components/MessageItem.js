import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { format } from "date-fns";
import { COLORS, SPACING, FONTS, SHADOWS } from "../constants/theme";

const MessageItem = ({ item }) => {
  const formattedTime = format(new Date(item.timestamp), "h:mm a");

  return (
    <View style={[styles.container, item.local && styles.myMessageContainer]}>
      <View style={[styles.message, item.local && styles.myMessage]}>
        <Text style={[styles.member, item.local && styles.myMember]}>
          {item?.memberId ?? "You"}
        </Text>
        <Text
          style={[styles.messageText, item.local && styles.myMessageText]}
          selectable
        >
          {item.message}
        </Text>
        <Text style={styles.timestamp}>{formattedTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  message: {
    maxWidth: "80%",
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.message.received.background,
    borderWidth: 1,
    borderColor: COLORS.message.received.border,
    ...SHADOWS.small,
  },
  myMessage: {
    backgroundColor: COLORS.message.sent.background,
    borderColor: COLORS.message.sent.border,
  },
  member: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.message.received.username,
    marginBottom: SPACING.xs,
  },
  myMember: {
    color: COLORS.message.sent.username,
  },
  messageText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.message.received.text,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.message.sent.text,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    alignSelf: "flex-end",
  },
});

export default memo(MessageItem);
