import React, { useEffect, useState, useContext } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Header from './Header';
import Actions from './Actions';
import Posts from '../posts/Posts';
import Context from '../../context';
import { database, databaseSet, databaseRef, databaseGet, databaseChild } from "../../firebase";

const Profile = () => {

  const [profile, setProfile] = useState(null);
  const [postCategory, setPostCategory] = useState(null);

  const { user, hasNewPost, setHasNewPost } = useContext(Context);

  useEffect(() => {
    if (user && user.id) {
      loadProfile(user.id);
      return () => {
        setProfile(null);
      };
    }
  }, [user]);

  useEffect(() => {
    if (hasNewPost) {
      loadProfile(user.id);
      setHasNewPost(false);
      return () => {
        setProfile(null);
      };
    }
  }, [hasNewPost]);

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
  };

  const loadProfile = async (id) => {
    const profile = await getUser(id);
    setProfile(() => profile);
  };

  const onCategorySelected = (category) => {
    if (!category) {
      return;
    }
    setPostCategory(() => category);
  }

  const updateFolowers = (hasFollowed, profile) => {
    if (!profile) {
      return;
    }
    if (hasFollowed) {
      return profile.followers && profile.followers.length ? profile.followers.filter(follower => follower !== user.id) : [];
    }
    return profile.followers && profile.followers.length ? [...profile.followers, user.id] : [user.id];
  };

  const onFollowToggled = async (profile, hasFollowed) => {
    if (!profile) {
      return;
    }
    const latestProfile = await getUser(profile.id);
    if (!latestProfile) {
      return;
    }
    const followers = updateFolowers(hasFollowed, profile);
    const nFollowers = followers.length;
    latestProfile.followers = followers;
    latestProfile.nFollowers = nFollowers;
    await databaseSet(databaseRef(database, 'users/' + latestProfile.id), latestProfile);
    await loadProfile(latestProfile.id);
  }

  const hasFollowed = () => {
    if (!profile || !user) {
      return false;
    }
    if (!profile.followers || !profile.followers.length) {
      return false;
    }
    return profile.followers.includes(user.id);
  };

  if (!user) {
    return <></>;
  }

  const followed = hasFollowed();

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <Header profile={profile} hasFollowed={followed} onFollowToggled={onFollowToggled} isFollowHidden={user && profile && user.id === profile.id} />
      <Actions onCategorySelected={onCategorySelected} />
      <Posts authorId={user.id} postCategory={postCategory} isGrid />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    backgroundColor: '#fff'
  }
});

export default Profile;