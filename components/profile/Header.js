import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Header = (props) => {
  const { profile, onFollowToggled, hasFollowed, isFollowHidden } = props;

  const toggleFollow = () => { 
    onFollowToggled(profile, hasFollowed);
  };

  if (!profile) {
    return <></>;
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerImageContainer}>
        <Image style={styles.headerImage} source={{ uri: profile.avatar }} />
      </View>
      <View style={styles.headerRight}>
        <View style={styles.headerInfoContainer}>
          <View style={styles.headerNumberOfPostsContainer}>
            <Text style={[styles.headerLabel, styles.headerLabelBold]}>{profile.nPosts ? profile.nPosts : 0}</Text>
            <Text style={styles.headerLabel}>Posts</Text>
          </View>
          <View style={styles.headerNumberOfFollowersContainer}>
            <Text style={[styles.headerLabel, styles.headerLabelBold]}>{profile.nFollowers ? profile.nFollowers : 0}</Text>
            <Text style={styles.headerLabel}>Followers</Text>
          </View>
          <View style={styles.headerNumberOfFollowingContainer}>
          </View>
        </View>
        {!isFollowHidden && <TouchableOpacity style={styles.followBtn} onPress={toggleFollow}>
          <Text style={styles.followTxt}>{hasFollowed ? 'Followed' : 'Follow'}</Text>
        </TouchableOpacity>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  headerImageContainer: { 
    width: 96,
    height: 96,
    borderRadius: 96/2,
    borderWidth: 2,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerImage: {
    width: 86,
    height: 86,
    borderRadius: 86 / 2
  },
  headerRight: {
    flex: 1,
    flexDirection: 'column',
  },
  headerInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12
  },
  headerNumberOfPostsContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerNumberOfFollowersContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerNumberOfFollowingContainer: {
    flex: 1
  },
  headerLabel: {
    fontSize: 16,
  },
  headerLabelBold: {
    fontWeight: 'bold'
  },
  followBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginLeft: 32,
    paddingVertical: 8,
    width: 128,
  },
  followTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default Header;