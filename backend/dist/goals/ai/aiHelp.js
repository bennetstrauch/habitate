"use strict";
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
exports.tool_findOneGoalHelper = exports.toolNamesToFunctionMap = exports.handleAddHabitHelp = void 0;
const embedding_1 = require("./embedding");
const goals_controller_1 = require("../goals.controller");
const context = [
    {
        role: "system",
        content: `The user is using an app 'habitate' that helps him to define goals 
    and for those goals he can define habits.
    He is reaching out to you, because he needs help to define a good habit for a goal he already defined.

    Those habits should be kept simple and doable without strain on a daily basis.
    A habbit should take 1-30 minutes.

    You are interacting with the user as a helpful, kind coach to help him find a proper habit.
    You can ask meaningful questions to help him find his own solution.
    Only if the user asks explicitly for you to suggest habits, 
    or if he can't find an answer after a few minutes,
    you can make suggestions,
    but the user should always have the last word.

    In the end, if a habit is found, ask the user kindly,
    to type the final version of it 
    one more time in the chat, in his own words. ##

    You can access the goal the user is talking about with the provided function in tools.
    Definitely check the name, description and the habits he already defined for it,
    so you can take them into account when helping him to define a new one.

    `,
    },
];
const currentGoalId = "";
const handleAddHabitHelp = (goal_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Handling habit help for goal", goal_id);
    if (context.length === 1) {
        context.push({
            role: "user",
            content: `Could you help me to define a habit for my goal?
                goal_id: ${goal_id}`,
        });
    }
    const response = yield embedding_1.openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
        tools: [exports.tool_findOneGoalHelper],
    });
    if (response.choices[0].finish_reason === "tool_calls") {
        const toolCall = response.choices[0].message.tool_calls[0];
        const toolName = toolCall.function.name;
        const stringArguments = toolCall.function.arguments;
        const parsedArguments = JSON.parse(stringArguments);
        const callResult = yield exports.toolNamesToFunctionMap[toolName](parsedArguments);
        context.push({
            role: "tool",
            content: JSON.stringify(callResult),
            tool_call_id: toolCall.id,
        });
    }
    else {
        context.push({
            role: "assistant",
            content: (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content,
        });
    }
    return null;
});
exports.handleAddHabitHelp = handleAddHabitHelp;
exports.toolNamesToFunctionMap = {
    findOneGoalHelper: goals_controller_1.findOneGoalHelper,
};
exports.tool_findOneGoalHelper = {
    type: "function",
    function: {
        name: "findOneGoalHelper",
        description: "Returns a goal object by its id",
        parameters: {
            type: "object",
            properties: { goal_id: { type: "string", description: "goal id" } },
            required: ["goal_id"],
        },
    },
};
