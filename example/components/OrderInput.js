import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'

const OrderInput = ({ theme, onAddOrder, currentPrice }) => {
	const [priceInput, setPriceInput] = useState(currentPrice ? currentPrice.toString() : '')

	const handleAddOrder = () => {
		const price = parseFloat(priceInput)
		if (!isNaN(price) && price > 0) {
			onAddOrder(price)
		}
	}

	const styles = StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: 10,
			backgroundColor: theme.backgroundColor,
			borderTopWidth: 1,
			borderTopColor: theme.gridColor,
		},
		label: {
			color: theme.textColor,
			fontSize: 14,
			marginRight: 8,
			fontWeight: '600',
		},
		input: {
			flex: 1,
			height: 36,
			borderWidth: 1,
			borderColor: theme.gridColor,
			borderRadius: 4,
			paddingHorizontal: 8,
			backgroundColor: theme.panelBackgroundColor,
			color: theme.textColor,
			fontSize: 14,
			marginRight: 8,
		},
		addButton: {
			backgroundColor: theme.buttonColor,
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 4,
		},
		addButtonText: {
			color: theme.backgroundColor,
			fontSize: 14,
			fontWeight: '600',
		},
		currentPriceButton: {
			backgroundColor: theme.gridColor,
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 4,
			marginRight: 8,
		},
		currentPriceButtonText: {
			color: theme.textColor,
			fontSize: 12,
		},
	})

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Limit Order:</Text>
			<TextInput
				style={styles.input}
				value={priceInput}
				onChangeText={setPriceInput}
				placeholder="Enter price"
				placeholderTextColor={theme.gridColor}
				keyboardType="numeric"
			/>
			{currentPrice && (
				<TouchableOpacity
					style={styles.currentPriceButton}
					onPress={() => setPriceInput(currentPrice.toString())}
				>
					<Text style={styles.currentPriceButtonText}>
						Current: {currentPrice.toFixed(2)}
					</Text>
				</TouchableOpacity>
			)}
			<TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
				<Text style={styles.addButtonText}>Add Order</Text>
			</TouchableOpacity>
		</View>
	)
}

export default OrderInput