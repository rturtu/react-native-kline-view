import React from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
import { createToolbarStyles } from './Toolbar.styles'

const Toolbar = ({
	theme,
	isDarkTheme,
	onToggleTheme,
	onTestUpdate,
	onTestAddCandles
}) => {
	const styles = createToolbarStyles(theme)

	return (
		<View style={styles.toolbar}>
			<Text style={styles.title}>K-line Chart</Text>
			<View style={styles.toolbarRight}>
				{onTestUpdate && (
					<TouchableOpacity
						style={styles.testButton}
						onPress={onTestUpdate}
					>
						<Text style={styles.testButtonText}>Update Last</Text>
					</TouchableOpacity>
				)}
				{onTestAddCandles && (
					<TouchableOpacity
						style={styles.testButton}
						onPress={onTestAddCandles}
					>
						<Text style={styles.testButtonText}>Add 5 Candles</Text>
					</TouchableOpacity>
				)}
				<Text style={styles.themeLabel}>
					{isDarkTheme ? 'Night' : 'Day'}
				</Text>
				<Switch
					value={isDarkTheme}
					onValueChange={onToggleTheme}
					trackColor={{ false: '#E0E0E0', true: theme.buttonColor }}
					thumbColor={isDarkTheme ? '#FFFFFF' : '#F4F3F4'}
				/>
			</View>
		</View>
	)
}

export default Toolbar