// A stylish Google sign-in button that encapsulates the click handling.
// Props:
// - onClick: async handler invoked when user wants to sign in with Google
// - disabled: boolean to disable the button while loading
// - isLoading: boolean to show a loading state
export default function GoogleAuthProvider({ onClick, disabled, isLoading }) {
  return (
    <button
      type="button"
      className="google-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Sign in with Google"
    >
      <span className="g-icon" aria-hidden>
        {/* Google "G" mark SVG */}
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.9 0 7.3 1.3 10 3.6l7.4-7.4C36.2 2.4 30.5 0 24 0 14.7 0 6.6 4.6 2.5 11.3l8.6 6.7C13.5 13 18 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.6c-.5 2.6-2 4.9-4.2 6.4l6.7 5.2c3.9-3.6 6.8-8.9 6.8-15.7z"/>
          <path fill="#4A90E2" d="M10.6 29.9c-.9-2.7-1-5.6-.2-8.3L1.9 14.9C.7 17.8 0 20.8 0 24c0 3.2.7 6.2 1.9 9.1l8.7-3.2z"/>
          <path fill="#FBBC05" d="M24 48c6.5 0 12.2-2.1 16.3-5.8l-7.9-6.1C31.4 34.9 27.8 36 24 36c-6 0-10.5-3.5-12.9-8.7L2.5 36.7C6.6 43.4 14.7 48 24 48z"/>
        </svg>
      </span>
      <span className="g-label">
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  );
}
