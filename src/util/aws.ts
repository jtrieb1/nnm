import { CreateAccessKeyCommand, IAMClient } from "@aws-sdk/client-iam";
import { S3Client } from "@aws-sdk/client-s3";

async function getS3Client(): Promise<S3Client> {
    const iamClient = new IAMClient({});

    const createAccessKeyResponse = await iamClient.send(new CreateAccessKeyCommand({
        UserName: "nnmSite",
    }));

    if (
        !createAccessKeyResponse.AccessKey?.AccessKeyId ||
        !createAccessKeyResponse.AccessKey?.SecretAccessKey
    ) {
        throw new Error("Access key not created");
    }

    const {
        AccessKey: { AccessKeyId, SecretAccessKey },
    } = createAccessKeyResponse;

    let s3 =  new S3Client({
        region: "us-east-1",
        credentials: {
            accessKeyId: AccessKeyId,
            secretAccessKey: SecretAccessKey,
        },
    });
    return s3; 
}

export default getS3Client;