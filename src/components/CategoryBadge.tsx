import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface CategoryBadgeProps {
  name: string;
  size?: 'small' | 'medium';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ name, size = 'small' }) => {
  const isSmall = size === 'small';
  return (
    <View style={[styles.badge, isSmall ? styles.smallBadge : styles.mediumBadge]}>
      <View style={styles.dot} />
      <Text style={[styles.text, isSmall ? styles.smallText : styles.mediumText]} numberOfLines={1}>
        {name || 'Chưa phân loại'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.sageLight,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sage,
    marginRight: 6,
  },
  smallBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  mediumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    color: Colors.evergreen,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 12,
  },
});
