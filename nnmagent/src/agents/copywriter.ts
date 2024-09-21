import { AIMessage, AIMessageChunk, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph} from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import * as pdfjslib from "pdfjs-dist/legacy/build/pdf.mjs";

import { createWorker } from 'tesseract.js';
import { Runnable } from "@langchain/core/runnables";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";

const LatestIssueCreditsExtractor = tool(async () => {
    // Grab the PDF from S3
    // We can do this using a regular backend call
    let pdfurl = await (await fetch("0.0.0.0:8000/issue/latest")).text();
    // URL is a signed URL that expires in a few seconds
    // Now fetch the PDF
    let pdf = await fetch(pdfurl);
    // Check if the PDF is valid
    if (!pdf.ok) {
        throw new Error("Failed to fetch PDF");
    }
    // Check if the PDF is a PDF
    if (pdf.headers.get("Content-Type") !== "application/pdf") {
        throw new Error("Not a PDF");
    }

    // Use a PDF library to extract the first page
    // We'll use pdf.js for this
    const pdfData = new Uint8Array(await pdf.arrayBuffer());
    const pdfDocLoadingTask = pdfjslib.getDocument(pdfData);
    const pdfDoc = await pdfDocLoadingTask.promise;
    const pdfPage = await pdfDoc.getPage(1);

    // Extract only the first page as an image
    const viewport = pdfPage.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await pdfPage.render({ canvasContext: canvasContext!, viewport }).promise;
    const imgData = canvas.toDataURL('image/jpeg');

    // Use Tesseract to extract text from the image
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imgData);
    await worker.terminate();
    // Return the text
    return ret.data.text;
},
{
    name: "LatestIssueCreditsExtractor",
    description: "Extracts text from the credits page of the latest issue",
    schema: z.object(
        {
            issueNumber: z.number()
        }
    )
});

const LatestIssueFullTextExtractor = tool(async () => {
    // Grab the PDF from S3
    // We can do this using a regular backend call
    // First, get the issue count
    let count = await (await fetch(`${process.env.BACKEND_URL}/issue/count`)).json();
    // Check if count is an error
    if (count.error) {
        throw new Error(count.error);
    }
    // Now get the latest issue
    let pdfurl = await (await fetch(`${process.env.BACKEND_URL}/issue/${count.count}`)).text();
    // URL is a signed URL that expires in a few seconds
    // Now fetch the PDF
    let pdf = await fetch(pdfurl);
    // Check if the PDF is valid
    if (!pdf.ok) {
        throw new Error("Failed to fetch PDF");
    }
    // Check if the PDF is a PDF
    if (pdf.headers.get("Content-Type") !== "application/pdf") {
        throw new Error("Not a PDF");
    }

    // Extract all text from the PDF
    const pdfData = new Uint8Array(await pdf.arrayBuffer());
    const pdfDocLoadingTask = pdfjslib.getDocument(pdfData);
    const pdfDoc = await pdfDocLoadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pdfPage = await pdfDoc.getPage(i);
        const textContent = await pdfPage.getTextContent();
        fullText += textContent.items.map((item) => {
            if ('str' in item) {
                return item.str;
            }
            return '';
        }).join(" ");
    }
    return fullText;
},
{
    name: "LatestIssueFullTextExtractor",
    description: "Extracts full text from the latest issue",
    schema: z.void()
});

export const CopywriterGraphAgentStateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (currentState, updateValue) => currentState.concat(updateValue),
        default: () => [],
    })
});

export class CopywriterGraphAgent {
  private openai: Runnable<BaseLanguageModelInput, AIMessageChunk>;
  private memory: MemorySaver;
  private tools: ToolNode;

  constructor() {
    this.tools = new ToolNode([LatestIssueCreditsExtractor, LatestIssueFullTextExtractor]);

    this.openai = new ChatOpenAI({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
    }).bindTools([LatestIssueCreditsExtractor, LatestIssueFullTextExtractor]);

    this.memory = new MemorySaver();
  }

  async invoke(): Promise<string> {
    let workflow = new StateGraph(CopywriterGraphAgentStateAnnotation)
    .addNode("agent", this.callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", this.tools)
    .addConditionalEdges("agent", this.shouldContinue)
    .addEdge("tools", "agent");

    let app = workflow.compile({ checkpointer: this.memory });
    const blurbstate = await app.invoke({
        messages: [new HumanMessage("Can you please write a blurb for the newest issue of our magazine?")],
    }, { configurable: { thread_id: 0 }});
    let blurb = blurbstate.messages[blurbstate.messages.length - 1].content;

    const creditsstate = await app.invoke({
        messages: [new HumanMessage("Can you also give me a list of the contributors and their handles from the latest issue?")],
    }, { configurable: { thread_id: 0 }});
    let credits = creditsstate.messages[creditsstate.messages.length - 1].content;

    return JSON.stringify({ blurb, credits });
  }

  async callModel(state: typeof CopywriterGraphAgentStateAnnotation.State): Promise<{messages: AIMessageChunk[]}> {
    const messages = state.messages;
    const response = await this.openai.invoke(messages);

    // Return a list for concat
    return { messages: [response] };
  }

  shouldContinue(state: typeof CopywriterGraphAgentStateAnnotation.State): string {
    const messages = state.messages;
    const last_message = messages[messages.length - 1] as AIMessage;

    // If it's a tool call, go to the tools node
    if (last_message.tool_calls?.length) {
        return "tools";
    }

    return "__end__";
  }
}