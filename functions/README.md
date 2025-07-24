# Serverless Functions

This directory contains Netlify serverless functions for the Med-Tech Society website.

## run-tumor.js

Handles tumor detection via HuggingFace Inference API integration.

### Environment Variables Required

- `HF_TOKEN`: HuggingFace API token for model inference

### API Endpoint

- **URL**: `/.netlify/functions/run-tumor`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Form data with 'image' field containing the histology image file

### Response Format

```json
{
  "confidence": 0.85,
  "malignancyScore": 0.72,
  "analysis": "The model detected malignant tissue with 85% confidence...",
  "processingTime": "2.3",
  "predictions": [
    {
      "label": "malignant",
      "score": 0.85
    }
  ]
}
```

### Error Responses

- **400**: Bad request (invalid file type, missing file, etc.)
- **413**: File too large (>10MB)
- **415**: Unsupported media type
- **500**: Server error
- **502**: HuggingFace API error
- **503**: Model loading (temporary)

### File Constraints

- **Max size**: 10MB
- **Allowed types**: JPG, PNG, TIFF
- **Processing**: Images are sent directly to HuggingFace API

### Local Development

1. Set environment variable: `export HF_TOKEN=your_token_here`
2. Run: `netlify dev`
3. Function available at: `http://localhost:8888/.netlify/functions/run-tumor`