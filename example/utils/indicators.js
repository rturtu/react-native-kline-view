/**
 * Technical Indicator Calculation Functions
 * Common technical analysis indicators for K-line charts
 */

/**
 * Calculate Bollinger Bands (BOLL)
 * @param {Array} data - Array of OHLCV data
 * @param {number} n - Period for moving average (default: 20)
 * @param {number} p - Standard deviation multiplier (default: 2)
 * @returns {Array} Data with BOLL values added (bollMb, bollUp, bollDn)
 */
export const calculateBOLL = (data, n = 20, p = 2) => {
	return data.map((item, index) => {
		if (index < n - 1) {
			return {
				...item,
				bollMb: item.close,
				bollUp: item.close,
				bollDn: item.close
			}
		}

		// Calculate MA
		let sum = 0
		for (let i = index - n + 1; i <= index; i++) {
			sum += data[i].close
		}
		const ma = sum / n

		// Calculate standard deviation
		let variance = 0
		for (let i = index - n + 1; i <= index; i++) {
			variance += Math.pow(data[i].close - ma, 2)
		}
		const std = Math.sqrt(variance / (n - 1))

		return {
			...item,
			bollMb: ma,
			bollUp: ma + p * std,
			bollDn: ma - p * std
		}
	})
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of OHLCV data
 * @param {number} s - Short period EMA (default: 12)
 * @param {number} l - Long period EMA (default: 26)
 * @param {number} m - Signal line EMA period (default: 9)
 * @returns {Array} Data with MACD values added (macdValue, macdDea, macdDif)
 */
export const calculateMACD = (data, s = 12, l = 26, m = 9) => {
	let ema12 = data[0].close
	let ema26 = data[0].close
	let dea = 0

	return data.map((item, index) => {
		if (index === 0) {
			return {
				...item,
                macdValue: 0,
                macdDea: 0,
                macdDif: 0,
			}
		}

		// Calculate EMA
		ema12 = (2 * item.close + (s - 1) * ema12) / (s + 1)
		ema26 = (2 * item.close + (l - 1) * ema26) / (l + 1)

		const dif = ema12 - ema26
		dea = (2 * dif + (m - 1) * dea) / (m + 1)
		const macd = 2 * (dif - dea)

		return {
			...item,
            macdValue: macd,
            macdDea: dea,
            macdDif: dif,
		}
	})
}

/**
 * Calculate KDJ (Stochastic Oscillator)
 * @param {Array} data - Array of OHLCV data
 * @param {number} n - Period for calculation (default: 9)
 * @param {number} m1 - K smoothing period (default: 3)
 * @param {number} m2 - D smoothing period (default: 3)
 * @returns {Array} Data with KDJ values added (kdjK, kdjD, kdjJ)
 */
export const calculateKDJ = (data, n = 9, m1 = 3, m2 = 3) => {
	let k = 50
	let d = 50

	return data.map((item, index) => {
		if (index === 0) {
			return {
				...item,
				kdjK: k,
				kdjD: d,
				kdjJ: 3 * k - 2 * d
			}
		}

		// Find highest and lowest prices within n periods
		const startIndex = Math.max(0, index - n + 1)
		let highest = -Infinity
		let lowest = Infinity

		for (let i = startIndex; i <= index; i++) {
			highest = Math.max(highest, data[i].high)
			lowest = Math.min(lowest, data[i].low)
		}

		const rsv = highest === lowest ? 50 : ((item.close - lowest) / (highest - lowest)) * 100
		k = (rsv + (m1 - 1) * k) / m1
		d = (k + (m1 - 1) * d) / m1
		const j = m2 * k - 2 * d

		return {
			...item,
			kdjK: k,
			kdjD: d,
			kdjJ: j
		}
	})
}

/**
 * Calculate Moving Average (MA) for given periods
 * @param {Array} data - Array of OHLCV data
 * @param {Array} periodConfigs - Array of {period, index} configurations
 * @returns {Array} Data with MA values added in maList array
 */
export const calculateMAWithConfig = (data, periodConfigs) => {
	return data.map((item, index) => {
		const maList = new Array(3) // Fixed 3 positions

		periodConfigs.forEach(config => {
			if (index < config.period - 1) {
				maList[config.index] = { value: item.close, title: `${config.period}` }
			} else {
				let sum = 0
				for (let i = index - config.period + 1; i <= index; i++) {
					sum += data[i].close
				}
				maList[config.index] = { value: sum / config.period, title: `${config.period}` }
			}
		})

		return { ...item, maList }
	})
}

/**
 * Calculate Volume Moving Average (MA) for given periods
 * @param {Array} data - Array of OHLCV data
 * @param {Array} periodConfigs - Array of {period, index} configurations
 * @returns {Array} Data with volume MA values added in maVolumeList array
 */
export const calculateVolumeMAWithConfig = (data, periodConfigs) => {
	return data.map((item, index) => {
		const maVolumeList = new Array(2) // Fixed 2 positions

		periodConfigs.forEach(config => {
			if (index < config.period - 1) {
				maVolumeList[config.index] = { value: item.vol || item.volume || 0, title: `${config.period}` }
			} else {
				let sum = 0
				for (let i = index - config.period + 1; i <= index; i++) {
					sum += data[i].vol || data[i].volume || 0
				}
				maVolumeList[config.index] = { value: sum / config.period, title: `${config.period}` }
			}
		})

		return { ...item, maVolumeList }
	})
}

/**
 * Calculate RSI (Relative Strength Index) for given periods
 * @param {Array} data - Array of OHLCV data
 * @param {Array} periodConfigs - Array of {period, index} configurations
 * @returns {Array} Data with RSI values added in rsiList array
 */
export const calculateRSIWithConfig = (data, periodConfigs) => {
	return data.map((item, index) => {
		if (index === 0) {
			const rsiList = new Array(3) // Fixed 3 positions
			periodConfigs.forEach(config => {
				rsiList[config.index] = { value: 50, index: config.index, title: `${config.period}` }
			})
			return { ...item, rsiList }
		}

		const rsiList = new Array(3) // Fixed 3 positions
		periodConfigs.forEach(config => {
			if (index < config.period) {
				rsiList[config.index] = { value: 50, index: config.index, title: `${config.period}` }
				return
			}

			let gains = 0
			let losses = 0

			for (let i = index - config.period + 1; i <= index; i++) {
				const change = data[i].close - data[i - 1].close
				if (change > 0) gains += change
				else losses += Math.abs(change)
			}

			const avgGain = gains / config.period
			const avgLoss = losses / config.period
			const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
			const rsi = 100 - (100 / (1 + rs))

			rsiList[config.index] = { value: rsi, index: config.index, title: `${config.period}` }
		})

		return { ...item, rsiList }
	})
}

/**
 * Calculate Williams %R for given periods
 * @param {Array} data - Array of OHLCV data
 * @param {Array} periodConfigs - Array of {period, index} configurations
 * @returns {Array} Data with WR values added in wrList array
 */
export const calculateWRWithConfig = (data, periodConfigs) => {
	return data.map((item, index) => {
		const wrList = new Array(1) // Fixed 1 position

		periodConfigs.forEach(config => {
			if (index < config.period - 1) {
				wrList[config.index] = { value: -50, index: config.index, title: `${config.period}` }
				return
			}

			// Find highest and lowest prices within period cycles
			let highest = -Infinity
			let lowest = Infinity

			for (let i = index - config.period + 1; i <= index; i++) {
				highest = Math.max(highest, data[i].high)
				lowest = Math.min(lowest, data[i].low)
			}

			const wr = highest === lowest ? -50 : -((highest - item.close) / (highest - lowest)) * 100
			wrList[config.index] = { value: wr, index: config.index, title: `${config.period}` }
		})

		return { ...item, wrList }
	})
}