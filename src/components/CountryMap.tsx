import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Asset } from "expo-asset";

import { CountryGeometry } from "../types/country";

type CountryMapProps = {
  target: CountryGeometry;
};

export const CountryMap: React.FC<CountryMapProps> = ({ target }) => {
  const [uri, setUri] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setUri(null);
    setHasError(false);

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
  }, [target]);

  return (
    <View style={styles.wrapper}>
      {!hasError ? (
        <Image
          source={uri ? { uri } : target.asset}
          style={styles.image}
          resizeMode="contain"
          onError={(e) => {
            console.warn(`Image error for ${target.code}`, e.nativeEvent);
            setHasError(true);
          }}
        />
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
