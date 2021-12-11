import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../home/Home';
import Notifications from '../notification/Notifications';
import Profile from '../profile/Profile';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        if (route.name === 'Feed') {
          const homeIcon = focused ? require('../../images/home-active.png') : require('../../images/home.png');
          return <Image style={styles.tabBarIconStyle} source={homeIcon} />
        } else if (route.name === 'Notifications') {
          const notificationIcon = focused ? require('../../images/bell-active.png') : require('../../images/bell.png');
          return <Image style={styles.tabBarIconStyle} source={notificationIcon} />
        } else if (route.name === 'Profile') {
          const profileIcon = focused ? require('../../images/user-active.png') : require('../../images/user.png');
          return <Image style={styles.tabBarIconStyle} source={profileIcon} />
        }
        return null;
      },
      tabBarLabelStyle: styles.tabBarLabelStyle,
      tabBarActiveTintColor: '#3B82F6',
      tabBarInactiveTintColor: '#000',
      headerShown: false,
      unmountOnBlur: true
    })}>
      <Tab.Screen name="Feed" component={Home} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarIconStyle: {
    width: 24,
    height: 24
  },  
  tabBarLabelStyle: {
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default Tabs;