/*
    This is the layout for the drawer navigation.
*/

import { Drawer } from "expo-router/drawer";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  initialRouteName: "home",
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: "Home",
            title: "Home",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="house.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Support Board",
            title: "Support Board",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="pin.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="explore"
          options={{
            drawerLabel: "Discussion",
            title: "Discussion",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="bubble.left.and.bubble.right.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="report"
          options={{
            drawerLabel: "Report Incident",
            title: "Report Incident",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="exclamationmark.triangle.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="report-pick"
          options={{
            drawerLabel: "Choose Recordings",
            title: "Choose Recordings",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="play.rectangle.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="report-form"
          options={{
            drawerLabel: "Report Form",
            title: "Report Form",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="doc.text.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Recording2"
          options={{
            drawerLabel: "Voice Setup",
            title: "Voice Setup",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="mic.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="files"
          options={{
            drawerLabel: "My Media",
            title: "My Media",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="play.rectangle.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="flagged"
          options={{
            drawerLabel: "Flagged Workplaces",
            title: "Flagged Workplaces",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="flag.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="donate"
          options={{
            drawerLabel: "Donate",
            title: "Donate",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="heart.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="legal-lawyer"
          options={{
            drawerLabel: "Choose A Lawyer",
            title: "Choose A Lawyer",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="person.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="legal-what"
          options={{
            drawerLabel: "What Is Harassment",
            title: "What Is Harassment",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="info.circle.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="legal-intro"
          options={{
            drawerLabel: "Legal & Rights",
            title: "Legal & Rights",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="doc.text.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="legal"
          options={{
            drawerLabel: "Legal & Rights",
            title: "Legal & Rights",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="doc.text.fill" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}