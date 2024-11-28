import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const EmojiReactionPicker = ({ visible, onClose, onSelectEmoji, position }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.container,
            {
              top: position?.y || 0,
              left: position?.x || 0,
            },
          ]}
        >
          {EMOJI_LIST.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiButton}
              onPress={() => {
                onSelectEmoji(emoji);
                onClose();
              }}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: COLORS.background,
    borderRadius: SPACING.lg,
    padding: SPACING.sm,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  emojiButton: {
    padding: SPACING.sm,
    marginHorizontal: 2,
  },
  emoji: {
    fontSize: FONTS.sizes.xl,
  },
});

export default memo(EmojiReactionPicker);
