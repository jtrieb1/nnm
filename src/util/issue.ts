import BACKEND_URL from "./aws";

async function getIssueUrl(issueNumber: number) {
    const response = await fetch(`${BACKEND_URL}/issue/${issueNumber}`);
    // Returns a signed URL to the PDF
    return response.text();
}

export default getIssueUrl;