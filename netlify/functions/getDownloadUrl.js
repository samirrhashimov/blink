const cloudinary = require('cloudinary').v2;

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const publicId = event.queryStringParameters.publicId;
  const resourceType = event.queryStringParameters.resourceType || 'raw';
  const originalName = event.queryStringParameters.originalName || 'download';
  
  if (!publicId) {
    return { statusCode: 400, body: 'Missing publicId' };
  }

  // Assuming you are configuring these variables in Netlify UI or .env
  cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    // We assume files are uploaded with the 'authenticated' access type via the Unsigned Preset.
    // If you used default 'upload' type, change type to 'upload'.
    const signedUrl = cloudinary.utils.url(publicId, {
      resource_type: resourceType,
      type: 'authenticated', 
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // URL valid for 1 hour
      // fl_attachment to force browser to download
      flags: `attachment:${encodeURIComponent(originalName)}`
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Instruct browser to cache the signed URL for the session/hour
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify({ url: signedUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
