// /utils/uploadImage.js
export const uploadImage = async ({ file, onSuccess, onError }) => {
  if (!file) {
    onError?.('Please select an image file first')
    return
  }

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/upload/', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Upload failed')

    const data = await response.json()
    onSuccess?.({
      serialNumber: data.serial_number,
      confidence: data.confidence,
      images: {
        origin_image: data.origin_image,
        cropped_image: data.cropped_image,
        stretched_image: data.stretched_image,
        processed_image: data.processed_image,
        ocr_image: data.ocr_image,
      },
    })
  } catch (err) {
    console.error('Error:', err)
    onError?.('An error occurred during recognition. Please try again.')
  }
}
