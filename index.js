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
    }
  }));

  return <NativeRNKLineView ref={nativeRef} {...props} />;
});

export default RNKLineView;
