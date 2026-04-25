/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'secondary-container': '#d5e3fc',
        'surface-variant': '#e0e3e5',
        'on-primary-fixed': '#00174b',
        'on-surface': '#191c1e',
        'on-secondary-fixed-variant': '#3a485b',
        'on-error-container': '#93000a',
        'outline-variant': '#c4c5d5',
        'secondary': '#515f74',
        'on-tertiary': '#ffffff',
        'on-secondary-fixed': '#0d1c2e',
        'surface-tint': '#0053db',
        'error-container': '#ffdad6',
        'primary-fixed': '#dbe1ff',
        'primary': '#002d81',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#57657a',
        'on-tertiary-fixed-variant': '#802a00',
        'tertiary-fixed': '#ffdbce',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'tertiary': '#611e00',
        'surface-container-highest': '#e0e3e5',
        'surface-container-lowest': '#ffffff',
        'on-primary': '#ffffff',
        'on-error': '#ffffff',
        'on-primary-fixed-variant': '#003ea8',
        'secondary-fixed': '#d5e3fc',
        'primary-container': '#0042b1',
        'inverse-on-surface': '#eff1f3',
        'surface-bright': '#f7f9fb',
        'surface-dim': '#d8dadc',
        'on-surface-variant': '#444653',
        'outline': '#757684',
        'surface-container-low': '#f2f4f6',
        'on-primary-container': '#a4b9ff',
        'background': '#f7f9fb',
        'error': '#ba1a1a',
        'on-tertiary-fixed': '#380d00',
        'tertiary-container': '#872d00',
        'tertiary-fixed-dim': '#ffb59a',
        'on-tertiary-container': '#ffa583',
        'inverse-primary': '#b4c5ff',
        'secondary-fixed-dim': '#b9c7df',
        'surface': '#f7f9fb',
        'inverse-surface': '#2d3133',
        'primary-fixed-dim': '#b4c5ff',
        'on-background': '#191c1e'
      },
      fontFamily: {
        'headline': ['Manrope'],
        'body': ['Inter'],
        'label': ['Inter']
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        'lg': '0.25rem',
        'xl': '0.5rem',
        'full': '0.75rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ]
};