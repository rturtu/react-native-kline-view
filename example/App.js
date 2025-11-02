/**
 * K-line Chart Example Application
 * Supports indicators, finger drawing, theme switching and other features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
	View,
	StyleSheet,
	StatusBar,
	Platform,
	PixelRatio
} from 'react-native'
import RNKLineView from 'react-native-kline-view'
import { ThemeManager } from './utils/themes'
import {
	TimeTypes,
	DrawTypeConstants,
	DrawStateConstants,
	DrawToolHelper
} from './utils/constants'
import {
	isHorizontalScreen
} from './utils/helpers'
import Toolbar from './components/Toolbar'
import ControlBar from './components/ControlBar'
import Selectors from './components/Selectors'
import {
	processKLineData,
	packOptionList
} from './utils/businessLogic'
import { generateMockData, generateMoreHistoricalData } from './utils/generateData'


const App = () => {
	const [isDarkTheme, setIsDarkTheme] = useState(false)
	const [selectedTimeType, setSelectedTimeType] = useState(2) // Corresponds to 1 minute
	const [selectedMainIndicator, setSelectedMainIndicator] = useState(0) // Corresponds to MA
	const [selectedSubIndicator, setSelectedSubIndicator] = useState(0) // Corresponds to MACD
	const [selectedDrawTool, setSelectedDrawTool] = useState(DrawTypeConstants.none)
	const [showIndicatorSelector, setShowIndicatorSelector] = useState(false)
	const [showTimeSelector, setShowTimeSelector] = useState(false)
	const [showDrawToolSelector, setShowDrawToolSelector] = useState(false)
	const [klineData, setKlineData] = useState(generateMockData())
	const [drawShouldContinue, setDrawShouldContinue] = useState(true)
	const [optionList, setOptionList] = useState(null)
	const [isLoadingNewData, setIsLoadingNewData] = useState(false)
	const [lastDataLength, setLastDataLength] = useState(0)
	const [currentScrollPosition, setCurrentScrollPosition] = useState(0)
	const [showVolumeChart, setShowVolumeChart] = useState(true)
	const [candleCornerRadius, setCandleCornerRadius] = useState(0)

	const kLineViewRef = useRef(null)

	const updateStatusBar = useCallback(() => {
		StatusBar.setBarStyle(
			isDarkTheme ? 'light-content' : 'dark-content',
			true
		)
	}, [isDarkTheme])

	useEffect(() => {
		updateStatusBar()
	}, [updateStatusBar])

	useEffect(() => {
		updateStatusBar()
		// Initialize loading K-line data
		setLastDataLength(klineData.length)
		setTimeout(() => reloadKLineData(), 0)
	}, [])

	useEffect(() => {
		updateStatusBar()
	}, [isDarkTheme, updateStatusBar])

	// Toggle theme
	const toggleTheme = useCallback(() => {
		setIsDarkTheme(prev => {
			// Reload data after theme switch to apply new colors
			setTimeout(() => reloadKLineData(), 0)
			return !prev
		})
	}, [])

	// Select time period
	const selectTimeType = useCallback((timeType) => {
		setSelectedTimeType(timeType)
		setShowTimeSelector(false)
		// Regenerate data and reload
		setKlineData(generateMockData())
		setTimeout(() => reloadKLineData(), 0)
		console.log('Switch time period:', TimeTypes[timeType].label)
	}, [])

	// Select indicator
	const selectIndicator = useCallback((type, indicator) => {
		if (type === 'main') {
			setSelectedMainIndicator(indicator)
		} else {
			setSelectedSubIndicator(indicator)
		}
		setShowIndicatorSelector(false)
		setTimeout(() => reloadKLineData(), 0)
	}, [])

	// Select drawing tool
	const selectDrawTool = useCallback((tool) => {
		setSelectedDrawTool(tool)
		setShowDrawToolSelector(false)
		setOptionListValue({
			drawList: {
				shouldReloadDrawItemIndex: tool === DrawTypeConstants.none ? DrawStateConstants.none : DrawStateConstants.showContext,
				drawShouldContinue: drawShouldContinue,
				drawType: tool,
				shouldFixDraw: false,
			}
		})
	}, [drawShouldContinue])

	// Clear drawings
	const clearDrawings = useCallback(() => {
		setSelectedDrawTool(DrawTypeConstants.none)
		setOptionListValue({
			drawList: {
				shouldReloadDrawItemIndex: DrawStateConstants.none,
				shouldClearDraw: true,
			}
		})
	}, [])

	// Reload K-line data
	const reloadKLineData = useCallback((shouldScrollToEnd = true) => {
		if (!kLineViewRef.current) {
			setTimeout(() => reloadKLineData(shouldScrollToEnd), 100)
			return
		}

		const processedData = processKLineData(klineData, {
			selectedMainIndicator,
			selectedSubIndicator,
			showVolumeChart
		}, isDarkTheme)
		const newOptionList = packOptionList(processedData, {
			isDarkTheme,
			selectedTimeType,
			selectedMainIndicator,
			selectedSubIndicator,
			selectedDrawTool,
			showIndicatorSelector,
			showTimeSelector,
			showDrawToolSelector,
			klineData,
			drawShouldContinue,
			optionList,
			isLoadingNewData,
			lastDataLength,
			currentScrollPosition,
			showVolumeChart,
			candleCornerRadius
		}, shouldScrollToEnd)
		setOptionListValue(newOptionList)
	}, [klineData, selectedMainIndicator, selectedSubIndicator, showVolumeChart, isDarkTheme, selectedTimeType, selectedDrawTool, showIndicatorSelector, showTimeSelector, showDrawToolSelector, drawShouldContinue, optionList, isLoadingNewData, lastDataLength, currentScrollPosition, candleCornerRadius])

	// Reload K-line data and adjust scroll position to maintain current view
	const reloadKLineDataWithScrollAdjustment = useCallback((addedDataCount) => {
		if (!kLineViewRef.current) {
			setTimeout(() => reloadKLineDataWithScrollAdjustment(addedDataCount), 100)
			return
		}

		const processedData = processKLineData(klineData, {
			selectedMainIndicator,
			selectedSubIndicator,
			showVolumeChart
		}, isDarkTheme)
		const newOptionList = packOptionList(processedData, {
			isDarkTheme,
			selectedTimeType,
			selectedMainIndicator,
			selectedSubIndicator,
			selectedDrawTool,
			showIndicatorSelector,
			showTimeSelector,
			showDrawToolSelector,
			klineData,
			drawShouldContinue,
			optionList,
			isLoadingNewData,
			lastDataLength,
			currentScrollPosition,
			showVolumeChart,
			candleCornerRadius
		}, false)

		// Calculate scroll distance adjustment needed (based on item width)
		const pixelRatio = Platform.select({
			android: PixelRatio.get(),
			ios: 1,
		})
		const itemWidth = 8 * pixelRatio // This matches itemWidth in configList
		const scrollAdjustment = addedDataCount * itemWidth

		// Set scroll position adjustment parameters
		newOptionList.scrollPositionAdjustment = scrollAdjustment

		console.log(`Adjust scroll position: ${addedDataCount} data points, scroll distance: ${scrollAdjustment}px`)

		setOptionListValue(newOptionList)
	}, [klineData, selectedMainIndicator, selectedSubIndicator, showVolumeChart, isDarkTheme, selectedTimeType, selectedDrawTool, showIndicatorSelector, showTimeSelector, showDrawToolSelector, drawShouldContinue, optionList, isLoadingNewData, lastDataLength, currentScrollPosition, candleCornerRadius])

	// Set optionList property
	const setOptionListValue = useCallback((optionList) => {
		setOptionList(JSON.stringify(optionList))
	}, [])

	// Drawing item touch event
	const onDrawItemDidTouch = useCallback((event) => {
		const { nativeEvent } = event
		console.log('Drawing item touched:', nativeEvent)
	}, [])

	// Chart touch event
	const onChartTouch = useCallback((event) => {
		const { nativeEvent } = event
		console.log('Chart touched:', nativeEvent)

		if (nativeEvent.isOnClosePriceLabel) {
			console.log('🎯 Touched close price label! Scroll to latest position')
			scrollToPresent()
		}
	}, [scrollToPresent])

	// Scroll to latest position
	const scrollToPresent = useCallback(() => {
		reloadKLineData(true)
	}, [reloadKLineData])

	// Drawing item complete event
	const onDrawItemComplete = useCallback((event) => {
		const { nativeEvent } = event
		console.log('Drawing item complete:', nativeEvent)

		// Processing after drawing completion
		if (!drawShouldContinue) {
			selectDrawTool(DrawTypeConstants.none)
		}
	}, [drawShouldContinue, selectDrawTool])

	// Drawing point complete event
	const onDrawPointComplete = useCallback((event) => {
		const { nativeEvent } = event
		console.log('Drawing point complete:', nativeEvent.pointCount)

		// Can display current drawing progress here
		const currentTool = selectedDrawTool
		const totalPoints = DrawToolHelper.count(currentTool)

		if (totalPoints > 0) {
			const progress = `${nativeEvent.pointCount}/${totalPoints}`
			console.log(`Drawing progress: ${progress}`)
		}
	}, [selectedDrawTool])

	// Handle new data loading triggered by left swipe
	const handleScrollLeft = useCallback((event) => {
		console.log('onScrollLeft triggered - less than 100 candlesticks to the left, timestamp:', event.nativeEvent.timestamp)

		if (isLoadingNewData) {
			return // Prevent duplicate loading
		}

		setIsLoadingNewData(true)

		// Simulate asynchronous data loading
		setTimeout(() => {
			loadMoreHistoricalData()
		}, 500)
	}, [isLoadingNewData, loadMoreHistoricalData])

	// Load more historical data
	const loadMoreHistoricalData = useCallback(() => {
		console.log("loadMoreHistoricalData called")
		const currentData = klineData
		const newHistoricalData = generateMoreHistoricalData(currentData, 200)
		const combinedData = [...newHistoricalData, ...currentData]

		console.log(`Loaded ${newHistoricalData.length} new historical K-line data points`)

		// Calculate scroll offset adjustment needed to maintain current view
		const addedDataCount = newHistoricalData.length

		setKlineData(combinedData)
		setLastDataLength(currentData.length)
		setIsLoadingNewData(false)

		// Reload data and maintain current view position
		setTimeout(() => reloadKLineDataWithScrollAdjustment(addedDataCount), 0)
	}, [klineData, reloadKLineDataWithScrollAdjustment])

	const renderKLineChart = useCallback((styles, theme) => {
		const directRender = (
			<RNKLineView
				ref={kLineViewRef}
				style={styles.chart}
				optionList={optionList}
				onDrawItemDidTouch={onDrawItemDidTouch}
				onScrollLeft={handleScrollLeft}
				onChartTouch={onChartTouch}
				onDrawItemComplete={onDrawItemComplete}
				onDrawPointComplete={onDrawPointComplete}
			/>
		)
		if (global?.nativeFabricUIManager && Platform.OS == 'ios') {
			return directRender
		}
		return (
			<View style={{ flex: 1 }} collapsable={false}>
				<View style={{ flex: 1 }} collapsable={false}>
					<View style={styles.chartContainer} collapsable={false}>
						{directRender}
					</View>
				</View>
			</View>
		)
	}, [optionList, onDrawItemDidTouch, handleScrollLeft, onChartTouch, onDrawItemComplete, onDrawPointComplete])

	const getStyles = useCallback((theme) => {
		return StyleSheet.create({
			container: {
				flex: 1,
				backgroundColor: theme.backgroundColor,
				paddingTop: isHorizontalScreen ? 10 : 50,
				paddingBottom: isHorizontalScreen ? 20 : 100,
			},
			chartContainer: {
				flex: 1,
				margin: 8,
				borderRadius: 8,
				backgroundColor: theme.backgroundColor,
				borderWidth: 1,
				borderColor: theme.gridColor,
			},
			chart: {
				flex: 1,
				backgroundColor: 'transparent',
			},
		})
	}, [])

	const theme = ThemeManager.getCurrentTheme(isDarkTheme)
	const styles = getStyles(theme)

	return (
		<View style={styles.container}>
			{/* Top toolbar */}
			<Toolbar
				theme={theme}
				isDarkTheme={isDarkTheme}
				onToggleTheme={toggleTheme}
			/>

			{/* K-line chart */}
			{renderKLineChart(styles, theme)}

			{/* Bottom control bar */}
			<ControlBar
				theme={theme}
				selectedTimeType={selectedTimeType}
				selectedMainIndicator={selectedMainIndicator}
				selectedSubIndicator={selectedSubIndicator}
				selectedDrawTool={selectedDrawTool}
				showVolumeChart={showVolumeChart}
				candleCornerRadius={candleCornerRadius}
				onShowTimeSelector={() => setShowTimeSelector(true)}
				onShowIndicatorSelector={() => setShowIndicatorSelector(true)}
				onToggleDrawToolSelector={() => {
					setShowDrawToolSelector(!showDrawToolSelector)
					setShowIndicatorSelector(false)
					setShowTimeSelector(false)
				}}
				onClearDrawings={clearDrawings}
				onToggleVolume={() => {
					setShowVolumeChart(!showVolumeChart)
					setTimeout(() => reloadKLineData(), 0)
				}}
				onToggleRounded={() => {
					setCandleCornerRadius(candleCornerRadius > 0 ? 0 : 1)
					setTimeout(() => reloadKLineData(), 0)
				}}
			/>

			{/* Selector popup */}
			<Selectors
				theme={theme}
				showTimeSelector={showTimeSelector}
				showIndicatorSelector={showIndicatorSelector}
				showDrawToolSelector={showDrawToolSelector}
				selectedTimeType={selectedTimeType}
				selectedMainIndicator={selectedMainIndicator}
				selectedSubIndicator={selectedSubIndicator}
				selectedDrawTool={selectedDrawTool}
				drawShouldContinue={drawShouldContinue}
				onSelectTimeType={selectTimeType}
				onSelectIndicator={selectIndicator}
				onSelectDrawTool={selectDrawTool}
				onCloseTimeSelector={() => setShowTimeSelector(false)}
				onCloseIndicatorSelector={() => setShowIndicatorSelector(false)}
				onToggleDrawShouldContinue={(value) => setDrawShouldContinue(value)}
			/>
		</View>
	)
}

export default App
