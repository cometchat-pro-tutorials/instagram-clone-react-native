import React from 'react'; 
import { View, Image, StyleSheet, Platform } from 'react-native';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

const Detail = (props) => { 
  const { route } = props;
  const { post } = route.params;

  console.log('selected post: ');
  console.log(post);

  if (!route || !post || !post.content) {
    return <></>;
  }

  if (post.postCategory && post.postCategory === 1) {
    return (
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: post.content }} />
      </View>
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
          source={{ uri: post.content }}
        />
        <View style={styles.videoOverlay} />
      </View>
    );
  }

  return <></>;
};

const styles = StyleSheet.create({
  imageContainer: { 
    flex: 1,
  },
  image: { 
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
});

export default Detail;