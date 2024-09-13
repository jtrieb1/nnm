import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import getS3Client from "./aws";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function getCount(): Promise<number> {
    const s3Client = await getS3Client();

    const command = new ListObjectsV2Command({
        Bucket: "nonothingissues",
    });

    let url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    let response = await fetch(url);
    let data = await response.json();
    let count = data.Contents.length;
    return count;
}

export default getCount;