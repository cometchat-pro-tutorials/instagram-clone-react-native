import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const Notification = (props) => {
  const { notification } = props;

  if (!notification) {
    return <></>;
  }

  return (
    <View style={styles.listItem}>
      <View style={styles.imageContainer}>
        <Image style={styles.listItemImage} source={{ uri: notification.notificationImage }} />
      </View>
      <Text style={styles.listItemText}>{notification.notificationMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  imageContainer: {
    alignItems: 'center',
    borderColor: 'red',
    borderRadius: 56 / 2,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    marginRight: 12,
    width: 56,
  },  
  listItemImage: {
    width: 48,
    height: 48,
    borderRadius: 48 / 2,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  }
});

export default Notification;