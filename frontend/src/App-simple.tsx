import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb' }}>🚀 Co-Lab VERITAS™</h1>
      <h2>Sustainability Management Platform</h2>
      <div style={{ 
        background: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0' 
      }}>
        <h3>✅ React App is Working!</h3>
        <p>The frontend is now rendering successfully.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h4>🔐 Demo Login Credentials:</h4>
          <ul>
            <li><strong>Email:</strong> admin@acme.com</li>
            <li><strong>Password:</strong> password123</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>🌐 Server Status:</h4>
          <ul>
            <li>✅ Frontend: http://localhost:3001</li>
            <li>✅ Backend API: http://localhost:3000</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#dbeafe', 
          borderRadius: '6px' 
        }}>
          <p><strong>Next Step:</strong> The basic React app is working. We can now restore the full application with routing and authentication.</p>
        </div>
      </div>
    </div>
  )
}

export default App
