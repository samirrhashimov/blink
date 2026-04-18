const cloudinary = require('cloudinary').v2;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { publicId, resourceType } = JSON.parse(event.body);

    if (!publicId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing publicId' }) };
    }

    cloudinary.config({
      cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };
  } catch (error) {
    console.error('Delete Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
