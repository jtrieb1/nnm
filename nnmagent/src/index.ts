import express, { Request, Response } from 'express';
import { CopywriterGraphAgent } from './agents/copywriter';

const app = express();
const port = process.env.AGENTPORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/new_issue", async (req: Request, res: Response) => {
    const agent = new CopywriterGraphAgent();
    try {
        let response = await agent.invoke();
        res.send(response);
    } catch (e) {
        res.send(JSON.stringify({ error: `${e}` }));
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});