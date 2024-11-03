// UserAvatar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface UserAvatarProps {
  name: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name = '', size = 60 }) => {
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '?';
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return '?';

    const parts = trimmedName.split(' ').filter(part => part.length > 0);
    
    if (parts.length >= 2) {
      const firstInitial = parts[0][0];
      const secondInitial = parts[1][0];
      return firstInitial && secondInitial 
        ? `${firstInitial}${secondInitial}`.toUpperCase()
        : '?';
    }
    
    return parts[0]?.[0]?.toUpperCase() || '?';
  };

  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2 }
    ]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
});