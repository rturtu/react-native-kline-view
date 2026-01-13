package com.github.fujianlian.klinechart.entity;

/**
 * MACD indicator (exponential smoothing moving average) interface
 * @see <a href="https://baike.baidu.com/item/MACD指标"/>Related information</a>
 * Created by tifezh on 2016/6/10.
 */

public interface IMACD {


    /**
     * DEA value
     */
    float getDea();

    /**
     * DIF value
     */
    float getDif();

    /**
     * MACD value
     */
    float getMacd();

}
