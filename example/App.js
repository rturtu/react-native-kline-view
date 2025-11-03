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
	const [selectedMainIndicator, setSelectedMainIndicator] = useState(1) // Corresponds to MA (1=MA, 2=BOLL)
	const [selectedSubIndicator, setSelectedSubIndicator] = useState(4) // Corresponds to KDJ (3=MACD, 4=KDJ, 5=RSI, 6=WR)
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
		console.log('handleScrollLeft triggered, isLoadingNewData:', isLoadingNewData)
		if (!isLoadingNewData) {
			console.log('Loading 200 new historical candlesticks at start')
			testAddCandlesticksAtTheStart()
		} else {
			console.log('Already loading data, skipping...')
		}
	}, [isLoadingNewData, testAddCandlesticksAtTheStart])

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

	// Test function to update last candlestick
	const testUpdateLastCandlestick = useCallback(() => {
		if (!kLineViewRef.current || klineData.length === 0) {
			console.warn('No chart ref or data available')
			return
		}

		const lastCandle = klineData[klineData.length - 1]

		// Create a modified version of the last candlestick with random price changes
		const priceChange = (0.01 - Math.random() * 0.02) * lastCandle.close // Random change between -1 and 1
		const volumeChange = Math.random() * 0.1 + 1 // Random multiplier between 0.75 and 1.25

		const newClose = Math.max(0.01, lastCandle.close + priceChange)
		// Use vol field (native code expects 'vol' not 'volume')
		const currentVolume = lastCandle.vol || 100000
		const newVolume = Math.round(currentVolume * volumeChange)
		// console.log('Volume calculation:', { currentVolume, volumeChange, newVolume })

		// Calculate MA indicators for the updated candlestick
		const currentIndex = klineData.length - 1

		// Helper function to safely get volume value
		const getSafeVolume = (item) => {
			const vol = item.vol || item.volume
			return isNaN(vol) || !isFinite(vol) ? 100000 : vol
		}

		// Calculate Volume MA5
		let volumeMa5 = newVolume
		if (currentIndex >= 4) {
			let sum = newVolume
			// Get the previous 4 candles (not including the current one being updated)
			for (let j = Math.max(0, currentIndex - 4); j < currentIndex; j++) {
				sum += getSafeVolume(klineData[j])
			}
			volumeMa5 = sum / 5
			// console.log('Volume MA5 calculation:', { newVolume, sum, volumeMa5, currentIndex })
		}

		// Calculate Volume MA10
		let volumeMa10 = newVolume
		if (currentIndex >= 9) {
			let sum = newVolume
			// Get the previous 9 candles (not including the current one being updated)
			for (let j = Math.max(0, currentIndex - 9); j < currentIndex; j++) {
				sum += getSafeVolume(klineData[j])
			}
			volumeMa10 = sum / 10
			// console.log('Volume MA10 calculation:', { newVolume, sum, volumeMa10, currentIndex })
		}

		// Calculate price MA indicators
		let ma5 = newClose
		if (currentIndex >= 4) {
			let sum = newClose
			for (let j = Math.max(0, currentIndex - 4); j < currentIndex; j++) {
				sum += klineData[j].close
			}
			ma5 = sum / 5
		}

		let ma10 = newClose
		if (currentIndex >= 9) {
			let sum = newClose
			for (let j = Math.max(0, currentIndex - 9); j < currentIndex; j++) {
				sum += klineData[j].close
			}
			ma10 = sum / 10
		}

		let ma20 = newClose
		if (currentIndex >= 19) {
			let sum = newClose
			for (let j = Math.max(0, currentIndex - 19); j < currentIndex; j++) {
				sum += klineData[j].close
			}
			ma20 = sum / 20
		}

		// Ensure all values are valid numbers
		const safeValue = (val, fallback = 0) => isNaN(val) || !isFinite(val) ? fallback : val

		// Remove the volume field to avoid confusion (we use vol)
		const { volume, ...lastCandleWithoutVolume } = lastCandle

		const updatedCandle = {
			...lastCandleWithoutVolume,
			close: newClose,
			high: Math.max(lastCandle.high, newClose + Math.abs(priceChange) * 0.5),
			low: Math.min(lastCandle.low, newClose - Math.abs(priceChange) * 0.5),
			vol: newVolume,
			// Ensure required fields are present
			id: lastCandle.id || lastCandle.time,
			dateString: lastCandle.dateString || new Date(lastCandle.time).toISOString(),
			// Add calculated indicator lists
			maList: [
				{ title: '5', value: safeValue(ma5, newClose), selected: true, index: 0 },
				{ title: '10', value: safeValue(ma10, newClose), selected: true, index: 1 },
				{ title: '20', value: safeValue(ma20, newClose), selected: true, index: 2 }
			],
			maVolumeList: [
				{ title: '5', value: safeValue(volumeMa5, 100000), selected: showVolumeChart, index: 0 },
				{ title: '10', value: safeValue(volumeMa10, 100000), selected: showVolumeChart, index: 1 }
			],
			rsiList: lastCandle.rsiList || [],
			wrList: lastCandle.wrList || [],
			selectedItemList: lastCandle.selectedItemList || [],
			// Add placeholder values for BOLL and KDJ indicators
			bollMb: newClose,  // Middle band (moving average)
			bollUp: newClose * 1.02,  // Upper band (simplified)
			bollDn: newClose * 0.98,  // Lower band (simplified)
			kdjK: 50,  // Placeholder K value
			kdjD: 50,  // Placeholder D value
			kdjJ: 50   // Placeholder J value
		}

		console.log('Updating last candlestick:', updatedCandle)
		// console.log('Volume MA values being sent:', {
		//	volumeMa5: updatedCandle.maVolumeList[0].value,
		//	volumeMa10: updatedCandle.maVolumeList[1].value,
		//	newVolume: updatedCandle.vol
		// })

		// Call the native method directly
		kLineViewRef.current.updateLastCandlestick(updatedCandle)
	}, [klineData, showVolumeChart])

	// Test function to add new candlesticks at the end
	const testAddCandlesticksAtTheEnd = useCallback(() => {
		if (!kLineViewRef.current || klineData.length === 0) {
			console.warn('No chart ref or data available')
			return
		}


		const lastCandle = klineData[klineData.length - 1]
		const numberOfNewCandles = 200 // Add 200 new candlesticks

		// Generate new candlesticks with indicators
		const newCandlesticks = []
		for (let i = 1; i <= numberOfNewCandles; i++) {
			const timeIncrement = 60000 * i // 1 minute intervals
			const basePrice = lastCandle.close
			const priceVariation = (Math.random() - 0.5) * basePrice * 0.02 // ±2% variation

			const open = Math.max(0.01, basePrice + (Math.random() - 0.5) * basePrice * 0.01)
			const close = Math.max(0.01, basePrice + priceVariation)
			const high = Math.max(open, close) + Math.random() * basePrice * 0.005
			const low = Math.min(open, close) - Math.random() * basePrice * 0.005
			const volume = Math.round(lastCandle.vol * (0.5 + Math.random()))

			// Calculate MA indicators based on historical data
			const tempAllData = [...klineData]
			const currentIndex = tempAllData.length + i - 1

			// Calculate MA5
			let ma5 = close
			if (currentIndex >= 4) {
				let sum = close
				for (let j = Math.max(0, tempAllData.length - 4 + i - 1); j < tempAllData.length; j++) {
					sum += tempAllData[j].close
				}
				ma5 = sum / 5
			}

			// Calculate MA10
			let ma10 = close
			if (currentIndex >= 9) {
				let sum = close
				for (let j = Math.max(0, tempAllData.length - 9 + i - 1); j < tempAllData.length; j++) {
					sum += tempAllData[j].close
				}
				ma10 = sum / 10
			}

			// Calculate MA20
			let ma20 = close
			if (currentIndex >= 19) {
				let sum = close
				for (let j = Math.max(0, tempAllData.length - 19 + i - 1); j < tempAllData.length; j++) {
					sum += tempAllData[j].close
				}
				ma20 = sum / 20
			}

			// Helper function to safely get volume value
			const getSafeVolume = (item) => {
				const vol = item.vol || item.volume
				return isNaN(vol) || !isFinite(vol) ? 100000 : vol
			}

			// Calculate Volume MA5
			let volumeMa5 = volume
			if (currentIndex >= 4) {
				let sum = volume
				for (let j = Math.max(0, tempAllData.length - 4 + i - 1); j < tempAllData.length; j++) {
					sum += getSafeVolume(tempAllData[j])
				}
				volumeMa5 = sum / 5
			}

			// Calculate Volume MA10
			let volumeMa10 = volume
			if (currentIndex >= 9) {
				let sum = volume
				for (let j = Math.max(0, tempAllData.length - 9 + i - 1); j < tempAllData.length; j++) {
					sum += getSafeVolume(tempAllData[j])
				}
				volumeMa10 = sum / 10
			}

			// Ensure all values are valid numbers
			const safeValue = (val, fallback = 0) => isNaN(val) || !isFinite(val) ? fallback : val

			const newCandle = {
				time: lastCandle.time + timeIncrement,
				open: parseFloat(open.toFixed(2)),
				high: parseFloat(high.toFixed(2)),
				low: parseFloat(low.toFixed(2)),
				close: parseFloat(close.toFixed(2)),
				vol: safeValue(volume, 100000), // Fallback to reasonable volume
				id: lastCandle.time + timeIncrement,
				dateString: new Date(lastCandle.time + timeIncrement).toISOString(),
				// Add indicator lists
				maList: [
					{ title: '5', value: safeValue(ma5, close), selected: true, index: 0 },
					{ title: '10', value: safeValue(ma10, close), selected: true, index: 1 },
					{ title: '20', value: safeValue(ma20, close), selected: true, index: 2 }
				],
				maVolumeList: [
					{ title: '5', value: safeValue(volumeMa5, 100000), selected: showVolumeChart, index: 0 },
					{ title: '10', value: safeValue(volumeMa10, 100000), selected: showVolumeChart, index: 1 }
				],
				rsiList: lastCandle.rsiList || [],
				wrList: lastCandle.wrList || [],
				selectedItemList: lastCandle.selectedItemList || [],
				// Add placeholder values for BOLL and KDJ indicators
				bollMb: close,  // Middle band (moving average)
				bollUp: close * 1.02,  // Upper band (simplified)
				bollDn: close * 0.98,  // Lower band (simplified)
				kdjK: 50,  // Placeholder K value
				kdjD: 50,  // Placeholder D value
				kdjJ: 50   // Placeholder J value
			}

			newCandlesticks.push(newCandle)
			// Add to temp array for next iteration calculations
			tempAllData.push(newCandle)
		}

		console.log('Adding', numberOfNewCandles, 'new candlesticks at the end:', newCandlesticks)

		// Update local state for future reference
		// setKlineData(prev => [...prev, ...newCandlesticks])

		// Call the native method directly
		kLineViewRef.current.addCandlesticksAtTheEnd(newCandlesticks)
	}, [klineData])

	// Test function to add new candlesticks at the start
	const testAddCandlesticksAtTheStart = useCallback(() => {
		if (!kLineViewRef.current || klineData.length === 0) {
			console.warn('No chart ref or data available')
			return
		}

		if (isLoadingNewData) {
			console.log('Already loading data, skipping...')
			return
		}

		setIsLoadingNewData(true)
		console.log('Starting to load 200 new historical candlesticks')

		const numberOfNewCandles = 200 // Load 200 candlesticks
		const newCandlesticks = []
		const firstCandle = klineData[0]
		const timeIncrement = -1 * 60 * 1000 // Go backward 1 minute

		// Create temp array for calculations (prepend to existing data)
		const tempAllData = [...klineData]

		for (let i = 0; i < numberOfNewCandles; i++) {
			// Generate price data going backward in time
			const basePrice = firstCandle.open
			const priceVariation = (Math.random() - 0.5) * basePrice * 0.02
			const open = Math.max(0.01, basePrice + priceVariation)
			const close = Math.max(0.01, basePrice + priceVariation)
			const high = Math.max(open, close) + Math.random() * basePrice * 0.005
			const low = Math.min(open, close) - Math.random() * basePrice * 0.005
			const volume = Math.round(firstCandle.vol * (0.5 + Math.random()))

			// Calculate MA indicators based on position in the prepended data
			const currentIndex = numberOfNewCandles - 1 - i // Position in the new data

			// Helper function to safely get volume value
			const getSafeVolume = (item) => {
				const vol = item.vol || item.volume
				return isNaN(vol) || !isFinite(vol) ? 100000 : vol
			}

			// Calculate Volume MA5 (for the start, use current volume as base)
			let volumeMa5 = volume
			// Since we're at the start, use simple fallback

			// Calculate Volume MA10
			let volumeMa10 = volume

			// Calculate MA5
			let ma5 = close

			// Calculate MA10
			let ma10 = close

			// Calculate MA20
			let ma20 = close

			// Ensure all values are valid numbers
			const safeValue = (val, fallback = 0) => isNaN(val) || !isFinite(val) ? fallback : val

			const newCandle = {
				time: firstCandle.time + (i + 1) * timeIncrement,
				open: parseFloat(open.toFixed(2)),
				high: parseFloat(high.toFixed(2)),
				low: parseFloat(low.toFixed(2)),
				close: parseFloat(close.toFixed(2)) - 200,
				vol: safeValue(volume, 100000), // Fallback to reasonable volume
				id: firstCandle.time + (i + 1) * timeIncrement,
				dateString: new Date(firstCandle.time + (i + 1) * timeIncrement).toISOString(),
				// Add indicator lists
				maList: [
					{ title: '5', value: safeValue(ma5, close), selected: true, index: 0 },
					{ title: '10', value: safeValue(ma10, close), selected: true, index: 1 },
					{ title: '20', value: safeValue(ma20, close), selected: true, index: 2 }
				],
				maVolumeList: [
					{ title: '5', value: safeValue(volumeMa5, 100000), selected: showVolumeChart, index: 0 },
					{ title: '10', value: safeValue(volumeMa10, 100000), selected: showVolumeChart, index: 1 }
				],
				rsiList: firstCandle.rsiList || [],
				wrList: firstCandle.wrList || [],
				selectedItemList: firstCandle.selectedItemList || [],
				// Add placeholder values for BOLL and KDJ indicators
				bollMb: close,  // Middle band (moving average)
				bollUp: close * 1.02,  // Upper band (simplified)
				bollDn: close * 0.98,  // Lower band (simplified)
				kdjK: 50,  // Placeholder K value
				kdjD: 50,  // Placeholder D value
				kdjJ: 50   // Placeholder J value
			}

			newCandlesticks.unshift(newCandle) // Add to beginning of array
		}

		console.log('Adding', numberOfNewCandles, 'new candlesticks at the start:')
		console.log("Last added candle", newCandlesticks[newCandlesticks.length - 1])
		console.log("Previous first candle", firstCandle)

		// Call the native method directly
		kLineViewRef.current.addCandlesticksAtTheStart(newCandlesticks)

		// // Reset loading state after a delay to allow chart to update
		// setTimeout(() => {
		// 	setIsLoadingNewData(false)
		// 	console.log('Loading state reset, ready for next load')
		// }, 1000)
	}, [klineData, showVolumeChart, isLoadingNewData])

	const renderKLineChart = useCallback((styles) => {
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
	console.log("App.js render", Platform.OS)

	return (
		<View style={styles.container}>
			{/* Top toolbar */}
			<Toolbar
				theme={theme}
				isDarkTheme={isDarkTheme}
				onToggleTheme={toggleTheme}
				onTestUpdate={testUpdateLastCandlestick}
				onTestAddCandles={testAddCandlesticksAtTheEnd}
				onTestAddCandlesAtStart={testAddCandlesticksAtTheStart}
			/>

			{/* K-line chart */}
			{renderKLineChart(styles)}

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
