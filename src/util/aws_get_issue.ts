import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import getS3Client from "./aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";

async function getIssue(issueId: number): Promise<string> {
    const s3Client = await getS3Client();

    const command = new GetObjectCommand({
        Bucket: "nonothingissues",
        Key: `issue_${issueId}.pdf`,
    });

    const url = getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
}

export default getIssue;