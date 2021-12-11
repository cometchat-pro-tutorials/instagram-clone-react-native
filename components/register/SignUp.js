import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';
import validator from "validator";
import { launchImageLibrary } from 'react-native-image-picker';

import { cometChatConfig } from '../../env';

import { auth, createUserWithEmailAndPassword, storage, storageRef, uploadBytesResumable, getDownloadURL, database, databaseRef, databaseSet } from "../../firebase";

const SignUp = () => {

  const [userAvatar, setUserAvatar] = useState(null);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const onFullnameChanged = (fullname) => {
    setFullname(() => fullname);
  };

  const onEmailChanged = (email) => {
    setEmail(() => email);
  };

  const onPasswordChanged = (password) => {
    setPassword(() => password);
  };

  const onConfirmPasswordChanged = (confirmPassword) => {
    setConfirmPassword(() => confirmPassword);
  };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const isSignupValid = ({ fullname, email, password, confirmPassword }) => {
    if (!userAvatar) { 
      showMessage('Error', 'Please upload your avatar');
      return false;
    }
    if (validator.isEmpty(fullname)) {
      showMessage('Error', 'Please input your full name');
      return false;
    }
    if (validator.isEmpty(email) || !validator.isEmail(email)) {
      showMessage('Error', 'Please input your email');
      return false;
    }
    if (validator.isEmpty(password)) {
      showMessage('Error', 'Please input your password');
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      showMessage('Error', 'Please input your confirm password');
      return false;
    }
    if (password !== confirmPassword) {
      showMessage('Error', 'Your confirm password must be matched with your password');
      return false;
    }
    return true;
  };

  const createCometChatAccount = async ({ id, fullname, avatar }) => {
    try {
      const authKey = `${cometChatConfig.cometChatAuthKey}`;
      const user = new CometChat.User(id);
      user.setName(fullname);
      user.setAvatar(avatar);
      const cometChatUser = await CometChat.createUser(user, authKey);
      if (cometChatUser) {
        showMessage('Info', `${fullname} was created successfully! Please sign in with your created account`);
        setIsLoading(false);
        setUserAvatar(null);
      } else {
        setIsLoading(false);
        setUserAvatar(null);
      }
    } catch (error) {
      showMessage('Error', 'Fail to create your CometChat user, please try again');
    }
  };

  const register = async () => {
    if (isSignupValid({ fullname, email, password, confirmPassword })) {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential) {
        const userId = userCredential._tokenResponse.localId;
        const createdAccount = { id: userId, fullname, email };
        databaseSet(databaseRef(database, 'users/' + userId), createdAccount);
        const storageImageRef = storageRef(storage, `users/${userAvatar.name}`);
        const localFile = await fetch(userAvatar.uri);
        const fileBlob = await localFile.blob();
        const uploadTask = uploadBytesResumable(storageImageRef, fileBlob, { contentType: userAvatar.type });
        uploadTask.on('state_changed',
          (snapshot) => {
          },
          (error) => {
            setUserAvatar(null);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (downloadUrl) {
              createdAccount.avatar = downloadUrl;
              databaseSet(databaseRef(database, 'users/' + userId), createdAccount);
              createCometChatAccount({ id: userId, fullname, avatar: downloadUrl });
            }
          }
        );
      } else {
        setIsLoading(false);
        showMessage('Error', 'Fail to create your account, your account might be existed');
      }
    }
  };

  const selectAvatar = () => {
    const options = {
      mediaType: 'photo'
    };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return null;
      } else if (response.assets && response.assets.length) {
        const uri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        const type = response.assets[0].type;
        if (uri && fileName) {
          const file = {
            name: fileName,
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type: type || 'video/quicktime'
          };
          setUserAvatar(() => file);
        }
      }
    });
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
      <TouchableOpacity style={styles.uploadContainer} onPress={selectAvatar}>
        {!userAvatar && <>
          <Image style={styles.uploadImageIcon} source={require('../../images/image-gallery.png')} />
          <Text style={styles.uploadImageTitle}>Upload your avatar</Text>
        </>}
        {userAvatar && <Image style={styles.userAvatar} source={{ uri: userAvatar.uri }} />}
      </TouchableOpacity>
      <TextInput
        autoCapitalize='none'
        onChangeText={onFullnameChanged}
        placeholder="Full name"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
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
      <TextInput
        autoCapitalize='none'
        onChangeText={onConfirmPasswordChanged}
        placeholder="Confirm Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
      />
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
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadImageIcon: {
    width: 96,
    height: 96
  },
  userAvatar: {
    width: 128,
    height: 128,
    borderRadius: 128 / 2
  },
  uploadImageTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 16
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
  register: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  registerLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default SignUp;