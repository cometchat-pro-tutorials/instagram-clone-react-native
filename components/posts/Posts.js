import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat'
import { useNavigation } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

import Post from './Post';
import ProfilePost from './ProfilePost';

import Context from '../../context';

import { database, databaseRef, databaseOnValue, databaseSet, databaseGet, databaseChild, databaseOff } from "../../firebase";

const Posts = (props) => {
  const { authorId, postCategory, isGrid } = props;

  const [posts, setPosts] = useState();

  const { user } = useContext(Context);

  const navigation = useNavigation();

  useEffect(() => {
    loadPosts();
    return () => {
      setPosts([]);
      const postsRef = databaseRef(database, 'posts');
      databaseOff(postsRef);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    return () => {
      setPosts([]);
      const postsRef = databaseRef(database, 'posts');
      databaseOff(postsRef);
    }
  }, [postCategory]);

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

  const hasLiked = (post, user) => {
    if (!post || !user) {
      return false;
    }
    if (!post.likes || !post.likes.length) {
      return false
    }
    return post.likes.includes(user.id);
  };

  const hasFollowed = (author, user) => {
    if (!author || !user) {
      return false;
    }
    if (!author.followers || !author.followers.length) {
      return false;
    }
    return author.followers.includes(user.id);
  };

  const transformPosts = async (posts) => {
    if (!posts || !posts.length) {
      return [];
    }
    const transformedPosts = [];
    for (const post of posts) {
      if ((authorId && post.author.id !== authorId) || (postCategory && post.postCategory !== postCategory)) {
        continue;
      }
      const author = await getUser(post.author.id);
      post.hasFollowed = hasFollowed(author, user);
      post.hasLiked = hasLiked(post, user);
      transformedPosts.push(post);
    }
    return transformedPosts;
  };

  const loadPosts = () => {
    const postsRef = databaseRef(database, 'posts');
    databaseOnValue(postsRef, async (snapshot) => {
      const values = snapshot.val();
      if (values) {
        const keys = Object.keys(values);
        const posts = keys.map(key => values[key]);
        const transformedPosts = await transformPosts(posts);
        setPosts(() => transformedPosts);
      } else {
        setPosts(() => []);
      }
    });
  };

  const updateLikes = (post) => {
    if (!post) {
      return;
    }
    if (post.hasLiked) {
      return post.likes && post.likes.length ? post.likes.filter(like => like !== user.id) : [];
    }
    return post.likes && post.likes.length ? [...post.likes, user.id] : [user.id];
  }

  const createNotification = async ({ id, notificationImage, notificationMessage, receiverId }) => {
    if (!id || !notificationImage || !notificationMessage) {
      return;
    }
    await databaseSet(databaseRef(database, 'notifications/' + id), { id, notificationImage, notificationMessage, receiverId });
  };

  const sendCustomMessage = ({ message, type, receiverId }) => {
    const receiverID = receiverId;
    const customType = type;
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    const customData = { message };
    const customMessage = new CometChat.CustomMessage(receiverID, receiverType, customType, customData);
    CometChat.sendCustomMessage(customMessage).then(
      message => {
      },
      error => {
      }
    );
  };

  const toggleLike = async (post) => {
    if (!post) {
      return;
    }
    const likes = updateLikes(post);
    const nLikes = likes.length;
    const updatedPost = { id: post.id, content: post.content, author: { ...post.author }, likes, nLikes, postCategory: post.postCategory };
    databaseSet(databaseRef(database, 'posts/' + updatedPost.id), updatedPost);
    if (!post.hasLiked && post.author.id !== user.id) { 
      const notificationId = uuidv4();
      const customMessage = { message: `${user.fullname} has liked your post`, type: 'notification', receiverId: post.author.id};
      await createNotification({ id: notificationId, notificationImage: user.avatar, notificationMessage: customMessage.message, receiverId: customMessage.receiverId });
      sendCustomMessage(customMessage);
    }
  };

  const updateFolowers = (hasFollowed, author) => {
    if (!author) {
      return;
    }
    if (hasFollowed) {
      return author.followers && author.followers.length ? author.followers.filter(follower => follower !== user.id) : [];
    }
    return author.followers && author.followers.length ? [...author.followers, user.id] : [user.id];
  };

  const toggleFollow = async (post) => {
    if (!post) {
      return;
    }
    const author = await getUser(post.author.id);
    if (!author) {
      return;
    }
    const followers = updateFolowers(post.hasFollowed, author);
    const nFollowers = followers.length;
    author.followers = followers;
    author.nFollowers = nFollowers;
    await databaseSet(databaseRef(database, 'users/' + author.id), author);
    if (!post.hasFollowed && post.author.id !== user.id) { 
      const notificationId = uuidv4();
      const customMessage = { message: `${user.fullname} has followed you`, type: 'notification', receiverId: author.id };
      await createNotification({ id: notificationId, notificationImage: user.avatar, notificationMessage: customMessage.message, receiverId: customMessage.receiverId});
      sendCustomMessage(customMessage);
    }
    loadPosts();
  };

  const onItemClicked = (post) => {
    navigation.navigate('Detail', { post });
  };

  const renderItems = (item) => {
    const post = item.item;
    if (isGrid) {
      return <ProfilePost post={post} onItemClicked={onItemClicked} />;
    }
    return <Post post={post} toggleLike={toggleLike} toggleFollow={toggleFollow} onItemClicked={onItemClicked} isFollowHidden={user && user.id === post.author.id} />;
  };

  const getKey = (item) => {
    return item.id;
  };

  return (
    <View style={styles.list}>
      <FlatList
        numColumns={isGrid ? 3 : 1}
        data={posts}
        renderItem={renderItems}
        keyExtractor={(item, index) => getKey(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 4,
  }
});

export default Posts;