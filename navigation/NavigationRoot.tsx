// navigation/NavigationRoot.tsx
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../screens/WelcomeScreen/WelcomeScreen";
import { MainScreen } from "../screens/MainScreen/MainScreen";
import { LoginScreen } from "../screens/Login/Login";
import { RegisterScreen } from "../screens/Registro/Registro";
import { RootStackParamList } from "./types";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const NavigationRoot: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#056b05" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {!user ? (
        <>
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={MainScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};