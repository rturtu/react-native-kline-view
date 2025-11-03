import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { requireNativeComponent, UIManager, findNodeHandle, Platform } from 'react-native';

const NativeRNKLineView = requireNativeComponent('RNKLineView');

const RNKLineView = forwardRef((props, ref) => {
  const nativeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updateLastCandlestick: (candlestick) => {
      console.log('updateLastCandlestick called with:', candlestick);
      const nodeHandle = findNodeHandle(nativeRef.current);
      console.log('nodeHandle:', nodeHandle, 'Platform:', Platform.OS);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          console.log('Dispatching iOS command');
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.updateLastCandlestick,
            [candlestick]
          );
        } else {
          console.log('Dispatching Android command with string');
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'updateLastCandlestick',
            [candlestick]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    },
    addCandlesticksAtTheEnd: (candlesticks) => {
      console.log('addCandlesticksAtTheEnd called with:', candlesticks.length, 'candlesticks');
      const nodeHandle = findNodeHandle(nativeRef.current);
      console.log('nodeHandle:', nodeHandle, 'Platform:', Platform.OS);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          console.log('Dispatching iOS addCandlesticksAtTheEnd command');
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.addCandlesticksAtTheEnd,
            [candlesticks]
          );
        } else {
          console.log('Dispatching Android addCandlesticksAtTheEnd command with string');
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'addCandlesticksAtTheEnd',
            [candlesticks]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    },
    addCandlesticksAtTheStart: (candlesticks) => {
      console.log('addCandlesticksAtTheStart called with:', candlesticks.length, 'candlesticks');
      const nodeHandle = findNodeHandle(nativeRef.current);
      console.log('nodeHandle:', nodeHandle, 'Platform:', Platform.OS);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          console.log('Dispatching iOS addCandlesticksAtTheStart command');
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.addCandlesticksAtTheStart,
            [candlesticks]
          );
        } else {
          console.log('Dispatching Android addCandlesticksAtTheStart command with string');
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'addCandlesticksAtTheStart',
            [candlesticks]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    }
  }));

  return <NativeRNKLineView ref={nativeRef} {...props} />;
});

export default RNKLineView;
