import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import Context from '../../context';
import { storage, storageRef, uploadBytesResumable, getDownloadURL, database, databaseRef, databaseSet } from "../../firebase";

const Create = (props) => {
  const { navigation } = props;

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser, setHasNewPost } = useContext(Context);

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const uploadPost = () => {
    const options = {
      mediaType: 'mixed'
    };
    launchImageLibrary(options, (response) => {
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
          setPost(() => file);
        }
      }
    });
  };

  const buildPost = ({ id, content }) => {
    return { id, content, likes: [], nLikes: 0, postCategory: post.type.includes('image') ? 1 : 2, author: { id: user.id, fullname: user.fullname, avatar: user.avatar } }
  }

  const createPost = async () => {
    if (!post) {
      showMessage('Error', 'Please upload your post image or video');
      return;
    }
    setIsLoading(true);
    const storageImageRef = storageRef(storage, `posts/${post.name}`);
    const localFile = await fetch(post.uri);
    const fileBlob = await localFile.blob();
    const uploadTask = uploadBytesResumable(storageImageRef, fileBlob, { contentType: post.type });
    uploadTask.on('state_changed',
      (snapshot) => {
      },
      (error) => {
        setPost(null);
        setIsLoading(false);
        showMessage('Error', 'Failure to create your post, please try again');
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        if (downloadUrl) {
          const uuid = uuidv4();
          const createdPost = buildPost({ id: uuid, content: downloadUrl });
          databaseSet(databaseRef(database, 'posts/' + uuid), createdPost);
          user.nPosts = user.nPosts ? user.nPosts + 1 : 1;
          databaseSet(databaseRef(database, 'users/' + user.id), user);
          setUser(user);
          setIsLoading(false);
          setPost(null);
          setHasNewPost(true);
          showMessage('Info', "You post was created successfully");
          navigation.navigate('Home');
        }
      }
    );
  };

  const renderUploadedContent = () => {
    if (!post) {
      return (
        <TouchableOpacity style={styles.uploadContainer} onPress={uploadPost}>
          <Image style={styles.uploadImageIcon} source={require('../../images/image-gallery.png')} />
          <Text style={styles.uploadImageTitle}>Click to upload your image and video</Text>
        </TouchableOpacity>
      );
    }
    if (post && post.type && post.type.includes('image')) {
      return (
        <TouchableOpacity style={styles.postContainer} onPress={uploadPost}>
          <Image style={styles.postContent} source={{ uri: post.uri }} />
        </TouchableOpacity>
      );
    }
    if (post && post.type && post.type.includes('video')) {
      if (Platform.OS === 'ios') {
        return (
          <View style={styles.videoContainer}>
            <Video
              style={styles.videoElement}
              shouldPlay
              muted={true}
              source={{ uri: post.uri }}
              allowsExternalPlayback={false} />
          </View>
        );
      }
      return (
        <View style={styles.videoContainer}>
          <VideoPlayer
            autoplay
            repeat
            showOnStart={false}
            style={styles.videoElement}
            source={{ uri: post.uri }}
          />
          <TouchableOpacity style={styles.videoOverlay} onPress={uploadPost} />
        </View>
      );
    }
    return <></>;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderUploadedContent()}
      <TouchableOpacity style={styles.uploadBtn} onPress={createPost}>
        <Text style={styles.uploadTxt}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
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
  uploadImageTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 16
  },
  postContainer: {
    flex: 1,
  },
  postContent: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: 'contain'
  },
  videoContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  videoElement: {
    flex: 1
  },
  videoOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundColor: 'transparent',
    right: 0,
    top: 0,
  },  
  uploadBtn: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    display: 'flex',
    fontSize: 18,
    fontWeight: 'bold',
    height: 56,
    justifyContent: 'center',
    margin: 16,
    marginBottom: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  uploadTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default Create;