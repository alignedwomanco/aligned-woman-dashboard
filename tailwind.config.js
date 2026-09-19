/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    safelist: ["lg:ml-16", "lg:ml-64"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// rgb(var(--x-rgb) / <alpha-value>) so opacity modifiers work.
  			// The plain --aw-* hex vars stay for inline styles.
  			awburg: {
  				dark: 'rgb(var(--aw-burg-dark-rgb) / <alpha-value>)',
  				core: 'rgb(var(--aw-burg-core-rgb) / <alpha-value>)',
  				mid: 'rgb(var(--aw-burg-mid-rgb) / <alpha-value>)',
  				bright: 'rgb(var(--aw-burg-bright-rgb) / <alpha-value>)'
  			},
  			awrose: {
  				deep: 'rgb(var(--aw-rose-deep-rgb) / <alpha-value>)',
  				core: 'rgb(var(--aw-rose-core-rgb) / <alpha-value>)',
  				light: 'rgb(var(--aw-rose-light-rgb) / <alpha-value>)',
  				pale: 'rgb(var(--aw-rose-pale-rgb) / <alpha-value>)',
  				wash: 'rgb(var(--aw-rose-wash-rgb) / <alpha-value>)'
  			},
  			awsage: {
  				core: 'rgb(var(--aw-sage-rgb) / <alpha-value>)',
  				wash: 'rgb(var(--aw-sage-wash-rgb) / <alpha-value>)'
  			},
  			'off-white': 'rgb(var(--aw-off-white-rgb) / <alpha-value>)',
  			paper: 'rgb(var(--aw-white-rgb) / <alpha-value>)'
  		},
  		fontFamily: {
  			display: ['DM Serif Display', 'Cormorant Garamond', 'Georgia', 'serif'],
  			body: ['Montserrat', 'Helvetica Neue', 'Arial', 'sans-serif']
  		},
  		letterSpacing: {
  			eyebrow: '0.22em'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
