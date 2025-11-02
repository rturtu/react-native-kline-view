/**
 * Helper Functions
 * Utility functions for K-line chart application
 */

import { Dimensions } from 'react-native'

// Helper functions
export const fixRound = (value, precision, showSign = false, showGrouping = false) => {
	if (value === null || value === undefined || isNaN(value)) {
		return '--'
	}

	let result = Number(value).toFixed(precision)

	if (showGrouping) {
		// Add thousands separator
		result = result.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	}

	if (showSign && value > 0) {
		result = '+' + result
	}

	return result
}

// Time formatting function, replaces moment
export const formatTime = (timestamp, format = 'MM-DD HH:mm') => {
	const date = new Date(timestamp)

	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')

	// Support common formatting patterns
	return format
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hours)
		.replace('mm', minutes)
		.replace('ss', seconds)
}

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
export const isHorizontalScreen = screenWidth > screenHeight
export { screenWidth, screenHeight }