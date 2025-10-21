import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { Asset } from "expo-asset";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  PinchGestureHandlerStateChangeEvent,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

type MapTarget = {
  code: string;
  name: string;
  asset: ImageSourcePropType;
};

type CountryMapProps = {
  target: MapTarget;
};

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_THRESHOLD = 1.01;

type Offset = { x: number; y: number };

const clamp = (value: number, max: number) => {
  if (!Number.isFinite(max) || max <= 0) {
    return 0;
  }
  return Math.min(Math.max(value, -max), max);
};

export const CountryMap: React.FC<CountryMapProps> = ({ target }) => {
  const [uri, setUri] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const tapRef = useRef<TapGestureHandler>(null);

  const containerSize = useRef({ width: 0, height: 0 });
  const currentScale = useRef(1);
  const panOffset = useRef<Offset>({ x: 0, y: 0 });
  const panStart = useRef<Offset>({ x: 0, y: 0 });
  const panLatest = useRef<Offset>({ x: 0, y: 0 });
  const pinchStartScale = useRef(1);

  const animatedScale = useRef(new Animated.Value(1)).current;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const clampOffset = useCallback(
    (scaleValue: number, proposed: Offset) => {
      const { width, height } = containerSize.current;
      if (scaleValue <= 1 || width === 0 || height === 0) {
        return { x: 0, y: 0 };
      }
      const maxOffsetX = ((scaleValue - 1) * width) / 2;
      const maxOffsetY = ((scaleValue - 1) * height) / 2;
      return {
        x: clamp(proposed.x, maxOffsetX),
        y: clamp(proposed.y, maxOffsetY),
      };
    },
    [],
  );

  const updateZoomState = useCallback((scaleValue: number) => {
    const next = scaleValue >= ZOOM_THRESHOLD;
    setIsZoomed((prev) => (prev === next ? prev : next));
  }, []);

  const applyAnimatedTransform = useCallback(
    (scaleValue: number, offset: Offset) => {
      animatedScale.stopAnimation();
      translateX.stopAnimation();
      translateY.stopAnimation();

      animatedScale.setValue(scaleValue);
      translateX.setValue(offset.x);
      translateY.setValue(offset.y);
    },
    [animatedScale, translateX, translateY],
  );

  const resetTransform = useCallback(() => {
    currentScale.current = 1;
    panOffset.current = { x: 0, y: 0 };
    panStart.current = { x: 0, y: 0 };
    panLatest.current = { x: 0, y: 0 };
    pinchStartScale.current = 1;
    applyAnimatedTransform(1, { x: 0, y: 0 });
    updateZoomState(1);
  }, [applyAnimatedTransform, updateZoomState]);

  const applyScale = useCallback(
    (rawScale: number) => {
      let nextScale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);
      if (!Number.isFinite(nextScale)) {
        nextScale = 1;
      }

      const clampedOffset = clampOffset(nextScale, panOffset.current);
      currentScale.current = nextScale;
      panOffset.current = clampedOffset;
      panLatest.current = clampedOffset;

      applyAnimatedTransform(nextScale, clampedOffset);
      updateZoomState(nextScale);
    },
    [applyAnimatedTransform, clampOffset, updateZoomState],
  );

  const handlePanGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (currentScale.current <= 1) {
        panLatest.current = { x: 0, y: 0 };
        translateX.setValue(0);
        translateY.setValue(0);
        return;
      }

      const { translationX, translationY } = event.nativeEvent;
      const next = clampOffset(currentScale.current, {
        x: panStart.current.x + translationX,
        y: panStart.current.y + translationY,
      });
      translateX.setValue(next.x);
      translateY.setValue(next.y);
      panLatest.current = next;
    },
    [clampOffset, translateX, translateY],
  );

  const handlePanStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      const { state, oldState, translationX, translationY } = event.nativeEvent;

      if (state === State.BEGAN) {
        panStart.current = panOffset.current;
        panLatest.current = panOffset.current;
      }

      if (oldState === State.ACTIVE) {
        const next = clampOffset(currentScale.current, {
          x: panStart.current.x + translationX,
          y: panStart.current.y + translationY,
        });
        panOffset.current = next;
        translateX.setValue(next.x);
        translateY.setValue(next.y);
      }
    },
    [clampOffset, translateX, translateY],
  );

  const handlePinchGestureEvent = useCallback(
    (event: PinchGestureHandlerGestureEvent) => {
      const rawScale = pinchStartScale.current * event.nativeEvent.scale;
      applyScale(rawScale);
    },
    [applyScale],
  );

  const handlePinchStateChange = useCallback(
    (event: PinchGestureHandlerStateChangeEvent) => {
      const { state, scale: gestureScale } = event.nativeEvent;

      if (state === State.BEGAN) {
        pinchStartScale.current = currentScale.current;
        return;
      }

      if (
        state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED
      ) {
        if (currentScale.current <= 1) {
          resetTransform();
          return;
        }
        applyScale(pinchStartScale.current * gestureScale);
      }
    },
    [applyScale, resetTransform],
  );

  const handleDoubleTap = useCallback(() => {
    resetTransform();
  }, [resetTransform]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      containerSize.current = {
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height,
      };
      const clamped = clampOffset(currentScale.current, panOffset.current);
      panOffset.current = clamped;
      applyAnimatedTransform(currentScale.current, clamped);
    },
    [applyAnimatedTransform, clampOffset],
  );

  useEffect(() => {
    let isMounted = true;
    setUri(null);
    setHasError(false);
    resetTransform();

    const load = async () => {
      try {
        const asset = Asset.fromModule(target.asset as number);
        if (!asset.downloaded) {
          await asset.downloadAsync();
        }
        if (!isMounted) {
          return;
        }
        setUri(asset.localUri ?? asset.uri ?? null);
      } catch (error) {
        console.warn(`Failed to load map asset for ${target.code}`, error);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [resetTransform, target]);

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {!hasError ? (
        <TapGestureHandler
          ref={tapRef}
          numberOfTaps={2}
          onActivated={handleDoubleTap}
          simultaneousHandlers={[panRef, pinchRef]}
        >
          <View style={styles.gestureWrapper}>
            <PanGestureHandler
              ref={panRef}
              enabled={isZoomed}
              onGestureEvent={handlePanGestureEvent}
              onHandlerStateChange={handlePanStateChange}
              simultaneousHandlers={[pinchRef, tapRef]}
            >
              <View style={styles.fill}>
                <PinchGestureHandler
                  ref={pinchRef}
                  onGestureEvent={handlePinchGestureEvent}
                  onHandlerStateChange={handlePinchStateChange}
                  simultaneousHandlers={[panRef, tapRef]}
                >
                  <AnimatedView
                    style={[
                      styles.transformWrapper,
                      {
                        transform: [
                          { scale: animatedScale },
                          { translateX },
                          { translateY },
                        ],
                      },
                    ]}
                  >
                    <AnimatedImage
                      source={uri ? { uri } : target.asset}
                      style={styles.image}
                      resizeMode="contain"
                      onError={(e) => {
                        console.warn(
                          `Image error for ${target.code}`,
                          e.nativeEvent,
                        );
                        setHasError(true);
                      }}
                    />
                  </AnimatedView>
                </PinchGestureHandler>
              </View>
            </PanGestureHandler>
          </View>
        </TapGestureHandler>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Map unavailable</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  gestureWrapper: {
    flex: 1,
  },
  transformWrapper: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
  },
  placeholderText: {
    color: "#0f172a",
    fontWeight: "600",
  },
});
