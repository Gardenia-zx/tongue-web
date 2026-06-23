export function formatDateTime(value?: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 19);
}

export function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "-";
  return `${Math.round(value * 100)}%`;
}

export function featureLabel(code?: string) {
  if (!code) return "-";
  const labels: Record<string, string> = {
    "coating.color.white": "白苔",
    "coating.color.yellow": "黄苔",
    "coating.texture.greasy": "腻苔",
    "coating.thickness.thick": "厚苔",
    "coating.thickness.thin": "薄苔",
    "tongue_body.color.red": "舌质偏红",
    "tongue_body.color.pale": "舌质偏淡",
  };
  return labels[code] || code;
}

export function statusText(status?: string) {
  const map: Record<string, string> = {
    PENDING: "待处理",
    RUNNING: "运行中",
    MODEL_ANALYZING: "图像识别",
    RAG_RETRIEVING: "知识检索",
    REPORT_GENERATING: "生成报告",
    COMPLETED: "已完成",
    FAILED: "失败",
    CANCELED: "已取消",
    DRAFT: "草稿",
    SUBMITTED: "已提交",
    ASSIGNED: "已分配",
    IN_REVIEW: "审核中",
    APPROVED: "已通过",
    REJECTED: "已拒绝",
    ACTIVE: "正常",
  };
  return status ? map[status] || status : "-";
}

export function statusType(status?: string): "success" | "warning" | "danger" | "info" | "primary" {
  if (!status) return "info";
  if (["COMPLETED", "APPROVED", "ACTIVE"].includes(status)) return "success";
  if (["FAILED", "REJECTED"].includes(status)) return "danger";
  if (["RUNNING", "MODEL_ANALYZING", "RAG_RETRIEVING", "REPORT_GENERATING", "IN_REVIEW"].includes(status)) return "primary";
  if (["PENDING", "SUBMITTED", "ASSIGNED", "DRAFT"].includes(status)) return "warning";
  return "info";
}
