import { apiRequest } from "./client";
import type { AgentChatV2Request, AgentChatV2Response } from "../types";

export const agentChatV2Api = {
  chat(request: AgentChatV2Request) {
    return apiRequest<AgentChatV2Response>("/api/v2/agent/chat", {
      method: "POST",
      body: {
        request_id: request.requestId,
        client_message_id: request.clientMessageId,
        thread_id: request.threadId,
        conversation_id: request.conversationId,
        message: {
          role: request.message.role,
          content_type: request.message.contentType,
          content: request.message.content,
        },
        context_binding: {
          mode: request.contextBinding.mode,
          report_id: request.contextBinding.reportId,
        },
        client_context: request.clientContext || {},
      },
    });
  },
};
