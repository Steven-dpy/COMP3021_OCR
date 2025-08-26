import React, { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setSerialNumber(data.serial_number)
      setConfidence(data.confidence)
    } catch (err) {
      setError('An error occurred during recognition. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blue Part Serial Number Recognition</h1>

        <div className="upload-container">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />

          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="upload-button"
          >
            {loading ? 'Processing...' : 'Recognize Serial Number'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {serialNumber && (
          <div className="result-container">
            <h2>Recognition Result</h2>
            <p>
              <strong>Serial Number:</strong> {serialNumber}
            </p>
            <p>
              <strong>Confidence:</strong> {Math.round(confidence * 100)}%
            </p>
          </div>
        )}
      </header>
    </div>
  )
}

export default App
