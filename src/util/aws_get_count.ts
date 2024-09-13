import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import getS3Client from "./aws";

async function getCount(): Promise<number> {
    const s3Client = await getS3Client();

    const command = new ListObjectsV2Command({
        Bucket: "nonothingissues",
    });

    try {
        let isTruncated = true;
        let count = 0;
        
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
            count += Contents?.length || 0;
            isTruncated = IsTruncated || false;
            command.input.ContinuationToken = NextContinuationToken;
        }

        return count;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export default getCount;