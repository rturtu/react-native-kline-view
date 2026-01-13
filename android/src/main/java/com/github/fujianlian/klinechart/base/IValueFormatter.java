package com.github.fujianlian.klinechart.base;

/**
 * Value formatter interface
 * Created by tifezh on 2016/6/21.
 */

public interface IValueFormatter {
    /**
     * Format value
     *
     * @param value the input value
     * @return formatted string
     */
    String format(float value);
}
