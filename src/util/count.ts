import BACKEND_URL from "./aws";

async function getCount(): Promise<number> {
    const response = await fetch(`${BACKEND_URL}/count`);
    const data = await response.json();
    if (data.count === undefined) {
        console.error('Invalid response from server');
        console.error(data);
        return 0;
    }
    return Number(data.count);
}

export default getCount;