import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

async function getS3Client(): Promise<S3Client> {

    let sc: S3ClientConfig = {
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
        }
    };
    
    let s3 = new S3Client(sc);

    return s3;
}

export default getS3Client;