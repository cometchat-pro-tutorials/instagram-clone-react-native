import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const Actions = (props) => {
  const { onCategorySelected } = props;

  const [selected, setSelected] = useState(1);

  const selectItem = (selected) => () => {
    setSelected(() => selected);
    onCategorySelected(selected);
  };

  return (
    <View style={styles.actionContainer}>
      <View style={styles.actionList}>
        <TouchableOpacity style={[styles.actionListItem, selected === 1 ? styles.actionListItemActive : null]} onPress={selectItem(1)}>
          <Image style={styles.actionListIcon} source={require('../../images/grid-active.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionListItem, selected === 2 ? styles.actionListItemActive : null]} onPress={selectItem(2)}>
          <Image style={styles.actionListIcon} source={require('../../images/play-active.png')} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionList: {
    flexDirection: 'row'
  },
  actionListItem: {
    alignItems: 'center',
    marginRight: 24,
    paddingBottom: 8,
    paddingTop: 12,
    width: 56,
  },
  actionListItemActive: {
    borderBottomColor: '#000',
    borderBottomWidth: 2
  },
  actionListIcon: {
    width: 24,
    height: 24
  }
});

export default Actions;