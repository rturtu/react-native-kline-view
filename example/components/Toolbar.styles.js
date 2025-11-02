import { StyleSheet } from 'react-native'

export const createToolbarStyles = (theme) => {
	return StyleSheet.create({
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
		testButton: {
			backgroundColor: theme.buttonColor,
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 4,
			marginRight: 12,
		},
		testButtonText: {
			fontSize: 12,
			color: '#FFFFFF',
			fontWeight: '600',
		},
	})
}