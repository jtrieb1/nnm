import BACKEND_URL from "./aws";

export async function getIssueUrl(issueNumber: number): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/issue/${issueNumber}`);
    // Returns a signed URL to the PDF
    return response.text();
}

export async function getLatestIssueUrl(): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/latest`);
    // Returns a signed URL to the PDF
    return response.text();
}

export async function getIssueData(issueNumber: number): Promise<{issueNumber: number, blurb: string, contributors: Array<{name: string, handle: string}>}> {
    const response = await fetch(`${BACKEND_URL}/issuedata/${issueNumber}`);
    if (!response.ok) {
        return {
            issueNumber,
            blurb: "",
            contributors: []
        };
    }
    return response.json();
}
