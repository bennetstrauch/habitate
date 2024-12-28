import OpenAI from "openai";
import { Goal } from "../goals.model";
import { openaiClient } from "./embedding";
import { findOneGoalHelper } from "../goals.controller";



const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
    role: 'system',
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

    `
    }
    ];

    const currentGoalId = ''
   

export const handleAddHabitHelp = async (goal_id: string) => {
    console.log('Handling habit help for goal', goal_id)

    if(context.length === 1){
        context.push({
            role: 'user',
            content: `Could you help me to define a habit for my goal?
                goal_id: ${goal_id}`
            })
    }
    const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: context,
        tools: [tool_findOneGoalHelper]
       });
       
       if (response.choices[0].finish_reason === 'tool_calls') {
        const toolCall = response.choices[0].message.tool_calls![0];
        const toolName = toolCall.function.name

        const stringArguments = toolCall.function.arguments;
        const parsedArguments = JSON.parse(stringArguments);

        const callResult = await toolNamesToFunctionMap[toolName as keyof typeof toolNamesToFunctionMap](parsedArguments);
        
        context.push({
            role: 'tool',
            content: JSON.stringify(callResult),
            tool_call_id: toolCall.id
        }); 

    } else {
        context.push({
            role: 'assistant',
            content: response.choices[0]?.message?.content
        });


    }

    return null
}


export const toolNamesToFunctionMap = {
    findOneGoalHelper
}


export const tool_findOneGoalHelper = { 
    type: 'function' as const,
    function: { 
        name: 'findOneGoalHelper',
        description: 'Returns a goal object by its id',
        parameters: { 
            type: 'object',
            properties: { goal_id: { type: 'string', description: 'goal id' }},
            required: ['goal_id'] 
        }
    }
}