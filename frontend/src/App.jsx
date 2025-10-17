// src/App.jsx
import React, { useState, useRef } from 'react'
import { uploadImage } from '@utils/uploadImage'
/**
 * Mock data – replace with your own if needed.
 * Each item represents one row in the table.
 */
const initialRows = [
  {
    id: 1,
    checked: false,
    image: null, // will hold a File URL
    status: 'idle', // idle | processing | success | failed
    result: '',
  },
]

export default function App() {
  const [user, setUser] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10) // today's date in YYYY-MM-DD format
  )
  const [rows, setRows] = useState(initialRows)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  // #region logic

  /** Refresh the page data */
  const handleRefresh = () => {
    setRows(initialRows)
  }

  /** Add a new empty row */
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        checked: false,
        image: null,
        preview: null,
        status: 'idle',
        result: '',
        processingTime: 0,
      },
    ])
  }

  /** Remove a row */
  const removeRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId))
  }

  /** Add image(s) to an existing row */
  const addImageToRow = (rowId, files) => {
    const file = files[0]
    const preview = URL.createObjectURL(file)
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, image: file, preview: preview } : r
      )
    )
  }

  /** Remove image from a row */
  const removeImage = (rowId) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, image: null, preview: null } : r
      )
    )
  }

  /** Handle drag & drop of multiple images */
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const newRows = files.map((file) => ({
      id: Date.now() + Math.random(),
      checked: false,
      image: file,
      preview: URL.createObjectURL(file),
      status: 'idle',
      result: '',
    }))
    setRows((prev) =>
      [...prev, ...newRows].filter((r) => r.image || r.result !== '')
    ) // only keep rows with image or result
  }

  const handleDragOver = (e) => e.preventDefault()

  /** Simulate recognition */
  const startRecognition = (rowId) => {
    // get image
    const row = rows.find((r) => r.id === rowId)
    if (!row || !row.image) {
      alert('Please add an image first')
      return
    }

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((new Date() - start) / 1000)
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId ? { ...r, processingTime: elapsed } : r
        )
      )
    }, 1000)

    const start = new Date()
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, status: 'processing', processingTime: 0 } : r
      )
    )

    uploadImage({
      file: row.image,
      onSuccess: ({ serialNumber, confidence, images }) => {
        clearInterval(intervalId)
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  status: 'success',
                  result: serialNumber,
                }
              : r
          )
        )
      },
      onError: (msg) => {
        clearInterval(intervalId)
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? { ...r, status: 'failed', result: msg, processingTime: 0 }
              : r
          )
        )
      },
    })
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    if (e.target === e.currentTarget) {
      setIsDragging(false)
    }
  }

  const startRecognitionAll = () => {
    rows.forEach((row) => {
      if (row.image) {
        startRecognition(row.id)
      }
    })
  }

  const startRecognitionNoResult = () => {
    rows.forEach((row) => {
      if (row.image && row.status !== 'success') {
        startRecognition(row.id)
      }
    })
  }

  const printRecognitionResult = () => {
    // Print the table id = "printTable"
    window.print()
  }

  const downloadAllCSV = () => {
    downloadCSV(rows.filter((row) => row.image || row.result !== ''))
  }

  const downloadOneRowCSV = (rowId) => {
    const row = rows.find((r) => r.id === rowId)
    if (row) {
      downloadCSV([row])
    }
  }

  const downloadCSV = (rows) => {
    let csvContent =
      ',User name: ' +
      (user === '' ? 'N/A' : user) +
      ',Date: ' +
      (date === '' ? 'N/A' : date) +
      '\n'
    if (rows.length > 0) {
      rows.forEach((row) => {
        csvContent +=
          'Serial Number: ' + (row.result === '' ? 'N/A' : row.result) + ',,\n'
      })
    } else {
      csvContent += 'Serial Number: NO DATA,,\n'
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `ocr_serial_numbers_${date || 'unknown_date'}.csv`
    )
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // #endregion

  return (
    <div
      className="min-h-screen bg-gray-50 p-6"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Top Buttons */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={addRow}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Row
          </button>
          <button
            onClick={startRecognitionNoResult}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Recognize All (No Result)
          </button>
          <button
            onClick={startRecognitionAll}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Recognize All
          </button>
        </div>

        <button
          onClick={printRecognitionResult}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print
        </button>
      </div>

      {/* Input user and date */}
      <div className="flex justify-between mb-4 gap-4">
        <label className="flex items-center w-full">
          <span className="mr-2">User:</span>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </label>
        <label className="flex items-center w-full">
          <span className="mr-2">Date:</span>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      {/* Input user and date */}

      {/* Parts Recognition Table */}
      <div
        className={`overflow-x-auto border rounded bg-white shadow transition-all duration-200 ${
          isDragging ? 'border-4 border-blue-400 shadow-lg' : 'border'
        }`}
      >
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">
                <input type="checkbox" />
              </th>
              <th className="p-2">Image</th>
              <th className="p-2">OCR Result</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, checked: e.target.checked }
                            : r
                        )
                      )
                    }
                  />
                </td>
                <td className="p-2">
                  {row.image ? (
                    <div className="relative w-24 h-24">
                      <img
                        src={row.preview}
                        alt="uploaded"
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(row.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                      onClick={() => {
                        fileInputRef.current.click()
                        fileInputRef.current.onchange = (e) =>
                          addImageToRow(row.id, e.target.files)
                      }}
                    >
                      Add Image
                    </button>
                  )}
                </td>
                <td className="p-2">{row.result}</td>
                <td className="p-2">
                  <div className="flex flex-col">
                    {row.status === 'idle' && ''}
                    {row.status === 'processing' && (
                      <span className="text-yellow-600">Processing</span>
                    )}
                    {row.status === 'success' && (
                      <span className="text-green-600">Success</span>
                    )}
                    {row.status === 'failed' && (
                      <span className="text-red-600">Failed</span>
                    )}
                    <span>
                      {row.processingTime
                        ? row.processingTime.toFixed(2) + 's'
                        : ''}
                    </span>
                  </div>
                </td>

                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => startRecognition(row.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Recognize
                  </button>
                  <button
                    onClick={() => downloadOneRowCSV(row.id)}
                    className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => removeRow(row.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete Row
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Bottom Download Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={downloadAllCSV}
        >
          Download OCR Result CSV File
        </button>
      </div>

      {/* Print Table - Hidden */}
      <div id="printTable" className="print:flex hidden">
        <table className="min-w-full text-left text-sm border rounded bg-white shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2"></th>
              <th className="p-2 border-x">
                User name:
                {user === '' ? 'N/A' : user}
              </th>
              <th className="p-2">
                Date:
                {date === '' ? 'N/A' : date}
              </th>
            </tr>
          </thead>
          <tbody className="">
            {rows.filter((row) => row.image || row.result !== '').length > 0 ? (
              rows
                .filter((row) => row.image || row.result !== '')
                .map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-t ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="p-2">
                      Serial Number:
                      {row.result === '' ? 'N/A' : row.result}
                    </td>
                    <td className="p-2 border-x"></td>
                    <td className="p-2"></td>
                  </tr>
                ))
            ) : (
              <tr className={`border-t bg-white`}>
                <td className="p-2">Serial Number: NO DATA</td>
                <td className="p-2 border-x"></td>
                <td className="p-2"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Print Table - Hidden */}
    </div>
  )
}
