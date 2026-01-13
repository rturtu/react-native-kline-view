package com.github.fujianlian.klinechart.entity;

/**
 * Volume interface
 * Created by hjm on 2017/11/14 17:46.
 */

public interface IVolume {

    /**
     * Opening price
     */
    float getOpenPrice();

    /**
     * Closing price
     */
    float getClosePrice();

    /**
     * Volume
     */
    float getVolume();

    /**
     * 5-period moving average volume
     */
    float getMA5Volume();

    /**
     * 10-period moving average volume
     */
    float getMA10Volume();
}
