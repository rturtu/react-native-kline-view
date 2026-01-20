import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { requireNativeComponent, UIManager, findNodeHandle, Platform } from 'react-native';

const NativeRNKLineView = requireNativeComponent('RNKLineView');

const RNKLineView = forwardRef((props, ref) => {
  const nativeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updateLastCandlestick: (candlestick) => {
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.updateLastCandlestick,
            [candlestick]
          );
        } else {
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
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.addCandlesticksAtTheEnd,
            [candlesticks]
          );
        } else {
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
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.addCandlesticksAtTheStart,
            [candlesticks]
          );
        } else {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'addCandlesticksAtTheStart',
            [candlesticks]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    },
    addOrderLine: (orderLine) => {
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.addOrderLine,
            [orderLine]
          );
        } else {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'addOrderLine',
            [orderLine]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    },
    removeOrderLine: (orderLineId) => {
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.removeOrderLine,
            [orderLineId]
          );
        } else {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'removeOrderLine',
            [orderLineId]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    },
    updateOrderLine: (orderLine) => {
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.updateOrderLine,
            [orderLine]
          );
        } else {
          UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'updateOrderLine',
            [orderLine]
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
      }
    },
    getOrderLines: () => {
      const nodeHandle = findNodeHandle(nativeRef.current);
      if (nodeHandle) {
        if (Platform.OS === 'ios') {
          return UIManager.dispatchViewManagerCommand(
            nodeHandle,
            UIManager.getViewManagerConfig('RNKLineView').Commands.getOrderLines,
            []
          );
        } else {
          return UIManager.dispatchViewManagerCommand(
            nodeHandle,
            'getOrderLines',
            []
          );
        }
      } else {
        console.warn('No nodeHandle found for RNKLineView');
        return [];
      }
    }
  }));

  return <NativeRNKLineView ref={nativeRef} {...props} />;
});

export default RNKLineView;
