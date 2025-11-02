import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { TimeTypes, IndicatorTypes, DrawTypeConstants, DrawToolHelper } from '../utils/constants'
import { createControlBarStyles } from './ControlBar.styles'

const ControlBar = ({
	theme,
	selectedTimeType,
	selectedMainIndicator,
	selectedSubIndicator,
	selectedDrawTool,
	showVolumeChart,
	candleCornerRadius,
	onShowTimeSelector,
	onShowIndicatorSelector,
	onToggleDrawToolSelector,
	onClearDrawings,
	onToggleVolume,
	onToggleRounded
}) => {
	const styles = createControlBarStyles(theme)

	return (
		<View style={styles.controlBar}>
			<TouchableOpacity
				style={styles.controlButton}
				onPress={onShowTimeSelector}
			>
				<Text style={styles.controlButtonText}>
					{TimeTypes[selectedTimeType].label}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.controlButton}
				onPress={onShowIndicatorSelector}
			>
				<Text style={styles.controlButtonText}>
					{IndicatorTypes.main[selectedMainIndicator].label}/{IndicatorTypes.sub[selectedSubIndicator].label}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.toolbarButton, selectedDrawTool !== DrawTypeConstants.none && styles.activeButton]}
				onPress={onToggleDrawToolSelector}
			>
				<Text style={[
					styles.buttonText,
					selectedDrawTool !== DrawTypeConstants.none && styles.activeButtonText
				]}>
					{selectedDrawTool !== DrawTypeConstants.none
						? DrawToolHelper.name(selectedDrawTool)
						: 'Draw'
					}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.controlButton}
				onPress={onClearDrawings}
			>
				<Text style={styles.controlButtonText}>
					Clear
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.controlButton, showVolumeChart && styles.activeButton]}
				onPress={onToggleVolume}
			>
				<Text style={[styles.controlButtonText, showVolumeChart && styles.activeButtonText]}>
					Volume
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.controlButton, candleCornerRadius > 0 && styles.activeButton]}
				onPress={onToggleRounded}
			>
				<Text style={[styles.controlButtonText, candleCornerRadius > 0 && styles.activeButtonText]}>
					Rounded
				</Text>
			</TouchableOpacity>
		</View>
	)
}

export default ControlBar