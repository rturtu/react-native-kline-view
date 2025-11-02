/**
 * K-line Chart Example Application
 * Supports indicators, finger drawing, theme switching and other features
 */

import React, { Component } from 'react'
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
			klineData: generateMockData(),
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
			this.setState({ klineData: generateMockData() }, () => {
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

		const processedData = processKLineData(this.state.klineData, {
			selectedMainIndicator: this.state.selectedMainIndicator,
			selectedSubIndicator: this.state.selectedSubIndicator,
			showVolumeChart: this.state.showVolumeChart
		}, this.state.isDarkTheme)
		const optionList = packOptionList(processedData, this.state, shouldScrollToEnd)
		this.setOptionList(optionList)
	}

	// Reload K-line data and adjust scroll position to maintain current view
	reloadKLineDataWithScrollAdjustment = (addedDataCount) => {
		if (!this.kLineViewRef) {
			setTimeout(() => this.reloadKLineDataWithScrollAdjustment(addedDataCount), 100)
			return
		}

		const processedData = processKLineData(this.state.klineData, {
			selectedMainIndicator: this.state.selectedMainIndicator,
			selectedSubIndicator: this.state.selectedSubIndicator,
			showVolumeChart: this.state.showVolumeChart
		}, this.state.isDarkTheme)
		const optionList = packOptionList(processedData, this.state, false)

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

	// Set optionList property
	setOptionList = (optionList) => {
		this.setState({
			optionList: JSON.stringify(optionList)
		})
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

	// Load more historical data
	loadMoreHistoricalData = () => {
		console.log("loadMoreHistoricalData called")
		const currentData = this.state.klineData
		const newHistoricalData = generateMoreHistoricalData(currentData, 200)
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
				<Toolbar
					theme={theme}
					isDarkTheme={this.state.isDarkTheme}
					onToggleTheme={this.toggleTheme}
				/>

				{/* K-line chart */}
				{this.renderKLineChart(styles, theme)}

				{/* Bottom control bar */}
				<ControlBar
					theme={theme}
					selectedTimeType={this.state.selectedTimeType}
					selectedMainIndicator={this.state.selectedMainIndicator}
					selectedSubIndicator={this.state.selectedSubIndicator}
					selectedDrawTool={this.state.selectedDrawTool}
					showVolumeChart={this.state.showVolumeChart}
					candleCornerRadius={this.state.candleCornerRadius}
					onShowTimeSelector={() => this.setState({ showTimeSelector: true })}
					onShowIndicatorSelector={() => this.setState({ showIndicatorSelector: true })}
					onToggleDrawToolSelector={() => this.setState({
						showDrawToolSelector: !this.state.showDrawToolSelector,
						showIndicatorSelector: false,
						showTimeSelector: false
					})}
					onClearDrawings={this.clearDrawings}
					onToggleVolume={() => this.setState({ showVolumeChart: !this.state.showVolumeChart }, () => {
						this.reloadKLineData()
					})}
					onToggleRounded={() => this.setState({ candleCornerRadius: this.state.candleCornerRadius > 0 ? 0 : 1 }, () => {
						this.reloadKLineData()
					})}
				/>

				{/* Selector popup */}
				<Selectors
					theme={theme}
					showTimeSelector={this.state.showTimeSelector}
					showIndicatorSelector={this.state.showIndicatorSelector}
					showDrawToolSelector={this.state.showDrawToolSelector}
					selectedTimeType={this.state.selectedTimeType}
					selectedMainIndicator={this.state.selectedMainIndicator}
					selectedSubIndicator={this.state.selectedSubIndicator}
					selectedDrawTool={this.state.selectedDrawTool}
					drawShouldContinue={this.state.drawShouldContinue}
					onSelectTimeType={this.selectTimeType}
					onSelectIndicator={this.selectIndicator}
					onSelectDrawTool={this.selectDrawTool}
					onCloseTimeSelector={() => this.setState({ showTimeSelector: false })}
					onCloseIndicatorSelector={() => this.setState({ showIndicatorSelector: false })}
					onToggleDrawShouldContinue={(value) => this.setState({ drawShouldContinue: value })}
				/>
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

	getStyles = (theme) => {
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
	}
}

export default App
