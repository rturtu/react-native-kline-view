import { StyleSheet, Dimensions } from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export const createSelectorsStyles = (theme) => {
	return StyleSheet.create({
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
	})
}