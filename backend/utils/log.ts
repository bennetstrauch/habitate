import { RequestHandler } from "express";
import { StandardResponse } from "../types/standardResponse";

type logPayload = {
  timestamp: string;
  level: "INFO" | "ERROR";
  message: string;
  data?: any;
  component: string;
  userAgent: string;
};
type LogReqHandler = RequestHandler<
  unknown,
  StandardResponse<string>,
  logPayload,
  unknown
>;
// POST endpoint to receive and log to console
export const logPayload: LogReqHandler = (req, res) => {
    console.log("Received log payload:");
  try {
    const { timestamp, level, message, data, component, userAgent } = req.body;

    // Format the log message for console output
    const logMessage = `
[${timestamp}] ${level} [${component}]
Message: ${message}
User Agent: ${userAgent}
Data: ${data}
    `.trim();

    // Print to console based on log level
    if (level === "ERROR") {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }

    res.status(200).send({ success: true, data: "Log received" });
  } catch (error) {
    console.error("Error processing log:", error);
    res.status(500).send({ success: false, data: "Failed to process log" });
  }
};
