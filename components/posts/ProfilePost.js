import React from 'react';
import { View, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native'; 
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

const ProfilePost = (props) => {
  const { post, onItemClicked } = props;

  if (!post) {
    return <></>;
  }

  const clickItem = () => {
    onItemClicked(post);
  };

  if (post.postCategory && post.postCategory === 1) {
    return (
      <TouchableOpacity style={styles.imagePostContainer} onPress={clickItem}>
        <Image style={styles.imagePost} source={{ uri: post.content }} />
      </TouchableOpacity>
    );
  }
  if (post.postCategory && post.postCategory === 2) {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.videoContainer}>
          <Video
            style={styles.videoElement}
            shouldPlay
            muted={true}
            source={{ uri: post.content }}
            resizeMode='cover'
            allowsExternalPlayback={false} />
            <TouchableOpacity style={styles.videoOverlay} onPress={clickItem} />
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
          source={{ uri: post.content }}
        />
        <TouchableOpacity style={styles.videoOverlay} onPress={clickItem} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  imagePostContainer: { 
    flex: 1
  },
  imagePost: { 
    flex: 1,
    aspectRatio: 1
  },
  videoContainer: {
    flex: 1,
  },
  videoElement: {
    flex: 1
  },
  videoOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  }
});

export default ProfilePost;