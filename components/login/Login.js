import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, Image } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';
import validator from "validator";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Context from "../../context";

import { cometChatConfig } from '../../env';

import { auth, signInWithEmailAndPassword, database, databaseRef, databaseGet, databaseChild } from "../../firebase";

const Login = (props) => {
  const { navigation } = props;

  const { setUser } = useContext(Context);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    }
  }, []);

  const onEmailChanged = (email) => {
    setEmail(() => email);
  };

  const onPasswordChanged = (password) => {
    setPassword(() => password);
  };

  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const getUser = async (id) => {
    if (!id) {
      return null;
    }
    const ref = databaseRef(database);
    const snapshot = await databaseGet(databaseChild(ref, `users/${id}`));
    if (!snapshot || !snapshot.exists()) {
      return null
    }
    return snapshot.val();
  }

  const loginCometChat = async (id) => {
    if (!id) {
      return;
    }
    try {
      const user = await CometChat.login(id, `${cometChatConfig.cometChatAuthKey}`);
      if (user) {
        const authenticatedUser = await getUser(id);
        if (authenticatedUser) {
          AsyncStorage.setItem('auth', JSON.stringify(authenticatedUser));
          setUser(authenticatedUser);
          navigation.navigate('Home');
        } else {
          setIsLoading(false);
          showMessage('Info', 'Cannot load the authenticated information, please try again');
        }
      } else {
        setIsLoading(false);
        showMessage('Error', 'Your username or password is not correct');
      }
    } catch (error) {
      setIsLoading(false);
      showMessage('Error', 'Your username or password is not correct');
    }
  };

  const login = async () => {
    if (isUserCredentialsValid(email, password)) {
      setIsLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential) {
          const userId = userCredential.user.uid;
          await loginCometChat(userId);
        }
      } catch (error) {
        setIsLoading(false);
        showMessage('Error', 'Your username or password is not correct');
      }
    } else {
      setIsLoading(false);
      showMessage('Error', 'Your username or password is not correct');
    }
  };

  const register = () => {
    navigation.navigate('SignUp');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../images/logo.png')} />
      </View>
      <TextInput
        autoCapitalize='none'
        onChangeText={onEmailChanged}
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <TextInput
        autoCapitalize='none'
        onChangeText={onPasswordChanged}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.login} onPress={login}>
        <Text style={styles.loginLabel}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.register} onPress={register}>
        <Text style={styles.registerLabel}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  input: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 12,
  },
  login: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  loginLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  register: {
    backgroundColor: '#fff',
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  registerLabel: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  }
});

export default Login;