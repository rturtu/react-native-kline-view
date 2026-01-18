declare module 'react-native-kline-view' {
  import { Component } from 'react';
  import { ViewProps, ViewStyle } from 'react-native';

  export interface OrderLine {
    id: string;
    type: string; // 'limit' | 'liquidation' | 'stop_loss' | 'take_profit' | etc.
    price: number;
    amount: number;
    color: string; // Hex color string (e.g., '#FF0000' for red)
  }

  export interface RNKLineViewRef {
    updateLastCandlestick: (candlestick: any) => void;
    addCandlesticksAtTheEnd: (candlesticks: any[]) => void;
    addCandlesticksAtTheStart: (candlesticks: any[]) => void;
    addOrderLine: (orderLine: OrderLine) => void;
    removeOrderLine: (orderLineId: string) => void;
    updateOrderLine: (orderLine: OrderLine) => void;
    getOrderLines: () => OrderLine[];
  }

  export interface RNKLineViewProps extends ViewProps {
    style?: ViewStyle;
    optionList?: string;
    onDrawItemDidTouch?: (event: any) => void;
    onScrollLeft?: (event: any) => void;
    onChartTouch?: (event: any) => void;
    onDrawItemComplete?: (event: any) => void;
    onDrawPointComplete?: (event: any) => void;
  }

  export default class RNKLineView extends Component<RNKLineViewProps> {
    // Component ref methods will be available through imperative handle
  }
}