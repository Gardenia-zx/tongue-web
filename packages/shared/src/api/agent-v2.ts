import { apiRequest } from "./client";
import type { AgentChatV2Request, AgentChatV2Response } from "../types";

export const agentChatV2Api = {
  chat(request: AgentChatV2Request) {
    const compact = request.message.content.replace(/\s+/g, "");
    const explicitNoReport = /(不要结合报告|不参考报告|不用报告|这是新问题|单独问一下)/.test(compact);
    const mode = request.contextBinding.mode === "NONE" && !explicitNoReport
      ? "AUTO"
      : request.contextBinding.mode;

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
          mode,
          report_id: request.contextBinding.reportId,
        },
        client_context: request.clientContext || {},
      },
    });
  },
};
