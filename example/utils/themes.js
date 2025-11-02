/**
 * Theme Management
 * Centralized theme configuration for K-line chart application
 */

// Helper function: Convert RGB values from 0-1 range to 0-255 range
const COLOR = (r, g, b, a = 1) => {
	if (a === 1) {
		return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
	} else {
		return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
	}
}

// Theme configuration
export class ThemeManager {
	static themes = {
		light: {
			// Base colors
			backgroundColor: 'white',
			titleColor: COLOR(0.08, 0.09, 0.12),
			detailColor: COLOR(0.55, 0.62, 0.68),
			textColor7724: COLOR(0.77, 0.81, 0.84),

			// Special background colors
			headerColor: COLOR(0.97, 0.97, 0.98),
			tabBarBackgroundColor: 'white',
			backgroundColor9103: COLOR(0.91, 0.92, 0.93),
			backgroundColor9703: COLOR(0.97, 0.97, 0.98),
			backgroundColor9113: COLOR(0.91, 0.92, 0.93),
			backgroundColor9709: COLOR(0.97, 0.97, 0.98),
			backgroundColor9603: COLOR(0.96, 0.97, 0.98),
			backgroundColor9411: COLOR(0.94, 0.95, 0.96),
			backgroundColor9607: COLOR(0.96, 0.97, 0.99),
			backgroundColor9609: 'white',
			backgroundColor9509: COLOR(0.95, 0.97, 0.99),

			// Functional colors
			backgroundColorBlue: COLOR(0, 0.4, 0.93),
			buttonColor: COLOR(0, 0.4, 0.93),
			borderColor: COLOR(0.91, 0.92, 0.93),
			backgroundOpacity: COLOR(0, 0, 0, 0.5),

			// K-line related colors
			increaseColor: COLOR(0.0, 0.78, 0.32), // Rise color: Green
			decreaseColor: COLOR(1.0, 0.27, 0.27), // Fall color: Red
			minuteLineColor: COLOR(0, 0.4, 0.93),

			// Grid and borders
			gridColor: COLOR(0.91, 0.92, 0.93),
			separatorColor: COLOR(0.91, 0.92, 0.93),

			// Text colors
			textColor: COLOR(0.08, 0.09, 0.12),
		},
		dark: {
			// Base colors
			backgroundColor: COLOR(0.07, 0.12, 0.19),
			titleColor: COLOR(0.81, 0.83, 0.91),
			detailColor: COLOR(0.43, 0.53, 0.66),
			textColor7724: COLOR(0.24, 0.33, 0.42),

			// Special background colors
			headerColor: COLOR(0.09, 0.16, 0.25),
			tabBarBackgroundColor: COLOR(0.09, 0.16, 0.25),
			backgroundColor9103: COLOR(0.03, 0.09, 0.14),
			backgroundColor9703: COLOR(0.03, 0.09, 0.14),
			backgroundColor9113: COLOR(0.13, 0.2, 0.29),
			backgroundColor9709: COLOR(0.09, 0.16, 0.25),
			backgroundColor9603: COLOR(0.03, 0.09, 0.14),
			backgroundColor9411: COLOR(0.11, 0.17, 0.25),
			backgroundColor9607: COLOR(0.07, 0.15, 0.23),
			backgroundColor9609: COLOR(0.09, 0.15, 0.23),
			backgroundColor9509: COLOR(0.09, 0.16, 0.25),

			// Functional colors
			backgroundColorBlue: COLOR(0.14, 0.51, 1),
			buttonColor: COLOR(0.14, 0.51, 1),
			borderColor: COLOR(0.13, 0.2, 0.29),
			backgroundOpacity: COLOR(0, 0, 0, 0.8),

			// K-line related colors
			increaseColor: COLOR(0.0, 1.0, 0.53), // Rise color: Bright green
			decreaseColor: COLOR(1.0, 0.4, 0.4), // Fall color: Bright red
			minuteLineColor: COLOR(0.14, 0.51, 1),

			// Grid and borders
			gridColor: COLOR(0.13, 0.2, 0.29),
			separatorColor: COLOR(0.13, 0.2, 0.29),

			// Text colors
			textColor: COLOR(0.81, 0.83, 0.91),
		}
	}

	static getCurrentTheme(isDark) {
		return this.themes[isDark ? 'dark' : 'light']
	}
}

export { COLOR }