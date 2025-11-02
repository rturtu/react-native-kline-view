import { StyleSheet } from 'react-native'

export const createControlBarStyles = (theme) => {
	return StyleSheet.create({
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