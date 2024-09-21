"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopywriterGraphAgent = exports.CopywriterGraphAgentStateAnnotation = void 0;
const PDFJSDIST = import("pdfjs-dist");
const messages_1 = require("@langchain/core/messages");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const openai_1 = require("@langchain/openai");
const langgraph_1 = require("@langchain/langgraph");
const langgraph_2 = require("@langchain/langgraph");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const pdfjslib = __importStar(PDFJSDIST);
const tesseract_js_1 = require("tesseract.js");
const LatestIssueCreditsExtractor = (0, tools_1.tool)(() => __awaiter(void 0, void 0, void 0, function* () {
    // Grab the PDF from S3
    // We can do this using a regular backend call
    let pdfurl = yield (yield fetch("0.0.0.0:8000/issue/latest")).text();
    // URL is a signed URL that expires in a few seconds
    // Now fetch the PDF
    let pdf = yield fetch(pdfurl);
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
    const pdfData = new Uint8Array(yield pdf.arrayBuffer());
    const pdfDocLoadingTask = pdfjslib.getDocument(pdfData);
    const pdfDoc = yield pdfDocLoadingTask.promise;
    const pdfPage = yield pdfDoc.getPage(1);
    // Extract only the first page as an image
    const viewport = pdfPage.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    yield pdfPage.render({ canvasContext: canvasContext, viewport }).promise;
    const imgData = canvas.toDataURL('image/jpeg');
    // Use Tesseract to extract text from the image
    const worker = yield (0, tesseract_js_1.createWorker)('eng');
    const ret = yield worker.recognize(imgData);
    yield worker.terminate();
    // Return the text
    return ret.data.text;
}), {
    name: "LatestIssueCreditsExtractor",
    description: "Extracts text from the credits page of the latest issue",
    schema: zod_1.z.object({
        issueNumber: zod_1.z.number()
    })
});
const LatestIssueFullTextExtractor = (0, tools_1.tool)(() => __awaiter(void 0, void 0, void 0, function* () {
    // Grab the PDF from S3
    // We can do this using a regular backend call
    let pdfurl = yield (yield fetch("0.0.0.0:8000/issue/latest")).text();
    // URL is a signed URL that expires in a few seconds
    // Now fetch the PDF
    let pdf = yield fetch(pdfurl);
    // Check if the PDF is valid
    if (!pdf.ok) {
        throw new Error("Failed to fetch PDF");
    }
    // Check if the PDF is a PDF
    if (pdf.headers.get("Content-Type") !== "application/pdf") {
        throw new Error("Not a PDF");
    }
    // Extract all text from the PDF
    const pdfData = new Uint8Array(yield pdf.arrayBuffer());
    const pdfDocLoadingTask = pdfjslib.getDocument(pdfData);
    const pdfDoc = yield pdfDocLoadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pdfPage = yield pdfDoc.getPage(i);
        const textContent = yield pdfPage.getTextContent();
        fullText += textContent.items.map((item) => {
            if ('str' in item) {
                return item.str;
            }
            return '';
        }).join(" ");
    }
    return fullText;
}), {
    name: "LatestIssueFullTextExtractor",
    description: "Extracts full text from the latest issue",
    schema: zod_1.z.void()
});
exports.CopywriterGraphAgentStateAnnotation = langgraph_2.Annotation.Root({
    messages: (0, langgraph_2.Annotation)({
        reducer: (currentState, updateValue) => currentState.concat(updateValue),
        default: () => [],
    })
});
class CopywriterGraphAgent {
    constructor() {
        this.tools = new prebuilt_1.ToolNode([LatestIssueCreditsExtractor, LatestIssueFullTextExtractor]);
        this.openai = new openai_1.ChatOpenAI({
            model: "gpt-3.5-turbo",
            temperature: 0.8,
        }).bindTools([LatestIssueCreditsExtractor, LatestIssueFullTextExtractor]);
        this.memory = new langgraph_2.MemorySaver();
    }
    invoke() {
        return __awaiter(this, void 0, void 0, function* () {
            let workflow = new langgraph_1.StateGraph(exports.CopywriterGraphAgentStateAnnotation)
                .addNode("agent", this.callModel)
                .addEdge("__start__", "agent")
                .addNode("tools", this.tools)
                .addConditionalEdges("agent", this.shouldContinue)
                .addEdge("tools", "agent");
            let app = workflow.compile({ checkpointer: this.memory });
            const blurbstate = yield app.invoke({
                messages: [new messages_1.HumanMessage("Can you please write a blurb for the newest issue of our magazine?")],
            }, { configurable: { thread_id: 0 } });
            let blurb = blurbstate.messages[blurbstate.messages.length - 1].content;
            const creditsstate = yield app.invoke({
                messages: [new messages_1.HumanMessage("Can you also give me a list of the contributors and their handles from the latest issue?")],
            }, { configurable: { thread_id: 0 } });
            let credits = creditsstate.messages[creditsstate.messages.length - 1].content;
            return JSON.stringify({ blurb, credits });
        });
    }
    callModel(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = state.messages;
            const response = yield this.openai.invoke(messages);
            // Return a list for concat
            return { messages: [response] };
        });
    }
    shouldContinue(state) {
        var _a;
        const messages = state.messages;
        const last_message = messages[messages.length - 1];
        // If it's a tool call, go to the tools node
        if ((_a = last_message.tool_calls) === null || _a === void 0 ? void 0 : _a.length) {
            return "tools";
        }
        return "__end__";
    }
}
exports.CopywriterGraphAgent = CopywriterGraphAgent;
