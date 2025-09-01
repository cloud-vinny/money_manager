export function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: '20px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(59, 130, 246, 0.2)',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <h2>Loading...</h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
        Please wait while we fetch your financial data...
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
