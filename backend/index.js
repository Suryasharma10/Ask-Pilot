import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import readline from 'node:readline/promises';
import {MessagesAnnotation,StateGraph} from '@langchain/langgraph';
import {ToolNode} from '@langchain/langgraph/prebuilt';
import {TavilySearch} from "@langchain/tavily";
import {ChatGroq} from "@langchain/groq";
import {MemorySaver} from "@langchain/langgraph";

const checkpointer = new MemorySaver();
/**
 * 1 Define the node function
 * 2 build the graph
 * 3 compile and invoke the graph
 */

// initialize the LLM 
const tool=new TavilySearch({
  maxResults: 3,
  topic: "general",
});

const tools=[tool];
const toolNode = new ToolNode(tools);
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxRetries: 2,
}).bindTools(tools);


async function callModel(state){
    // calling using LLM APIs...
    // console.log("Calling LLM...");
    const response = await llm.invoke(state.messages);
    return {messages:[response]};
}
function shouldContinue(state){
  //put your conditions wheather to call a tool or not
  const lastMessage = state.messages[state.messages.length - 1];
  if(lastMessage.tool_calls && lastMessage.tool_calls.length>0){
    return 'tools';
  }
  return '__end__';
}

/**
 * build the graph
 */
const graph = new StateGraph(MessagesAnnotation)
.addNode('agent', callModel)
.addNode("tools",toolNode)
.addEdge('__start__', 'agent')
.addConditionalEdges('agent', shouldContinue, {'tools': 'tools', '__end__': '__end__'})
.addEdge('tools', 'agent');

/**
 * compile the graph
 */

const compiledGraph = graph.compile({checkpointer});

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// async function main() {
//   while(true){
//     const userInput = await rl.question('You:');
//     if(userInput==="bye"){
//         console.log("Exiting the program.");
//         break;
//     }
//     const result = await compiledGraph.invoke({
//         messages: [{role: 'user', content: userInput}],
//     },{ configurable: { thread_id:"1" } });
//     const lastMessage = result.messages[result.messages.length - 1];
//     console.log("Assistant:", lastMessage.content);   
//     }
//   rl.close();
// }
// main();
export {compiledGraph};