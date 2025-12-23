import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet, Platform, Animated, Keyboard, PanResponder, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../hooks/useTheme';

interface FloatingHelpButtonProps {
  onPress: () => void;
  hide?: boolean;
}

const POSITION_STORAGE_KEY = '@floating_help_button_position';
const BUTTON_SIZE = 60;
const EDGE_MARGIN = 20;
const IDLE_TIMEOUT = 3000; // 3 seconds
const SNAP_THRESHOLD = 0.5; // Snap to edge if closer than 50% of screen width

export function FloatingHelpButton({ onPress, hide = false }: FloatingHelpButtonProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // Get screen dimensions with proper safe area handling
  const [screenDimensions, setScreenDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setScreenDimensions({ width, height });
    };
    
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  // Calculate safe boundaries
  const safeTop = insets.top + 60; // Below header
  const safeBottom = screenDimensions.height - insets.bottom - 160; // Above tab bar
  const safeLeft = EDGE_MARGIN;
  const safeRight = screenDimensions.width - BUTTON_SIZE - EDGE_MARGIN;

  // Default position: left side, middle of screen
  const defaultPosition = {
    x: safeLeft,
    y: Math.max(safeTop, Math.min((screenDimensions.height - BUTTON_SIZE) / 2, safeBottom)),
  };

  const pan = useRef(new Animated.ValueXY(defaultPosition)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Load saved position on mount
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const saved = await AsyncStorage.getItem(POSITION_STORAGE_KEY);
        if (saved) {
          const position = JSON.parse(saved);
          // Validate position is within safe boundaries
          const validX = Math.max(safeLeft, Math.min(position.x, safeRight));
          const validY = Math.max(safeTop, Math.min(position.y, safeBottom));
          pan.setValue({ x: validX, y: validY });
        }
      } catch (error) {
        console.error('Error loading button position:', error);
      }
    };
    loadPosition();
  }, []);

  // Save position to storage
  const savePosition = async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify({ x, y }));
    } catch (error) {
      console.error('Error saving button position:', error);
    }
  };

  // Snap to nearest edge
  const snapToEdge = (gestureState: any) => {
    const currentX = pan.x._value;
    const currentY = pan.y._value;
    
    // Determine which edge is closer
    const screenCenter = screenDimensions.width / 2;
    const snapToLeft = currentX < screenCenter;
    
    const targetX = snapToLeft ? safeLeft : safeRight;
    const clampedY = Math.max(safeTop, Math.min(currentY, safeBottom));

    Animated.spring(pan, {
      toValue: { x: targetX, y: clampedY },
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start(() => {
      savePosition(targetX, clampedY);
    });
  };

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        // Reset idle timer
        if (idleTimer.current) {
          clearTimeout(idleTimer.current);
        }
        setIsIdle(false);
        
        // Scale up slightly on touch
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: false,
          tension: 100,
          friction: 7,
        }).start();
        
        // Full opacity when dragging
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start();
        
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      
      onPanResponderMove: (_, gestureState) => {
        // Constrain movement within safe boundaries
        const newX = Math.max(0, Math.min(gestureState.dx, safeRight - safeLeft));
        const newY = Math.max(0, Math.min(gestureState.dy, safeBottom - safeTop));
        
        pan.setValue({ x: newX, y: newY });
      },
      
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        // Scale back to normal
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 100,
          friction: 7,
        }).start();
        
        // Check if it was a tap (minimal movement)
        const isTap = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;
        
        if (isTap) {
          // Open help chat
          onPress();
        } else {
          // Snap to nearest edge
          snapToEdge(gestureState);
        }
        
        // Start idle timer
        startIdleTimer();
      },
    })
  ).current;

  // Idle timer - fade button slightly when not in use
  const startIdleTimer = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }
    
    idleTimer.current = setTimeout(() => {
      setIsIdle(true);
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, IDLE_TIMEOUT);
  };

  // Start idle timer on mount
  useEffect(() => {
    startIdleTimer();
    return () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
    };
  }, []);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Hide button when needed
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: hide || keyboardVisible ? 0 : 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [hide, keyboardVisible]);

  if (hide || keyboardVisible) {
    return null;
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            ...shadows.lg,
          },
        ]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <MaterialCommunityIcons name="chat-question" size={28} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 9999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
