package com.github.fujianlian.klinechart.entity;

/**
 * Candlestick chart entity interface
 * Created by tifezh on 2016/6/9.
 */
public interface ICandle {

    /**
     * Opening price
     */
    float getOpenPrice();

    /**
     * Highest price
     */
    float getHighPrice();

    /**
     * Lowest price
     */
    float getLowPrice();

    /**
     * Closing price
     */
    float getClosePrice();

    float getVolume();


    // The following are MA data
    /**
     * 5-period moving average price
     */
    float getMA5Price();

    /**
     * 10-period moving average price
     */
    float getMA10Price();

    /**
     * 20-period moving average price
     */
    float getMA20Price();

    /**
     * 30-period moving average price
     */
    float getMA30Price();

    /**
     * 60-period moving average price
     */
    float getMA60Price();

    // The following are BOLL data
    /**
     * Upper band
     */
    float getUp();

    /**
     * Middle band
     */
    float getMb();

    /**
     * Lower band
     */
    float getDn();

}
