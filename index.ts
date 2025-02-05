import { eq, ilike } from "drizzle-orm";
import db from "./src/db";
import { todoTable } from "./src/db/schema";

import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
} from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const toDoFunctionDeclaration = [
  {
    name: "createTodo",
    description: "create a todo item for user tasks",
    parameters: {
      type: SchemaType.OBJECT,
      description: "create a todo",
      properties: {
        title: {
          type: SchemaType.STRING,
          description:
            "The title of the todo which is a short description of what needs to be done.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "searchTodo",
    parameters: {
      type: SchemaType.OBJECT,
      description: "search a todo item for user tasks",
      properties: {
        titleSearch: {
          type: SchemaType.STRING,
          description:
            "The title of the todo which is a short description of what needs to be done.",
        },
      },
      required: ["titleSearch"],
    },
    description: "search a todo item for user tasks",
  },
  {
    name: "deleteTodo",
    parameters: {
      type: SchemaType.OBJECT,
      description: "delete a todo item for user tasks",
      properties: {
        id: {
          type: SchemaType.NUMBER,
          description:
            "The id of the todo which is a short description of what needs to be done.",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "getAllTodos",
    description: "get all todo items for user tasks",
  },
] satisfies FunctionDeclaration[];

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [
    {
      functionDeclarations: toDoFunctionDeclaration as FunctionDeclaration[],
    },
  ],
});

async function getAllTodos() {
  return { result: await db.select().from(todoTable) };
}

async function createTodo({ title }: { title: string }) {
  const [result] = await db.insert(todoTable).values({ title }).returning();
  return result;
}

async function deleteTodo({ id }: { id: number }) {
  return await db.delete(todoTable).where(eq(todoTable.id, id));
}

async function searchTodo({ titleSearch }: { titleSearch: string }) {
  return {
    result: await db
      .select()
      .from(todoTable)
      .where(ilike(todoTable.title, `%${titleSearch}%`)),
  };
}

const tools = {
  getAllTodos,
  createTodo,
  deleteTodo,
  searchTodo,
};

const chat = await model.startChat();

while (true) {
  const query = prompt(">>> ");
  if (!query) {
    console.log("No query");
    break;
  }
  const result = await chat.sendMessage(query!);
  const call = result.response.functionCalls()?.at(0);
  console.log("🤖 system : ", call);

  if (call) {
    // Call the executable function named in the function call
    // with the arguments specified in the function call and
    // let it call the hypothetical API.
    const apiResponse = await tools[call.name as keyof typeof tools](
      call.args as never
    );

    console.log("observation : ", apiResponse);
    // Send the API response back to the model so it can generate
    // a text response that can be displayed to the user.
    const result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: "createTodo",
          response: apiResponse,
        },
      },
    ]);

    // Log the text response.
    console.log("🤖 response : ", result2.response.text());
  }
}
