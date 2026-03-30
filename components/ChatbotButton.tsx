import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, PanResponder, Animated } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { MEDITATIVE_COLORS } from '@/theme/colors';
import { SHADOWS } from '@/theme/styles';

const BUTTON_SIZE = 50;

interface ChatbotButtonProps {
  onPress: () => void;
}

export default function ChatbotButton({ onPress }: ChatbotButtonProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          onPress();
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.button,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
          opacity: isDragging ? 0.8 : 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.buttonTouchable}
        onPress={onPress}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Open chatbot assistant"
        accessibilityHint="Drag to move or double tap to open chatbot companion for guidance"
      >
        <MessageCircle size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: MEDITATIVE_COLORS.primary.coral,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    ...SHADOWS.lg,
  },
  buttonTouchable: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
