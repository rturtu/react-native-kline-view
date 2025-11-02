import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native'
import { TimeTypes, IndicatorTypes, DrawToolTypes } from '../utils/constants'
import { createSelectorsStyles } from './Selectors.styles'

const Selectors = ({
	theme,
	showTimeSelector,
	showIndicatorSelector,
	showDrawToolSelector,
	selectedTimeType,
	selectedMainIndicator,
	selectedSubIndicator,
	selectedDrawTool,
	drawShouldContinue,
	onSelectTimeType,
	onSelectIndicator,
	onSelectDrawTool,
	onCloseTimeSelector,
	onCloseIndicatorSelector,
	onToggleDrawShouldContinue
}) => {
	const styles = createSelectorsStyles(theme)
	return (
		<>
			{/* Time selector */}
			{showTimeSelector && (
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
											selectedTimeType === timeType && styles.selectedItem
										]}
										onPress={() => onSelectTimeType(timeType)}
									>
										<Text style={[
											styles.selectorItemText,
											selectedTimeType === timeType && styles.selectedItemText
										]}>
											{TimeTypes[timeType].label}
										</Text>
									</TouchableOpacity>
								)
							})}
						</ScrollView>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={onCloseTimeSelector}
						>
							<Text style={styles.closeButtonText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			{/* Indicator selector */}
			{showIndicatorSelector && (
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
													((type === 'main' && selectedMainIndicator === indicator) ||
													 (type === 'sub' && selectedSubIndicator === indicator)) && styles.selectedItem
												]}
												onPress={() => onSelectIndicator(type, indicator)}
											>
												<Text style={[
													styles.selectorItemText,
													((type === 'main' && selectedMainIndicator === indicator) ||
													 (type === 'sub' && selectedSubIndicator === indicator)) && styles.selectedItemText
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
							onPress={onCloseIndicatorSelector}
						>
							<Text style={styles.closeButtonText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			{/* Drawing tool selector */}
			{showDrawToolSelector && (
				<View style={styles.selectorContainer}>
					{Object.keys(DrawToolTypes).map(toolKey => (
						<TouchableOpacity
							key={toolKey}
							style={[
								styles.selectorItem,
								selectedDrawTool === parseInt(toolKey, 10) && styles.selectedItem
							]}
							onPress={() => onSelectDrawTool(parseInt(toolKey, 10))}
						>
							<Text style={[
								styles.selectorItemText,
								selectedDrawTool === parseInt(toolKey, 10) && styles.selectedItemText
							]}>
								{DrawToolTypes[toolKey].label}
							</Text>
						</TouchableOpacity>
					))}
					<Text style={styles.selectorItemText}>Continuous Drawing: </Text>
					<Switch
						value={drawShouldContinue}
						onValueChange={onToggleDrawShouldContinue}
					/>
				</View>
			)}
		</>
	)
}

export default Selectors