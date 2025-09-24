import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { CountryGeometry } from "../types/country";

type CountryMapProps = {
  target: CountryGeometry;
};

export const CountryMap: React.FC<CountryMapProps> = ({ target }) => {
  return (
    <View style={styles.wrapper}>
      <Image source={target.asset} style={styles.image} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    aspectRatio: 1.3,
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
});