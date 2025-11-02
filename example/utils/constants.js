/**
 * Application Constants
 * Centralized constants for K-line chart application
 */

// Time period constants
export const TimeConstants = {
	oneMinute: 1,
	threeMinute: 2,
	fiveMinute: 3,
	fifteenMinute: 4,
	thirtyMinute: 5,
	oneHour: 6,
	fourHour: 7,
	sixHour: 8,
	oneDay: 9,
	oneWeek: 10,
	oneMonth: 11,
	minuteHour: -1  // Minute chart
}

// Time period types - using constant values
export const TimeTypes = {
	1: { label: 'Minute', value: TimeConstants.minuteHour },
	2: { label: '1min', value: TimeConstants.oneMinute },
	3: { label: '3min', value: TimeConstants.threeMinute },
	4: { label: '5min', value: TimeConstants.fiveMinute },
	5: { label: '15min', value: TimeConstants.fifteenMinute },
	6: { label: '30min', value: TimeConstants.thirtyMinute },
	7: { label: '1h', value: TimeConstants.oneHour },
	8: { label: '4h', value: TimeConstants.fourHour },
	9: { label: '6h', value: TimeConstants.sixHour },
	10: { label: '1d', value: TimeConstants.oneDay },
	11: { label: '1w', value: TimeConstants.oneWeek },
	12: { label: '1M', value: TimeConstants.oneMonth }
}

// Indicator types - sub-chart indicator indices changed to 3-6
export const IndicatorTypes = {
	main: {
		1: { label: 'MA', value: 'ma' },
		2: { label: 'BOLL', value: 'boll' },
		0: { label: 'NONE', value: 'none' }
	},
	sub: {
		3: { label: 'MACD', value: 'macd' },
		4: { label: 'KDJ', value: 'kdj' },
		5: { label: 'RSI', value: 'rsi' },
		6: { label: 'WR', value: 'wr' },
		0: { label: 'NONE', value: 'none' }
	}
}

// Drawing type constants
export const DrawTypeConstants = {
	none: 0,
	show: -1,
	line: 1,
	horizontalLine: 2,
	verticalLine: 3,
	halfLine: 4,
	parallelLine: 5,
	rectangle: 101,
	parallelogram: 102
}

// Drawing state constants
export const DrawStateConstants = {
	none: -3,
	showPencil: -2,
	showContext: -1
}

// Drawing tool types - using numeric constants
export const DrawToolTypes = {
	[DrawTypeConstants.none]: { label: 'Disable Drawing', value: DrawTypeConstants.none },
	[DrawTypeConstants.line]: { label: 'Line', value: DrawTypeConstants.line },
	[DrawTypeConstants.horizontalLine]: { label: 'Horizontal Line', value: DrawTypeConstants.horizontalLine },
	[DrawTypeConstants.verticalLine]: { label: 'Vertical Line', value: DrawTypeConstants.verticalLine },
	[DrawTypeConstants.halfLine]: { label: 'Ray', value: DrawTypeConstants.halfLine },
	[DrawTypeConstants.parallelLine]: { label: 'Parallel Channel', value: DrawTypeConstants.parallelLine },
	[DrawTypeConstants.rectangle]: { label: 'Rectangle', value: DrawTypeConstants.rectangle },
	[DrawTypeConstants.parallelogram]: { label: 'Parallelogram', value: DrawTypeConstants.parallelogram }
}

// FORMAT helper function
export const FORMAT = (text) => text

// Drawing tool helper methods
export const DrawToolHelper = {
	name: (type) => {
		switch(type) {
			case DrawTypeConstants.line:
				return FORMAT('Line')
			case DrawTypeConstants.horizontalLine:
				return FORMAT('Horizontal Line')
			case DrawTypeConstants.verticalLine:
				return FORMAT('Vertical Line')
			case DrawTypeConstants.halfLine:
				return FORMAT('Ray')
			case DrawTypeConstants.parallelLine:
				return FORMAT('Parallel Channel')
			case DrawTypeConstants.rectangle:
				return FORMAT('Rectangle')
			case DrawTypeConstants.parallelogram:
				return FORMAT('Parallelogram')
		}
		return ''
	},

	count: (type) => {
		if (type === DrawTypeConstants.line ||
			type === DrawTypeConstants.horizontalLine ||
			type === DrawTypeConstants.verticalLine ||
			type === DrawTypeConstants.halfLine ||
			type === DrawTypeConstants.rectangle) {
			return 2
		}
		if (type === DrawTypeConstants.parallelLine ||
			type === DrawTypeConstants.parallelogram) {
			return 3
		}
		return 0
	}
}