/**
 * K-line Chart Example Application
 * Supports indicators, finger drawing, theme switching and other features
 */

import React, { Component } from 'react'
import { 
	View, 
	Text, 
	StyleSheet, 
	TouchableOpacity, 
	ScrollView,
	StatusBar,
	Dimensions,
	Switch,
	processColor,
	Platform,
	PixelRatio
} from 'react-native'
import RNKLineView from 'react-native-kline-view'
import {
	calculateBOLL,
	calculateMACD,
	calculateKDJ,
	calculateMAWithConfig,
	calculateVolumeMAWithConfig,
	calculateRSIWithConfig,
	calculateWRWithConfig
} from './utils/indicators'
import { ThemeManager, COLOR } from './utils/themes'
import {
	TimeConstants,
	TimeTypes,
	IndicatorTypes,
	DrawTypeConstants,
	DrawStateConstants,
	DrawToolTypes,
	DrawToolHelper,
	FORMAT
} from './utils/constants'
import {
	fixRound,
	formatTime,
	isHorizontalScreen,
	screenWidth,
	screenHeight
} from './utils/helpers'




class App extends Component {
	constructor(props) {
		super(props)
		
		this.state = {
			isDarkTheme: false,
			selectedTimeType: 2, // Corresponds to 1 minute
			selectedMainIndicator: 0, // Corresponds to MA
			selectedSubIndicator: 0, // Corresponds to MACD
			selectedDrawTool: DrawTypeConstants.none,
			showIndicatorSelector: false,
			showTimeSelector: false,
			showDrawToolSelector: false,
			klineData: this.generateMockData(),
			drawShouldContinue: true,
			optionList: null,
			isLoadingNewData: false,
			lastDataLength: 0,
			currentScrollPosition: 0,
			showVolumeChart: true,
			candleCornerRadius: 0
		}
	}

	componentDidMount() {
		this.updateStatusBar()
		// Initialize loading K-line data
		this.setState({ lastDataLength: this.state.klineData.length }, () => {
			this.reloadKLineData()
		})
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.isDarkTheme !== this.state.isDarkTheme) {
			this.updateStatusBar()
		}
	}

	updateStatusBar = () => {
		StatusBar.setBarStyle(
			this.state.isDarkTheme ? 'light-content' : 'dark-content',
			true
		)
	}

	// Generate mock K-line data
	generateMockData = () => {
		const data = []
		let lastClose = 50000
		const now = Date.now()
		
		for (let i = 0; i < 200; i++) {
			const time = now - (200 - i) * 1 * 60 * 1000 // 15-minute interval
			
			// Next open equals previous close, ensuring continuity
			const open = lastClose
			
			// Generate reasonable high and low prices
			const volatility = 0.02 // 2% volatility
			const change = (Math.random() - 0.5) * open * volatility
			const close = Math.max(open + change, open * 0.95) // Maximum decline 5%
			
			// Ensure high >= max(open, close), low <= min(open, close)
			const maxPrice = Math.max(open, close)
			const minPrice = Math.min(open, close)
			const high = maxPrice + Math.random() * open * 0.01 // Max 1% higher
			const low = minPrice - Math.random() * open * 0.01 // Max 1% lower
			
			const volume = (0.5 + Math.random()) * 1000000 // Volume from 500K to 1.5M
			
			data.push({
				time: time,
				open: parseFloat(open.toFixed(2)),
				high: parseFloat(high.toFixed(2)),
				low: parseFloat(low.toFixed(2)),
				close: parseFloat(close.toFixed(2)),
				volume: parseFloat(volume.toFixed(2))
			})
			
			lastClose = close
		}
		
		return data
	}

	// Toggle theme
	toggleTheme = () => {
		this.setState({ isDarkTheme: !this.state.isDarkTheme }, () => {
			// Reload data after theme switch to apply new colors
			this.reloadKLineData()
		})
	}

	// Select time period
	selectTimeType = (timeType) => {
		this.setState({ 
			selectedTimeType: timeType,
			showTimeSelector: false
		}, () => {
			// Regenerate data and reload
			this.setState({ klineData: this.generateMockData() }, () => {
				this.reloadKLineData()
			})
		})
		console.log('Switch time period:', TimeTypes[timeType].label)
	}

	// Select indicator
	selectIndicator = (type, indicator) => {
		if (type === 'main') {
			this.setState({ selectedMainIndicator: indicator }, () => {
				this.reloadKLineData()
			})
		} else {
			this.setState({ selectedSubIndicator: indicator }, () => {
				this.reloadKLineData()
			})
		}
		this.setState({ showIndicatorSelector: false })
	}

	// Select drawing tool
	selectDrawTool = (tool) => {
		this.setState({ 
			selectedDrawTool: tool,
			showDrawToolSelector: false,
		})
    this.setOptionList({
      drawList: {
        shouldReloadDrawItemIndex: tool === DrawTypeConstants.none ? DrawStateConstants.none : DrawStateConstants.showContext,
        drawShouldContinue: this.state.drawShouldContinue,
        drawType: tool,
        shouldFixDraw: false,
      }
    })
	}

	// Clear drawings
	clearDrawings = () => {
		this.setState({
      selectedDrawTool: DrawTypeConstants.none,
      }, () => {
        this.setOptionList({
          drawList: {
            shouldReloadDrawItemIndex: DrawStateConstants.none,
            shouldClearDraw: true,
          }
        })
      })
	}

	// Reload K-line data
	reloadKLineData = (shouldScrollToEnd = true) => {
		if (!this.kLineViewRef) {
			setTimeout(() => this.reloadKLineData(shouldScrollToEnd), 100)
			return
		}

		const processedData = this.processKLineData(this.state.klineData)
		const optionList = this.packOptionList(processedData, shouldScrollToEnd)
		this.setOptionList(optionList)
	}

	// Reload K-line data and adjust scroll position to maintain current view
	reloadKLineDataWithScrollAdjustment = (addedDataCount) => {
		if (!this.kLineViewRef) {
			setTimeout(() => this.reloadKLineDataWithScrollAdjustment(addedDataCount), 100)
			return
		}

		const processedData = this.processKLineData(this.state.klineData)
		const optionList = this.packOptionList(processedData, false)

		// Calculate scroll distance adjustment needed (based on item width)
		const pixelRatio = Platform.select({
			android: PixelRatio.get(),
			ios: 1,
		})
		const itemWidth = 8 * pixelRatio // This matches itemWidth in configList
		const scrollAdjustment = addedDataCount * itemWidth

		// Set scroll position adjustment parameters
		optionList.scrollPositionAdjustment = scrollAdjustment

		console.log(`Adjust scroll position: ${addedDataCount} data points, scroll distance: ${scrollAdjustment}px`)

		this.setOptionList(optionList)
	}

	// Process K-line data, add technical indicator calculations
	processKLineData = (rawData) => {
		// Simulate symbol configuration
		const symbol = {
			price: 2, // Price precision
			volume: 0 // Volume precision
		}
		const priceCount = symbol.price
		const volumeCount = symbol.volume
		
		// Get target configuration
		const targetList = this.getTargetList()
		
		// Calculate all technical indicators
		let processedData = rawData.map(item => ({
			...item,
			id: item.time,
			open: item.open,
			high: item.high,
			low: item.low,
			close: item.close,
			vol: item.volume,
		}))
		
		// Calculate technical indicators based on targetList configuration
		processedData = this.calculateIndicatorsFromTargetList(processedData, targetList)
		
		return processedData.map((item, index) => {
			// Time formatting
			let time = formatTime(item.id, 'MM-DD HH:mm')
			
			// Calculate price change amount and percentage
			let appendValue = item.close - item.open
			let appendPercent = appendValue / item.open * 100
			let isAppend = appendValue >= 0
			let prefixString = isAppend ? '+' : '-'
			let appendValueString = prefixString + fixRound(Math.abs(appendValue), priceCount, true, false)
			let appendPercentString = prefixString + fixRound(Math.abs(appendPercent), 2, true, false) + '%'
			
			// Color configuration
			const theme = ThemeManager.getCurrentTheme(this.state.isDarkTheme)
			let color = isAppend ? processColor(theme.increaseColor) : processColor(theme.decreaseColor)
			
			// Add formatted fields
			item.dateString = `${time}`
			item.selectedItemList = [
					{ title: FORMAT('Time'), detail: `${time}` },
					{ title: FORMAT('Open'), detail: fixRound(item.open, priceCount, true, false) },
					{ title: FORMAT('High'), detail: fixRound(item.high, priceCount, true, false) },
					{ title: FORMAT('Low'), detail: fixRound(item.low, priceCount, true, false) },
					{ title: FORMAT('Close'), detail: fixRound(item.close, priceCount, true, false) },
					{ title: FORMAT('Change'), detail: appendValueString, color },
					{ title: FORMAT('Change %'), detail: appendPercentString, color },
					{ title: FORMAT('Volume'), detail: fixRound(item.vol, volumeCount, true, false) }
			]
			
			// Add technical indicator display info to selectedItemList
			this.addIndicatorToSelectedList(item, targetList, priceCount)
			
			return item
		})
	}

	// Pack option list
	packOptionList = (modelArray, shouldScrollToEnd = true) => {
		const theme = ThemeManager.getCurrentTheme(this.state.isDarkTheme)
		
		// Basic configuration
		const pixelRatio = Platform.select({
			android: PixelRatio.get(),
			ios: 1,
		})

		const configList = {
			colorList: {
				increaseColor: processColor(theme.increaseColor),
				decreaseColor: processColor(theme.decreaseColor),
			},
			targetColorList: [
        processColor(COLOR(0.96, 0.86, 0.58)),
        processColor(COLOR(0.38, 0.82, 0.75)),
        processColor(COLOR(0.8, 0.57, 1)),
        processColor(COLOR(1, 0.23, 0.24)),
        processColor(COLOR(0.44, 0.82, 0.03)),
        processColor(COLOR(0.44, 0.13, 1)),
			],
			minuteLineColor: processColor(theme.minuteLineColor),
			minuteGradientColorList: [
				processColor(COLOR(0.094117647, 0.341176471, 0.831372549, 0.149019608)), // 15% transparent blue
				processColor(COLOR(0.266666667, 0.501960784, 0.972549020, 0.149019608)), // 26% transparent blue
				processColor(COLOR(0.074509804, 0.121568627, 0.188235294, 0)), // Fully transparent
				processColor(COLOR(0.074509804, 0.121568627, 0.188235294, 0)), // Fully transparent
			],
			minuteGradientLocationList: [0, 0.3, 0.6, 1],
			backgroundColor: processColor(theme.backgroundColor),
			textColor: processColor(theme.detailColor),
			gridColor: processColor(theme.gridColor),
			candleTextColor: processColor(theme.titleColor),
			panelBackgroundColor: processColor(this.state.isDarkTheme ? COLOR(0.03, 0.09, 0.14, 0.9) : COLOR(1, 1, 1, 0.95)), // 95% transparency
			panelBorderColor: processColor(theme.detailColor),
			panelTextColor: processColor(theme.titleColor),
			selectedPointContainerColor: processColor('transparent'),
			selectedPointContentColor: processColor(this.state.isDarkTheme ? theme.titleColor : 'white'),
			closePriceCenterBackgroundColor: processColor(theme.backgroundColor9703),
			closePriceCenterBorderColor: processColor(theme.textColor7724),
			closePriceCenterTriangleColor: processColor(theme.textColor7724),
			closePriceCenterSeparatorColor: processColor(theme.detailColor),
			closePriceRightBackgroundColor: processColor(theme.backgroundColor),
			closePriceRightSeparatorColor: processColor(theme.backgroundColorBlue),
			closePriceRightLightLottieFloder: 'images',
			closePriceRightLightLottieScale: 0.4,
			panelGradientColorList: this.state.isDarkTheme ? [
				processColor(COLOR(0.0588235, 0.101961, 0.160784, 0.2)),
				processColor(COLOR(0.811765, 0.827451, 0.913725, 0.101961)),
				processColor(COLOR(0.811765, 0.827451, 0.913725, 0.2)),
				processColor(COLOR(0.811765, 0.827451, 0.913725, 0.101961)),
				processColor(COLOR(0.0784314, 0.141176, 0.223529, 0.2)),
			] : [
				processColor(COLOR(1, 1, 1, 0)),
				processColor(COLOR(0.54902, 0.623529, 0.678431, 0.101961)),
				processColor(COLOR(0.54902, 0.623529, 0.678431, 0.25098)),
				processColor(COLOR(0.54902, 0.623529, 0.678431, 0.101961)),
				processColor(COLOR(1, 1, 1, 0)),
			],
			panelGradientLocationList: [0, 0.25, 0.5, 0.75, 1],
			mainFlex: this.state.showVolumeChart
				? (this.state.selectedSubIndicator === 0 ? (isHorizontalScreen ? 0.75 : 0.85) : 0.6)
				: (this.state.selectedSubIndicator === 0 ? 1.0 : 0.75),
			volumeFlex: this.state.showVolumeChart ? (isHorizontalScreen ? 0.25 : 0.15) : 0,
			paddingTop: 20 * pixelRatio,
			paddingBottom: 20 * pixelRatio,
			paddingRight: 50 * pixelRatio,
			itemWidth: 8 * pixelRatio,
			candleWidth: 6 * pixelRatio,
			candleCornerRadius: this.state.candleCornerRadius * pixelRatio,
			minuteVolumeCandleColor: processColor(this.state.showVolumeChart ? COLOR(0.0941176, 0.509804, 0.831373, 0.501961) : 'transparent'),
			minuteVolumeCandleWidth: this.state.showVolumeChart ? 2 * pixelRatio : 0,
			macdCandleWidth: 1 * pixelRatio,
			headerTextFontSize: 10 * pixelRatio,
			rightTextFontSize: 10 * pixelRatio,
			candleTextFontSize: 10 * pixelRatio,
			panelTextFontSize: 10 * pixelRatio,
			panelMinWidth: 130 * pixelRatio,
			fontFamily: Platform.select({
				ios: 'DINPro-Medium',
				android: ''
			}),
      closePriceRightLightLottieSource: '',
		}

		// Use unified target configuration
		const targetList = this.getTargetList()

		let drawList = {
			'shotBackgroundColor': processColor(theme.backgroundColor),
			// Basic drawing configuration
			'drawType': this.state.selectedDrawTool,
			'shouldReloadDrawItemIndex': DrawStateConstants.none,
			'drawShouldContinue': this.state.drawShouldContinue,
			'drawColor': processColor(COLOR(1, 0.46, 0.05)),
			'drawLineHeight': 2,
			'drawDashWidth': 4,
			'drawDashSpace': 4,
			'drawIsLock': false,
			'shouldFixDraw': false,
			'shouldClearDraw': false
		}

		return {
			modelArray: modelArray,
			shouldScrollToEnd: shouldScrollToEnd,
			targetList: targetList,
			price: 2, // Price precision
			volume: 0, // Volume precision
			primary: this.state.selectedMainIndicator,
			second: this.state.selectedSubIndicator,
			time: TimeTypes[this.state.selectedTimeType].value,
			configList: configList,
			drawList: drawList
		}
	}

	// Set optionList property
	setOptionList = (optionList) => {
		this.setState({
			optionList: JSON.stringify(optionList)
		})
	}

	// Indicator judgment helper methods
	isMASelected = () => this.state.selectedMainIndicator === 1
	isBOLLSelected = () => this.state.selectedMainIndicator === 2
	isMACDSelected = () => this.state.selectedSubIndicator === 3
	isKDJSelected = () => this.state.selectedSubIndicator === 4
	isRSISelected = () => this.state.selectedSubIndicator === 5
	isWRSelected = () => this.state.selectedSubIndicator === 6

	// Get target configuration list
	getTargetList = () => {
		return {
			maList: [
				{ title: '5', selected: this.isMASelected(), index: 0 },
				{ title: '10', selected: this.isMASelected(), index: 1 },
				{ title: '20', selected: this.isMASelected(), index: 2 },
			],
			maVolumeList: [
				{ title: '5', selected: this.state.showVolumeChart, index: 0 },
				{ title: '10', selected: this.state.showVolumeChart, index: 1 },
			],
			bollN: '20',
			bollP: '2',
			macdS: '12',
			macdL: '26',
			macdM: '9',
			kdjN: '9',
			kdjM1: '3',
			kdjM2: '3',
			rsiList: [
				{ title: '6', selected: this.isRSISelected(), index: 0 },
				{ title: '12', selected: this.isRSISelected(), index: 1 },
				{ title: '24', selected: this.isRSISelected(), index: 2 },
			],
			wrList: [
				{ title: '14', selected: this.isWRSelected(), index: 0 },
			],
		}
	}

	// Calculate technical indicators based on target configuration
	calculateIndicatorsFromTargetList = (data, targetList) => {
		let processedData = [...data]
		
		// Calculate MA indicator
		const selectedMAPeriods = targetList.maList
			.filter(item => item.selected)
			.map(item => ({ period: parseInt(item.title, 10), index: item.index }))
		
		if (selectedMAPeriods.length > 0) {
			processedData = calculateMAWithConfig(processedData, selectedMAPeriods)
		}
		
		// Calculate volume MA indicator
		const selectedVolumeMAPeriods = targetList.maVolumeList
			.filter(item => item.selected)
			.map(item => ({ period: parseInt(item.title, 10), index: item.index }))

		if (selectedVolumeMAPeriods.length > 0 && this.state.showVolumeChart) {
			processedData = calculateVolumeMAWithConfig(processedData, selectedVolumeMAPeriods)
		}
		
		// Calculate BOLL indicator
		if (this.isBOLLSelected()) {
			processedData = calculateBOLL(processedData, parseInt(targetList.bollN, 10), parseInt(targetList.bollP, 10))
		}
		
		// Calculate MACD indicator
		if (this.isMACDSelected()) {
			processedData = calculateMACD(processedData, 
				parseInt(targetList.macdS, 10), 
				parseInt(targetList.macdL, 10), 
				parseInt(targetList.macdM, 10))
		}
		
		// Calculate KDJ indicator
		if (this.isKDJSelected()) {
			processedData = calculateKDJ(processedData, 
				parseInt(targetList.kdjN, 10), 
				parseInt(targetList.kdjM1, 10), 
				parseInt(targetList.kdjM2, 10))
		}
		
		// Calculate RSI indicator
		const selectedRSIPeriods = targetList.rsiList
			.filter(item => item.selected)
			.map(item => ({ period: parseInt(item.title, 10), index: item.index }))
		
		if (selectedRSIPeriods.length > 0) {
			processedData = calculateRSIWithConfig(processedData, selectedRSIPeriods)
		}
		
		// Calculate WR indicator
		const selectedWRPeriods = targetList.wrList
			.filter(item => item.selected)
			.map(item => ({ period: parseInt(item.title, 10), index: item.index }))
		
		if (selectedWRPeriods.length > 0) {
			processedData = calculateWRWithConfig(processedData, selectedWRPeriods)
		}
		
		return processedData
	}


	// Add technical indicators to selected item list
	addIndicatorToSelectedList = (item, targetList, priceCount) => {
		// Add MA indicator display
		if (this.isMASelected() && item.maList) {
			item.maList.forEach((maItem, index) => {
				if (maItem && maItem.title) {
					item.selectedItemList.push({
						title: `MA${maItem.title}`,
						detail: fixRound(maItem.value, priceCount, false, false)
					})
				}
			})
		}
		
		// Add BOLL indicator display
		if (this.isBOLLSelected() && item.bollMb !== undefined) {
			item.selectedItemList.push(
				{ title: 'BOLL Upper', detail: fixRound(item.bollUp, priceCount, false, false) },
				{ title: 'BOLL Mid', detail: fixRound(item.bollMb, priceCount, false, false) },
				{ title: 'BOLL Lower', detail: fixRound(item.bollDn, priceCount, false, false) }
			)
		}
		
		// Add MACD indicator display
		if (this.isMACDSelected() && (item.macdDif !== undefined)) {
			item.selectedItemList.push(
				{ title: 'DIF', detail: fixRound(item.macdDif, 4, false, false) },
				{ title: 'DEA', detail: fixRound(item.macdDea, 4, false, false) },
				{ title: 'MACD', detail: fixRound(item.macdValue, 4, false, false) }
			)
		}
		
		// Add KDJ indicator display
		if (this.isKDJSelected() && item.kdjK !== undefined) {
			item.selectedItemList.push(
				{ title: 'K', detail: fixRound(item.kdjK, 2, false, false) },
				{ title: 'D', detail: fixRound(item.kdjD, 2, false, false) },
				{ title: 'J', detail: fixRound(item.kdjJ, 2, false, false) }
			)
		}
		
		// Add RSI indicator display
		if (this.isRSISelected() && item.rsiList) {
			item.rsiList.forEach((rsiItem, index) => {
				if (rsiItem && rsiItem.title) {
					item.selectedItemList.push({
						title: `RSI${rsiItem.title}`,
						detail: fixRound(rsiItem.value, 2, false, false)
					})
				}
			})
		}
		
		// Add WR indicator display
		if (this.isWRSelected() && item.wrList) {
			item.wrList.forEach((wrItem, index) => {
				if (wrItem && wrItem.title) {
					item.selectedItemList.push({
						title: `WR${wrItem.title}`,
						detail: fixRound(wrItem.value, 2, false, false)
					})
				}
			})
		}
	}

	// Drawing item touch event
	onDrawItemDidTouch = (event) => {
		const { nativeEvent } = event
		console.log('Drawing item touched:', nativeEvent)
	}

	// Chart touch event
	onChartTouch = (event) => {
		const { nativeEvent } = event
		console.log('Chart touched:', nativeEvent)

		if (nativeEvent.isOnClosePriceLabel) {
			console.log('🎯 Touched close price label! Scroll to latest position')
			this.scrollToPresent()
		}
	}

	// Scroll to latest position
	scrollToPresent = () => {
		this.reloadKLineData(true)
	}

	// Drawing item complete event
	onDrawItemComplete = (event) => {
		const { nativeEvent } = event
		console.log('Drawing item complete:', nativeEvent)
		
		// Processing after drawing completion
		if (!this.state.drawShouldContinue) {
			this.selectDrawTool(DrawTypeConstants.none)
		}
	}

	// Drawing point complete event
	onDrawPointComplete = (event) => {
		const { nativeEvent } = event
		console.log('Drawing point complete:', nativeEvent.pointCount)

		// Can display current drawing progress here
		const currentTool = this.state.selectedDrawTool
		const totalPoints = DrawToolHelper.count(currentTool)

		if (totalPoints > 0) {
			const progress = `${nativeEvent.pointCount}/${totalPoints}`
			console.log(`Drawing progress: ${progress}`)
		}
	}

	// Handle new data loading triggered by left swipe
	handleScrollLeft = (event) => {
		console.log('onScrollLeft triggered - less than 100 candlesticks to the left, timestamp:', event.nativeEvent.timestamp)

		if (this.state.isLoadingNewData) {
			return // Prevent duplicate loading
		}

		this.setState({ isLoadingNewData: true })

		// Simulate asynchronous data loading
		setTimeout(() => {
			this.loadMoreHistoricalData()
		}, 500)
	}

	// Generate more historical data
	generateMoreHistoricalData = (existingData, count = 200) => {
		const newData = []
		const firstItem = existingData[0]
		let lastClose = firstItem.open

		for (let i = count; i > 0; i--) {
			const time = firstItem.time - i * 1 * 60 * 1000 // 15-minute interval, pushing backward

			const open = lastClose
			const volatility = 0.02
			const change = (Math.random() - 0.5) * open * volatility
			const close = Math.max(open + change, open * 0.95)

			const maxPrice = Math.max(open, close)
			const minPrice = Math.min(open, close)
			const high = maxPrice + Math.random() * open * 0.01
			const low = minPrice - Math.random() * open * 0.01

			const volume = (0.5 + Math.random()) * 1000000

			newData.push({
				time: time,
				open: parseFloat(open.toFixed(2)),
				high: parseFloat(high.toFixed(2)),
				low: parseFloat(low.toFixed(2)),
				close: parseFloat(close.toFixed(2)),
				volume: parseFloat(volume.toFixed(2))
			})

			lastClose = close
		}

		return newData
	}

	// Load more historical data
	loadMoreHistoricalData = () => {
		console.log("loadMoreHistoricalData called")
		const currentData = this.state.klineData
		const newHistoricalData = this.generateMoreHistoricalData(currentData, 200)
		const combinedData = [...newHistoricalData, ...currentData]

		console.log(`Loaded ${newHistoricalData.length} new historical K-line data points`)

		// Calculate scroll offset adjustment needed to maintain current view
		const addedDataCount = newHistoricalData.length

		this.setState({
			klineData: combinedData,
			lastDataLength: currentData.length,
			isLoadingNewData: false
		}, () => {
			// Reload data and maintain current view position
			this.reloadKLineDataWithScrollAdjustment(addedDataCount)
		})
	}

	render() {
		const theme = ThemeManager.getCurrentTheme(this.state.isDarkTheme)
		const styles = this.getStyles(theme)

		return (
			<View style={styles.container}>
				{/* Top toolbar */}
				{this.renderToolbar(styles, theme)}
				
				{/* K-line chart */}
				{this.renderKLineChart(styles, theme)}
				
				{/* Bottom control bar */}
				{this.renderControlBar(styles, theme)}
				
				{/* Selector popup */}
				{this.renderSelectors(styles, theme)}
			</View>
		)
	}

	renderToolbar = (styles, theme) => {
		return (
			<View style={styles.toolbar}>
				<Text style={styles.title}>K-line Chart</Text>
				<View style={styles.toolbarRight}>
					<Text style={styles.themeLabel}>
						{this.state.isDarkTheme ? 'Night' : 'Day'}
					</Text>
					<Switch
						value={this.state.isDarkTheme}
						onValueChange={this.toggleTheme}
						trackColor={{ false: '#E0E0E0', true: theme.buttonColor }}
						thumbColor={this.state.isDarkTheme ? '#FFFFFF' : '#F4F3F4'}
					/>
				</View>
			</View>
		)
	}

	renderKLineChart = (styles, theme) => {
    const directRender = (
      <RNKLineView
        ref={ref => { this.kLineViewRef = ref }}
        style={styles.chart}
        optionList={this.state.optionList}
        onDrawItemDidTouch={this.onDrawItemDidTouch}
				onScrollLeft={this.handleScrollLeft}
        onChartTouch={this.onChartTouch}
        onDrawItemComplete={this.onDrawItemComplete}
        onDrawPointComplete={this.onDrawPointComplete}
      />
    )
    if (global?.nativeFabricUIManager && Platform.OS == 'ios') {
      return directRender
    }
    return (
      <View style={{ flex: 1 }} collapsable={false}>
        <View style={{ flex: 1 }} collapsable={false}>
          <View style={styles.chartContainer} collapsable={false}>
          { directRender }
          </View>
        </View>
      </View>
    )
	}

	renderControlBar = (styles, theme) => {
		return (
			<View style={styles.controlBar}>
				<TouchableOpacity 
					style={styles.controlButton}
					onPress={() => this.setState({ showTimeSelector: true })}
				>
					<Text style={styles.controlButtonText}>
						{TimeTypes[this.state.selectedTimeType].label}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					style={styles.controlButton}
					onPress={() => this.setState({ showIndicatorSelector: true })}
				>
					<Text style={styles.controlButtonText}>
						{IndicatorTypes.main[this.state.selectedMainIndicator].label}/{IndicatorTypes.sub[this.state.selectedSubIndicator].label}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.toolbarButton, this.state.selectedDrawTool !== DrawTypeConstants.none && styles.activeButton]}
					onPress={() => this.setState({ 
						showDrawToolSelector: !this.state.showDrawToolSelector,
						showIndicatorSelector: false,
						showTimeSelector: false
					})}>
					<Text style={[
						styles.buttonText, 
						this.state.selectedDrawTool !== DrawTypeConstants.none && styles.activeButtonText
					]}>
						{this.state.selectedDrawTool !== DrawTypeConstants.none 
							? DrawToolHelper.name(this.state.selectedDrawTool)
							: 'Draw'
						}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.controlButton}
					onPress={this.clearDrawings}
				>
					<Text style={styles.controlButtonText}>
						Clear
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.controlButton, this.state.showVolumeChart && styles.activeButton]}
					onPress={() => this.setState({ showVolumeChart: !this.state.showVolumeChart }, () => {
						this.reloadKLineData()
					})}
				>
					<Text style={[styles.controlButtonText, this.state.showVolumeChart && styles.activeButtonText]}>
						Volume
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.controlButton, this.state.candleCornerRadius > 0 && styles.activeButton]}
					onPress={() => this.setState({ candleCornerRadius: this.state.candleCornerRadius > 0 ? 0 : 1 }, () => {
						this.reloadKLineData()
					})}
				>
					<Text style={[styles.controlButtonText, this.state.candleCornerRadius > 0 && styles.activeButtonText]}>
						Rounded
					</Text>
				</TouchableOpacity>
			</View>
		)
	}

	renderSelectors = (styles, theme) => {
		return (
			<>
				{/* Time selector */}
				{this.state.showTimeSelector && (
					<View style={styles.selectorOverlay}>
						<View style={styles.selectorModal}>
							<Text style={styles.selectorTitle}>Select Time Period</Text>
							<ScrollView style={styles.selectorList}>
								{Object.keys(TimeTypes).map((timeTypeKey) => {
									const timeType = parseInt(timeTypeKey, 10)
									return (
										<TouchableOpacity
											key={timeType}
											style={[
												styles.selectorItem,
												this.state.selectedTimeType === timeType && styles.selectedItem
											]}
											onPress={() => this.selectTimeType(timeType)}
										>
											<Text style={[
												styles.selectorItemText,
												this.state.selectedTimeType === timeType && styles.selectedItemText
											]}>
												{TimeTypes[timeType].label}
											</Text>
										</TouchableOpacity>
									)
								})}
							</ScrollView>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => this.setState({ showTimeSelector: false })}
							>
								<Text style={styles.closeButtonText}>Close</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

				{/* Indicator selector */}
				{this.state.showIndicatorSelector && (
					<View style={styles.selectorOverlay}>
						<View style={styles.selectorModal}>
							<Text style={styles.selectorTitle}>Select Indicator</Text>
							<ScrollView style={styles.selectorList}>
								{Object.keys(IndicatorTypes).map((type) => (
									<View key={type}>
										<Text style={styles.selectorSectionTitle}>
											{type === 'main' ? 'Main Chart' : 'Sub Chart'}
										</Text>
										{Object.keys(IndicatorTypes[type]).map((indicatorKey) => {
											const indicator = parseInt(indicatorKey, 10)
											return (
												<TouchableOpacity
													key={indicator}
													style={[
														styles.selectorItem,
														((type === 'main' && this.state.selectedMainIndicator === indicator) ||
														 (type === 'sub' && this.state.selectedSubIndicator === indicator)) && styles.selectedItem
													]}
													onPress={() => this.selectIndicator(type, indicator)}
												>
													<Text style={[
														styles.selectorItemText,
														((type === 'main' && this.state.selectedMainIndicator === indicator) ||
														 (type === 'sub' && this.state.selectedSubIndicator === indicator)) && styles.selectedItemText
													]}>
														{IndicatorTypes[type][indicator].label}
													</Text>
												</TouchableOpacity>
											)
										})}
									</View>
								))}
							</ScrollView>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => this.setState({ showIndicatorSelector: false })}
							>
								<Text style={styles.closeButtonText}>Close</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

				{/* Drawing tool selector */}
				{this.state.showDrawToolSelector && (
					<View style={styles.selectorContainer}>
						{Object.keys(DrawToolTypes).map(toolKey => (
							<TouchableOpacity
								key={toolKey}
								style={[
									styles.selectorItem,
									this.state.selectedDrawTool === parseInt(toolKey, 10) && styles.selectedItem
								]}
								onPress={() => this.selectDrawTool(parseInt(toolKey, 10))}>
								<Text style={[
									styles.selectorItemText,
									this.state.selectedDrawTool === parseInt(toolKey, 10) && styles.selectedItemText
								]}>
									{DrawToolTypes[toolKey].label}
								</Text>
							</TouchableOpacity>
						))}
            <Text style={styles.selectorItemText}>Continuous Drawing: </Text><Switch value={this.state.drawShouldContinue} onValueChange={(value) => {
              this.setState({ drawShouldContinue: value })
            }} />
					</View>
				)}
			</>
		)
	}

	getStyles = (theme) => {
		return StyleSheet.create({
			container: {
				flex: 1,
				backgroundColor: theme.backgroundColor,
				paddingTop: isHorizontalScreen ? 10 : 50,
        paddingBottom: isHorizontalScreen ? 20 : 100,
			},
			toolbar: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				paddingHorizontal: 16,
				paddingVertical: 12,
				backgroundColor: theme.headerColor,
				borderBottomWidth: 1,
				borderBottomColor: theme.gridColor,
			},
			title: {
				fontSize: 18,
				fontWeight: 'bold',
				color: theme.textColor,
			},
			toolbarRight: {
				flexDirection: 'row',
				alignItems: 'center',
			},
			themeLabel: {
				fontSize: 14,
				color: theme.textColor,
				marginRight: 8,
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
			controlBar: {
				flexDirection: 'row',
				justifyContent: 'space-around',
				flexWrap: 'wrap',
				alignItems: 'center',
				paddingHorizontal: 16,
				paddingVertical: 12,
				backgroundColor: theme.headerColor,
				borderTopWidth: 1,
				borderTopColor: theme.gridColor,
			},
			controlButton: {
				paddingHorizontal: 16,
				paddingVertical: 8,
				borderRadius: 20,
				backgroundColor: theme.buttonColor,
			},
			activeButton: {
				backgroundColor: theme.increaseColor,
			},
			controlButtonText: {
				fontSize: 14,
				color: '#FFFFFF',
				fontWeight: '500',
			},
			activeButtonText: {
				color: '#FFFFFF',
			},
			selectorOverlay: {
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				justifyContent: 'center',
				alignItems: 'center',
			},
			selectorModal: {
				width: screenWidth * 0.8,
				maxHeight: screenHeight * 0.6,
				backgroundColor: theme.backgroundColor,
				borderRadius: 12,
				padding: 16,
			},
			selectorTitle: {
				fontSize: 18,
				fontWeight: 'bold',
				color: theme.textColor,
				textAlign: 'center',
				marginBottom: 16,
			},
			selectorList: {
				maxHeight: screenHeight * 0.4,
			},
			selectorSectionTitle: {
				fontSize: 16,
				fontWeight: '600',
				color: theme.textColor,
				marginTop: 12,
				marginBottom: 8,
				paddingHorizontal: 12,
			},
			selectorItem: {
				paddingHorizontal: 16,
				paddingVertical: 12,
				borderRadius: 8,
				marginVertical: 2,
			},
			selectedItem: {
				backgroundColor: theme.buttonColor,
			},
			selectorItemText: {
				fontSize: 16,
				color: theme.textColor,
			},
			selectedItemText: {
				color: '#FFFFFF',
				fontWeight: '500',
			},
			closeButton: {
				marginTop: 16,
				paddingVertical: 12,
				backgroundColor: theme.buttonColor,
				borderRadius: 8,
				alignItems: 'center',
			},
			closeButtonText: {
				fontSize: 16,
				color: '#FFFFFF',
				fontWeight: '500',
			},
			selectorContainer: {
				flexDirection: 'row',
				flexWrap: 'wrap',
				padding: 16,
			},
			toolbarButton: {
				paddingHorizontal: 16,
				paddingVertical: 8,
				borderRadius: 20,
				backgroundColor: theme.buttonColor,
			},
			buttonText: {
				fontSize: 14,
				color: '#FFFFFF',
				fontWeight: '500',
			},
		})
	}
}

export default App
