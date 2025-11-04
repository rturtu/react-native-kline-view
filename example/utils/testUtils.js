import { formatTime } from './helpers'

/**
 * Test utility function to update the last candlestick with new data
 * @param {Array} klineData - Current kline data array
 * @param {boolean} showVolumeChart - Whether volume chart is shown
 * @param {Function} updateLastCandlestickCallback - Callback function to update the candlestick
 */
export const testUpdateLastCandlestick = (klineData, showVolumeChart, updateLastCandlestickCallback) => {
	if (!updateLastCandlestickCallback || klineData.length === 0) {
		console.warn('No callback or data available')
		return
	}

	const lastCandle = klineData[klineData.length - 1]

	// Generate new price data (simulate real-time updates)
	const basePrice = lastCandle.close
	const priceVariation = (Math.random() - 0.5) * basePrice * 0.01 // ±1% variation

	const newClose = Math.max(0.01, basePrice + priceVariation)
	const newHigh = Math.max(lastCandle.high, newClose + Math.random() * basePrice * 0.002)
	const newLow = Math.min(lastCandle.low, newClose - Math.random() * basePrice * 0.002)
	const newVolume = Math.round(lastCandle.vol * (0.8 + Math.random() * 0.4)) // ±20% volume variation

	// Create updated candlestick with preserved indicators
	const updatedCandle = {
		time: lastCandle.time,
		open: lastCandle.open, // Keep original open
		high: newHigh,
		low: newLow,
		close: newClose,
		vol: newVolume,
		id: lastCandle.id,
		dateString: lastCandle.dateString,
		// Preserve existing indicators
		maList: lastCandle.maList || [],
		maVolumeList: lastCandle.maVolumeList || [],
		rsiList: lastCandle.rsiList || [],
		wrList: lastCandle.wrList || [],
		selectedItemList: lastCandle.selectedItemList || [],
		bollMb: newClose * (1 + Math.random() * 0.06 - 0.03),  // Middle band (moving average)
		bollUp: newClose * (1 + Math.random() * 0.06 - 0.03),  // Upper band (simplified)
		bollDn: newClose * (1 + Math.random() * 0.06 - 0.03),  // Lower band (simplified)
		kdjK: 50 + Math.random() * 10 - 5,  // Placeholder K value
		kdjD: 50 + Math.random() * 10 - 5,  // Placeholder D value
		kdjJ: 50 + Math.random() * 10 - 5,   // Placeholder J value

		macdValue:123 + Math.random() * 100 - 50,
		macdDea:123 + Math.random() * 100 - 50,
		macdDif:123 + Math.random() * 100 - 50,
	}

	console.log('Updating last candlestick:', {
		oldClose: lastCandle.close,
		newClose: newClose,
		volume: newVolume
	})

	// Call the callback function
	updateLastCandlestickCallback(updatedCandle)
}

/**
 * Test utility function to add new candlesticks at the end
 * @param {Array} klineData - Current kline data array
 * @param {boolean} showVolumeChart - Whether volume chart is shown
 * @param {Function} addCandlesticksAtTheEndCallback - Callback function to add candlesticks at the end
 */
export const testAddCandlesticksAtTheEnd = (klineData, showVolumeChart, addCandlesticksAtTheEndCallback) => {
	if (!addCandlesticksAtTheEndCallback || klineData.length === 0) {
		console.warn('No callback or data available')
		return
	}

	const lastCandle = klineData[klineData.length - 1]
	const numberOfNewCandles = 1 // Add 1 new candlestick

	// Generate new candlesticks with indicators
	const newCandlesticks = []
	for (let i = 1; i <= numberOfNewCandles; i++) {
		const timeIncrement = 60000 * i // 1 minute intervals
		const basePrice = lastCandle.close
		const priceVariation = (Math.random() - 0.5) * basePrice * 0.02 // ±2% variation

		const open = Math.max(0.01, basePrice + (Math.random() - 0.5) * basePrice * 0.01)
		const close = Math.max(0.01, basePrice + priceVariation)
		const high = Math.max(open, close) + Math.random() * basePrice * 0.005
		const low = Math.min(open, close) - Math.random() * basePrice * 0.005
		const volume = Math.round(lastCandle.vol * (0.5 + Math.random()))

		// Calculate MA indicators based on historical data
		const tempAllData = [...klineData]
		const currentIndex = tempAllData.length + i - 1

		// Calculate MA5
		let ma5 = close
		if (currentIndex >= 4) {
			let sum = close
			for (let j = Math.max(0, tempAllData.length - 4 + i - 1); j < tempAllData.length; j++) {
				sum += tempAllData[j].close
			}
			ma5 = sum / 5
		}

		// Calculate MA10
		let ma10 = close
		if (currentIndex >= 9) {
			let sum = close
			for (let j = Math.max(0, tempAllData.length - 9 + i - 1); j < tempAllData.length; j++) {
				sum += tempAllData[j].close
			}
			ma10 = sum / 10
		}

		// Calculate MA20
		let ma20 = close
		if (currentIndex >= 19) {
			let sum = close
			for (let j = Math.max(0, tempAllData.length - 19 + i - 1); j < tempAllData.length; j++) {
				sum += tempAllData[j].close
			}
			ma20 = sum / 20
		}

		// Helper function to safely get volume value
		const getSafeVolume = (item) => {
			const vol = item.vol || item.volume
			return isNaN(vol) || !isFinite(vol) ? 100000 : vol
		}

		// Calculate Volume MA5
		let volumeMa5 = volume
		if (currentIndex >= 4) {
			let sum = volume
			for (let j = Math.max(0, tempAllData.length - 4 + i - 1); j < tempAllData.length; j++) {
				sum += getSafeVolume(tempAllData[j])
			}
			volumeMa5 = sum / 5
		}

		// Calculate Volume MA10
		let volumeMa10 = volume
		if (currentIndex >= 9) {
			let sum = volume
			for (let j = Math.max(0, tempAllData.length - 9 + i - 1); j < tempAllData.length; j++) {
				sum += getSafeVolume(tempAllData[j])
			}
			volumeMa10 = sum / 10
		}

		// Ensure all values are valid numbers
		const safeValue = (val, fallback = 0) => isNaN(val) || !isFinite(val) ? fallback : val

		const newCandle = {
			time: lastCandle.time + timeIncrement,
			open: parseFloat(open.toFixed(2)),
			high: parseFloat(high.toFixed(2)),
			low: parseFloat(low.toFixed(2)),
			close: parseFloat(close.toFixed(2)),
			vol: safeValue(volume, 100000), // Fallback to reasonable volume
			id: lastCandle.time + timeIncrement,
			dateString: formatTime(lastCandle.time + timeIncrement, 'MM-DD HH:mm'),
			// Add indicator lists
			maList: [
				{ title: '5', value: safeValue(ma5, close), selected: true, index: 0 },
				{ title: '10', value: safeValue(ma10, close), selected: true, index: 1 },
				{ title: '20', value: safeValue(ma20, close), selected: true, index: 2 }
			],
			maVolumeList: [
				{ title: '5', value: safeValue(volumeMa5, 100000), selected: showVolumeChart, index: 0 },
				{ title: '10', value: safeValue(volumeMa10, 100000), selected: showVolumeChart, index: 1 }
			],
			rsiList: lastCandle.rsiList || [],
			wrList: lastCandle.wrList || [],
			selectedItemList: lastCandle.selectedItemList || [],
			// Add placeholder values for BOLL and KDJ indicators
			bollMb: close * (1 + Math.random() * 0.06 - 0.03),  // Middle band (moving average)
			bollUp: close * (1 + Math.random() * 0.06 - 0.03),  // Upper band (simplified)
			bollDn: close * (1 + Math.random() * 0.06 - 0.03),  // Lower band (simplified)
			kdjK: 50 + Math.random() * 10 - 5,  // Placeholder K value
			kdjD: 50 + Math.random() * 10 - 5,  // Placeholder D value
			kdjJ: 50 + Math.random() * 10 - 5,   // Placeholder J value
			
      macdValue:123 + Math.random() * 100 - 50,
      macdDea:123 + Math.random() * 100 - 50,
      macdDif:123 + Math.random() * 100 - 50,
		}

		newCandlesticks.push(newCandle)
	}

	console.log('Adding', numberOfNewCandles, 'new candlesticks at the end')
	addCandlesticksAtTheEndCallback(newCandlesticks)
}

/**
 * Test utility function to add new candlesticks at the start (historical data)
 * @param {Array} klineData - Current kline data array
 * @param {boolean} showVolumeChart - Whether volume chart is shown
 * @param {Object} firstCandleTime - First candle time
 * @param {Function} addCandlesticksAtTheStartCallback - Callback function to add candlesticks at the start
 */
export const testAddCandlesticksAtTheStart = (klineData, showVolumeChart, firstCandleTime, addCandlesticksAtTheStartCallback) => {
	if (!addCandlesticksAtTheStartCallback || klineData.length === 0) {
		console.warn('No callback or data available')
		return
	}

	const firstCandle = klineData[0]
	const numberOfNewCandles = 200 // Add 200 new candlesticks

	const newCandlesticks = []

	// Create temp array for calculations (prepend to existing data)
	const tempAllData = [...klineData]

	for (let i = 0; i < numberOfNewCandles; i++) {
		// Calculate timestamp going backwards in time (oldest candles first in our generation)
		// i=0 gives us the oldest candle (200 minutes ago), i=199 gives us the newest (1 minute ago)
		const minutesBack = numberOfNewCandles - i // 200, 199, 198, ..., 1
		const timestamp = firstCandleTime - (minutesBack * 60 * 1000)

		// Generate price data going backward in time
		const basePrice = firstCandle.open
		const priceVariation1 = (Math.random() - 0.5) * basePrice * 0.02
		const priceVariation2 = (Math.random() - 0.5) * basePrice * 0.02
		const open = Math.max(0.01, basePrice + priceVariation1)
		const close = Math.max(0.01, basePrice + priceVariation2)
		const high = Math.max(open, close) + Math.random() * basePrice * 0.005
		const low = Math.min(open, close) - Math.random() * basePrice * 0.005
		const volume = Math.round(firstCandle.vol * (0.5 + Math.random()))

		// Calculate MA indicators based on position in the prepended data
		const currentIndex = numberOfNewCandles - 1 - i // Position in the new data

		// Helper function to safely get volume value
		const getSafeVolume = (item) => {
			const vol = item.vol || item.volume
			return isNaN(vol) || !isFinite(vol) ? 100000 : vol
		}

		// Calculate Volume MA5 (for the start, use current volume as base)
		let volumeMa5 = volume
		// Since we're at the start, use simple fallback

		// Calculate Volume MA10
		let volumeMa10 = volume

		// Calculate MA5
		let ma5 = close

		// Calculate MA10
		let ma10 = close

		// Calculate MA20
		let ma20 = close

		// Ensure all values are valid numbers
		const safeValue = (val, fallback = 0) => isNaN(val) || !isFinite(val) ? fallback : val

		const newCandle = {
			time: timestamp,
			open: parseFloat(open.toFixed(2)),
			high: parseFloat(high.toFixed(2)),
			low: parseFloat(low.toFixed(2)),
			close: parseFloat(close.toFixed(2)) - 200,
			vol: safeValue(volume, 100000), // Fallback to reasonable volume
			id: timestamp,
			dateString: formatTime(timestamp, 'MM-DD HH:mm'),
			// Add indicator lists
			maList: [
				{ title: '5', value: safeValue(ma5, close), selected: true, index: 0 },
				{ title: '10', value: safeValue(ma10, close), selected: true, index: 1 },
				{ title: '20', value: safeValue(ma20, close), selected: true, index: 2 }
			],
			maVolumeList: [
				{ title: '5', value: safeValue(volumeMa5, 100000), selected: showVolumeChart, index: 0 },
				{ title: '10', value: safeValue(volumeMa10, 100000), selected: showVolumeChart, index: 1 }
			],
			rsiList: firstCandle.rsiList || [],
			wrList: firstCandle.wrList || [],
			selectedItemList: firstCandle.selectedItemList || [],
			// Add placeholder values for BOLL and KDJ indicators
			bollMb: close * (1 + Math.random() * 0.06 - 0.03),  // Middle band (moving average)
			bollUp: close * (1 + Math.random() * 0.06 - 0.03),  // Upper band (simplified)
			bollDn: close * (1 + Math.random() * 0.06 - 0.03),  // Lower band (simplified)
			kdjK: 50 + Math.random() * 10 - 5,  // Placeholder K value
			kdjD: 50 + Math.random() * 10 - 5,  // Placeholder D value
			kdjJ: 50 + Math.random() * 10 - 5,   // Placeholder J value
      macdValue:123 + Math.random() * 100 - 50,
      macdDea:123 + Math.random() * 100 - 50,
      macdDif:123 + Math.random() * 100 - 50,
		}

		newCandlesticks.push(newCandle) // Add in chronological order (oldest to newest)
	}

	console.log('Adding', numberOfNewCandles, 'new candlesticks at the start:')
	console.log("First historical candle (oldest):", newCandlesticks[0])
	console.log("Last historical candle (newest):", newCandlesticks[newCandlesticks.length - 1])
	console.log("Previous first candle:", firstCandle)
	console.log("Timestamp comparison:")
	console.log("  Historical oldest:", new Date(newCandlesticks[0].time).toLocaleString())
	console.log("  Historical newest:", new Date(newCandlesticks[newCandlesticks.length - 1].time).toLocaleString())
	console.log("  Previous first:", new Date(firstCandle.time).toLocaleString())

	addCandlesticksAtTheStartCallback(newCandlesticks)
}