/**
 * Serverless function for HuggingFace API integration
 * Handles tumor detection via HuggingFace Inference API
 */

const https = require('https');
const { Buffer } = require('buffer');

// HuggingFace API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/swin-tiny-patch4-window7-224';
const HF_TOKEN = process.env.HF_TOKEN;

// Supported file types and size limits
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Parse multipart form data to extract file
 */
function parseMultipartData(body, boundary) {
    const parts = body.split(`--${boundary}`);
    
    for (const part of parts) {
        if (part.includes('Content-Disposition: form-data; name="image"')) {
            // Find the start of file data (after headers)
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;
            
            // Extract content type from headers
            const headers = part.substring(0, headerEnd);
            const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
            const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
            
            // Extract file data
            const fileData = part.substring(headerEnd + 4);
            // Remove trailing boundary markers
            const cleanData = fileData.replace(/\r\n--.*$/, '');
            
            return {
                data: Buffer.from(cleanData, 'binary'),
                contentType: contentType
            };
        }
    }
    
    return null;
}

/**
 * Make request to HuggingFace API
 */
function queryHuggingFace(imageBuffer) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api-inference.huggingface.co',
            path: '/models/microsoft/swin-tiny-patch4-window7-224',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/octet-stream',
                'Content-Length': imageBuffer.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const result = JSON.parse(data);
                        resolve(result);
                    } else if (res.statusCode === 503) {
                        // Model is loading
                        const error = JSON.parse(data);
                        reject(new Error(`Model loading: ${error.error || 'Please try again in a few moments'}`));
                    } else {
                        const error = JSON.parse(data);
                        reject(new Error(`HuggingFace API error: ${error.error || 'Unknown error'}`));
                    }
                } catch (parseError) {
                    reject(new Error(`Failed to parse API response: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Network error: ${error.message}`));
        });

        req.write(imageBuffer);
        req.end();
    });
}

/**
 * Process HuggingFace response and format for frontend
 */
function processApiResponse(hfResponse) {
    // HuggingFace image classification typically returns an array of predictions
    if (!Array.isArray(hfResponse) || hfResponse.length === 0) {
        throw new Error('Invalid API response format');
    }
    
    // Find the highest confidence prediction
    const topPrediction = hfResponse.reduce((max, current) => 
        current.score > max.score ? current : max
    );
    
    // Determine if it's malignant based on label
    const isMalignant = topPrediction.label.toLowerCase().includes('malignant') || 
                       topPrediction.label.toLowerCase().includes('cancer') ||
                       topPrediction.label.toLowerCase().includes('tumor');
    
    // Calculate malignancy score (this is a simplified approach)
    const malignancyScore = isMalignant ? topPrediction.score : (1 - topPrediction.score);
    
    // Generate analysis text
    const analysis = `The model detected ${topPrediction.label} with ${Math.round(topPrediction.score * 100)}% confidence. ${
        isMalignant ? 'This suggests potential malignant characteristics.' : 'This suggests benign characteristics.'
    } Please note this is for research purposes only.`;
    
    return {
        confidence: topPrediction.score,
        malignancyScore: malignancyScore,
        analysis: analysis,
        processingTime: '2.3', // Placeholder - in real implementation, measure actual time
        // Note: heatmapUrl would require additional processing to generate visualization
        // For now, we'll omit it or provide a placeholder
        predictions: hfResponse.slice(0, 3) // Top 3 predictions for debugging
    };
}

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Check if HuggingFace token is configured
        if (!HF_TOKEN) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'HuggingFace API token not configured' 
                })
            };
        }
        
        // Parse multipart form data
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Content-Type must be multipart/form-data' 
                })
            };
        }
        
        // Extract boundary from content type
        const boundaryMatch = contentType.match(/boundary=([^;]+)/);
        if (!boundaryMatch) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing boundary in multipart data' 
                })
            };
        }
        
        const boundary = boundaryMatch[1];
        const body = event.isBase64Encoded ? 
            Buffer.from(event.body, 'base64').toString('binary') : 
            event.body;
        
        // Parse the uploaded file
        const fileData = parseMultipartData(body, boundary);
        if (!fileData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'No image file found in request' 
                })
            };
        }
        
        // Validate file type
        if (!ALLOWED_TYPES.includes(fileData.contentType)) {
            return {
                statusCode: 415,
                headers,
                body: JSON.stringify({ 
                    error: 'Unsupported file type. Please use JPG, PNG, or TIFF images.' 
                })
            };
        }
        
        // Validate file size
        if (fileData.data.length > MAX_FILE_SIZE) {
            return {
                statusCode: 413,
                headers,
                body: JSON.stringify({ 
                    error: 'File too large. Maximum size is 10MB.' 
                })
            };
        }
        
        // Record start time for processing time calculation
        const startTime = Date.now();
        
        // Query HuggingFace API
        const hfResponse = await queryHuggingFace(fileData.data);
        
        // Calculate processing time
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Process and format response
        const result = processApiResponse(hfResponse);
        result.processingTime = processingTime;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('Function error:', error);
        
        // Handle specific error types
        if (error.message.includes('Model loading')) {
            return {
                statusCode: 503,
                headers,
                body: JSON.stringify({ 
                    error: error.message 
                })
            };
        }
        
        if (error.message.includes('HuggingFace API error')) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ 
                    error: error.message 
                })
            };
        }
        
        // Generic server error
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error. Please try again later.' 
            })
        };
    }
};