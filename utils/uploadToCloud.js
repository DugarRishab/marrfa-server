const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const generateUID = require('../utils/generateUID');
const AppError = require('./appError');

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

// Configure AWS S3
const s3 = new S3Client({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
    },
    region: AWS_REGION,
});

module.exports = uploadToCloud = async (file, fileName) => {
	
	const params = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read', // Make the uploaded file public
	};

	const upload = new Upload({
        client: S3Client,
        params: params,
    });
	
	try {
		const data = await s3.send(new PutObjectCommand(params));

		const url = process.env.AWS_BUCKET_URL + `/${fileName}`;

        return url; 
	}
	catch (err) {
		console.error('Error uploading file to cloud: ', err)
		return new AppError('Error uploading file to cloud!: '+ err, 400);
	}

	
}