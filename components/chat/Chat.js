import React from 'react';
import { CometChat } from '@cometchat-pro/react-native-chat';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CometChatUserListWithMessages, CometChatMessages } from '../../cometchat-pro-react-native-ui-kit';

const Chat = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={"UserListWithMessages"}>
        <Stack.Screen name="UserListWithMessages" component={CometChatUserListWithMessages} />
        <Stack.Screen name="CometChatMessages" component={CometChatMessages} />
    </Stack.Navigator>
  );
};

export default Chat;