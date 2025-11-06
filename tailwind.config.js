/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Resort theme colors
        'resort-blue': '#2c5aa0',
        'resort-blue-hover': '#1e4080',
        'resort-blue-light': '#007bff',
        
        // Difficulty colors (full names for backgrounds)
        'difficulty-beginner': '#28a745',
        'difficulty-intermediate': '#007bff', 
        'difficulty-advanced': '#000000',
     
        
        // Short difficulty aliases for text
        'beginner': '#28a745',
        'intermediate': '#007bff',
        'advanced': '#000000',
  
        
        // Danger/Warning colors
        'danger-primary': '#ff4444',
        'danger-secondary': '#cc0000',
        'danger-border': '#990000',
        'danger-gradient-start': '#ff6b6b',
        'danger-gradient-end': '#ff4757',
        'warning-bg-start': '#ffebee',
        'warning-bg-end': '#ffcdd2',
        'warning-text': '#c62828',
        'warning-border': '#f44336',
        
        // Background colors
        'form-bg': '#f8f9fa',
        'result-bg': 'rgba(4, 59, 92, 0.4)',
        'placeholder-bg': 'rgba(255, 255, 255, 0.9)',
      },
      backgroundImage: {
        'ski-mountain': "url('./assets/chris-biron-JVtcrWcbj1c-unsplash.jpg')",
        'danger-gradient': 'linear-gradient(45deg, #ff4444, #cc0000)',
        'fixed-grip-gradient': 'linear-gradient(45deg, #ff6b6b, #ff4757)',
        'warning-filter-gradient': 'linear-gradient(45deg, #ffebee, #ffcdd2)',
        'placeholder-gradient': 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      },
      animation: {
        'danger-pulse': 'dangerPulse 2s infinite',
      },
      keyframes: {
        dangerPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 68, 68, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 68, 68, 0)' },
        }
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.15)',
      },
      fontSize: {
        'xs-custom': '0.75rem',
        'sm-custom': '0.85rem',
        'base-custom': '0.9rem',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}