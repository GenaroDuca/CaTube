import { S3Client } from "@aws-sdk/client-s3";

export const getS3Client = () => {
    
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
    const region = process.env.AWS_REGION?.trim();

    // Verificación de seguridad
    if (!accessKeyId || !secretAccessKey || !region) {
        console.error("ERROR S3: Credenciales de AWS faltantes o inválidas.");
        throw new Error("AWS credentials missing. Ensure .env is loaded first.");
    }

    return new S3Client({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    });
};