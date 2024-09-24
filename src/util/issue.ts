import BACKEND_URL from "./aws";

export async function getIssueUrl(issueNumber: number) {
    const response = await fetch(`${BACKEND_URL}/issue/${issueNumber}`);
    // Returns a signed URL to the PDF
    return response.text();
}

export async function getLatestIssueUrl() {
    const response = await fetch(`${BACKEND_URL}/latest`);
    // Returns a signed URL to the PDF
    return response.text();
}

export async function getIssueData(issueNumber: number) {
    const response = await fetch(`${BACKEND_URL}/issuedata/${issueNumber}`);
    if (!response.ok) {
        return {
            issueNumber,
            blurb: "",
            contributors: []
        };
    }
    // Returns issue data in the following schema:
    // {
    //   number: number,
    //   blurb: string,
    //   contributors: [
    //     {
    //       name: string,
    //       handle: string
    //     }
    //   ]
    // }
    return response.json();
}
