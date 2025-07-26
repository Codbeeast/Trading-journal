module.exports = {
  // ... your existing config
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'reverse': 'spin 1s linear infinite reverse',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    }
  }
}