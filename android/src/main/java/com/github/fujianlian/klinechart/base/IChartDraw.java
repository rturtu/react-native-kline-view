package com.github.fujianlian.klinechart.base;

import android.graphics.Canvas;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.github.fujianlian.klinechart.BaseKLineChartView;


/**
 * Base class for drawing charts based on entities
 * Created by tifezh on 2016/6/14.
 */
public interface IChartDraw<T> {

    /**
     * Draw method for objects that need scrolling
     *
     * @param canvas    canvas
     * @param view      k线图View
     * @param position  position of current point
     * @param lastPoint previous point
     * @param curPoint  current point
     * @param lastX     x coordinate of previous point
     * @param curX      X coordinate of current point
     */
    void drawTranslated(@Nullable T lastPoint, @NonNull T curPoint, float lastX, float curX, @NonNull Canvas canvas, @NonNull BaseKLineChartView view, int position);

    /**
     * @param canvas
     * @param view
     * @param position position of this point
     * @param x        starting x coordinate
     * @param y        starting y coordinate
     */
    void drawText(@NonNull Canvas canvas, @NonNull BaseKLineChartView view, int position, float x, float y);

    /**
     * Get the maximum value in the current entity
     *
     * @param point
     * @return
     */
    float getMaxValue(T point);

    /**
     * Get the minimum value in the current entity
     *
     * @param point
     * @return
     */
    float getMinValue(T point);

    /**
     * Get value formatter
     */
    IValueFormatter getValueFormatter();
}
