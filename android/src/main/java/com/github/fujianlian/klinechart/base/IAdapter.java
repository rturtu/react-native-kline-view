package com.github.fujianlian.klinechart.base;

import android.database.DataSetObserver;

/**
 * Data adapter
 * Created by tifezh on 2016/6/14.
 */

public interface IAdapter {
    /**
     * Get the number of data points
     *
     * @return
     */
    int getCount();

    /**
     * Get item by index
     *
     * @param position corresponding index
     * @return data entity
     */
    Object getItem(int position);

    /**
     * Get time by index
     *
     * @param position
     * @return
     */
    String getDate(int position);

    /**
     * Register a data observer
     *
     * @param observer data observer
     */
    void registerDataSetObserver(DataSetObserver observer);

    /**
     * Remove a data observer
     *
     * @param observer data observer
     */
    void unregisterDataSetObserver(DataSetObserver observer);

    /**
     * Called when data changes
     */
    void notifyDataSetChanged();
}
