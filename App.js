import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, Alert, StyleSheet, Text, Platform } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './components/login/Login';
import SignUp from './components/register/SignUp';
import Tabs from './components/navigation/Tabs';
import Create from './components/create/Create';
import Detail from './components/posts/Detail';
import Chat from './components/chat/Chat';

import Context from './context';

import { cometChatConfig } from './env';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [hasNewPost, setHasNewPost] = useState(false);

  useEffect(() => {
    initCometChat();
    initAuthenticatedUser();
  }, []);

  useEffect(() => {
    if (user) {
      listenCustomMessages();
    }
    return () => {
      if (user) {
        CometChat.removeMessageListener(user.id);
      }
    }
  }, [user]);

  const initCometChat = async () => {
    const appID = `${cometChatConfig.cometChatAppId}`;
    const region = `${cometChatConfig.cometChatRegion}`;
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log('CometChat was initialized successfully');
      },
      error => {
      }
    );
  };

  const initAuthenticatedUser = async () => {
    const authenticatedUser = await AsyncStorage.getItem('auth');
    setUser(() => authenticatedUser ? JSON.parse(authenticatedUser) : null);
  };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const listenCustomMessages = () => {
    CometChat.addMessageListener(
      user.id,
      new CometChat.MessageListener({
        onCustomMessageReceived: customMessage => {
          if (customMessage && customMessage.sender && customMessage.sender.uid && customMessage.sender.uid !== user.id && customMessage.data && customMessage.data.customData && customMessage.data.customData.message) {
            if (customMessage && customMessage.type && customMessage.type === 'notification') {
              showMessage('Info', customMessage.data.customData.message);
            }
          }
        }
      })
    );
  };

  const handleLogout = (navigation) => {
    CometChat.logout().then(
      () => {
        AsyncStorage.removeItem('auth');
        setUser(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
      }, error => {
        console.log("Logout failed with exception:", { error });
      }
    );
  };

  const logout = (navigation) => () => {
    Alert.alert(
      "Confirm",
      "Do you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => handleLogout(navigation) }
      ]
    );
  };

  const createPost = (navigation) => () => {
    navigation.navigate('Create');
  };

  const chat = (navigation) => () => {
    navigation.navigate('Chat');
  };

  if (user) {
    return (
      <Context.Provider value={{ user, setUser, hasNewPost, setHasNewPost }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={Tabs} options={({ navigation }) => ({
              headerTitle: () => (
                <View>
                  <Image source={require('./images/logo.png')} style={[styles.logo, Platform.OS === 'android' ? styles.logoMargin : null]} />
                </View>
              ),
              headerLeft: () => {
                if (Platform.OS === 'ios') {
                  return (
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                      <TouchableOpacity onPress={createPost(navigation)}>
                        <Image
                          style={{ width: 24, height: 24, marginRight: 8 }}
                          source={require('./images/plus.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                  return <></>;
                }
              },
              headerRight: () => (
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  {Platform.OS === 'android' ? <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={createPost(navigation)}>
                      <Image
                        style={{ width: 24, height: 24, marginRight: 8 }}
                        source={require('./images/plus.png')}
                      />
                    </TouchableOpacity>
                  </View> : <></>}
                  <TouchableOpacity onPress={chat(navigation)}>
                    <Image
                      style={{ width: 24, height: 24, marginRight: 8 }}
                      source={require('./images/chat.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={logout(navigation)}>
                    <Image
                      style={{ width: 24, height: 24 }}
                      source={require('./images/power-off.png')}
                    />
                  </TouchableOpacity>
                </View>
              ),
            })} />
            <Stack.Screen name="Create" component={Create} options={({ navigation }) => ({
              headerTitle: () => (
                <View>
                  <Text style={styles.createPostTitle}>Create a post</Text>
                </View>
              )
            })} />
            <Stack.Screen name="Detail" component={Detail} />
            <Stack.Screen name="Chat" component={Chat} />
          </Stack.Navigator>
        </NavigationContainer>
      </Context.Provider>
    );
  }

  return (
    <Context.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
          />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Home" component={Tabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </Context.Provider>
  );
};

const styles = StyleSheet.create({
  logo: {
    flex: 1,
    height: 48,
    resizeMode: 'contain',
    width: 96,
  },
  logoMargin: {
    marginTop: 8
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  }
})

export default App;