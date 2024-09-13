import { CreateAccessKeyCommand, IAMClient } from "@aws-sdk/client-iam";
import { S3Client } from "@aws-sdk/client-s3";

async function getS3Client(): Promise<S3Client> {
    let s3 = new S3Client({
        region: "us-east-1"
    });

    return s3; 
}

export default getS3Client;