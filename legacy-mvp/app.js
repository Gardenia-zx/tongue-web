const apiEndpointInput = document.querySelector("#apiEndpoint");
const userIdInput = document.querySelector("#userId");
const threadIdInput = document.querySelector("#threadId");
const imageInput = document.querySelector("#imageInput");
const dropzone = document.querySelector("#dropzone");
const previewBox = document.querySelector("#previewBox");
const previewImage = document.querySelector("#previewImage");
const fileInfo = document.querySelector("#fileInfo");
const analyzeButton = document.querySelector("#analyzeButton");
const resetButton = document.querySelector("#resetButton");
const copyButton = document.querySelector("#copyButton");
const serverStatus = document.querySelector("#serverStatus");
const emptyState = document.querySelector("#emptyState");
const resultContent = document.querySelector("#resultContent");
const reportId = document.querySelector("#reportId");
const taskId = document.querySelector("#taskId");
const analysisStatus = document.querySelector("#analysisStatus");
const ragState = document.querySelector("#ragState");
const summaryText = document.querySelector("#summaryText");
const featureList = document.querySelector("#featureList");
const ragQuery = document.querySelector("#ragQuery");
const evidenceList = document.querySelector("#evidenceList");
const rawJson = document.querySelector("#rawJson");
const steps = Array.from(document.querySelectorAll("#steps li"));
const emptyStateDefaultHtml = emptyState.innerHTML;

let selectedFile = null;
let currentSummary = "";

const featureLabels = {
  "coating.color.white": {
    title: "白苔",
    group: "舌苔颜色",
  },
  "coating.color.yellow": {
    title: "黄苔",
    group: "舌苔颜色",
  },
  "coating.texture.greasy": {
    title: "腻苔",
    group: "舌苔质地",
  },
  "coating.thickness.thick": {
    title: "厚苔",
    group: "舌苔厚薄",
  },
  "coating.thickness.thin": {
    title: "薄苔",
    group: "舌苔厚薄",
  },
  "tongue_body.color.red": {
    title: "舌质偏红",
    group: "舌质颜色",
  },
  "tongue_body.color.pale": {
    title: "舌质偏淡",
    group: "舌质颜色",
  },
};

function setStatus(text, type) {
  serverStatus.textContent = text;
  serverStatus.classList.remove("ok", "error");
  if (type) {
    serverStatus.classList.add(type);
  }
}

function setStep(activeStep) {
  let activeFound = false;
  steps.forEach((step) => {
    const name = step.dataset.step;
    step.classList.remove("active", "done");
    if (name === activeStep) {
      step.classList.add("active");
      activeFound = true;
      return;
    }
    if (!activeFound) {
      step.classList.add("done");
    }
  });
}

function resetResult() {
  emptyState.innerHTML = emptyStateDefaultHtml;
  emptyState.hidden = false;
  resultContent.hidden = true;
  reportId.textContent = "-";
  taskId.textContent = "-";
  analysisStatus.textContent = "-";
  ragState.textContent = "待返回";
  summaryText.innerHTML = "";
  featureList.innerHTML = "";
  ragQuery.textContent = "";
  evidenceList.innerHTML = "";
  rawJson.textContent = "";
  currentSummary = "";
}

function resetForm() {
  selectedFile = null;
  imageInput.value = "";
  previewBox.hidden = true;
  previewImage.removeAttribute("src");
  fileInfo.textContent = "";
  setStatus("待联调");
  setStep("ready");
  resetResult();
}

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function setSelectedFile(file) {
  if (!file) {
    return;
  }
  selectedFile = file;
  previewImage.src = URL.createObjectURL(file);
  fileInfo.textContent = `${file.name} · ${formatFileSize(file.size)}`;
  previewBox.hidden = false;
  setStatus("已选择", "ok");
  setStep("ready");
}

function pickEvidence(draftReport) {
  if (!draftReport || !Array.isArray(draftReport.rag_evidence)) {
    return [];
  }
  return draftReport.rag_evidence.slice(0, 5);
}

function splitSummarySections(summary) {
  const headings = new Set([
    "识别结果",
    "一般解释",
    "继续观察",
    "健康管理建议",
    "知识库依据",
    "风险提醒",
  ]);
  const sections = [];
  let current = null;

  String(summary || "")
    .split(/\r?\n/)
    .forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        return;
      }

      if (headings.has(line)) {
        current = {
          title: line,
          lines: [],
        };
        sections.push(current);
        return;
      }

      if (!current) {
        current = {
          title: "报告摘要",
          lines: [],
        };
        sections.push(current);
      }
      current.lines.push(line);
    });

  return sections;
}

function renderSummary(summary) {
  summaryText.innerHTML = "";
  const sections = splitSummarySections(summary);
  if (!sections.length) {
    const block = document.createElement("article");
    block.className = "summary-block";
    const title = document.createElement("h4");
    title.textContent = "报告摘要";
    const body = document.createElement("p");
    body.textContent = "后端已返回结果，但没有摘要文本。";
    block.append(title, body);
    summaryText.appendChild(block);
    return;
  }

  sections.forEach((section) => {
    const block = document.createElement("article");
    block.className = "summary-block";
    const title = document.createElement("h4");
    title.textContent = section.title;
    const body = document.createElement("p");
    body.textContent = section.lines.join("\n");
    block.append(title, body);
    summaryText.appendChild(block);
  });
}

function renderFeatures(codes) {
  featureList.innerHTML = "";
  const values = Array.isArray(codes) && codes.length > 0 ? codes : ["未返回标准特征编码"];
  values.forEach((code) => {
    const item = document.createElement("div");
    item.className = "feature-chip";
    const label = featureLabels[code] || {
      title: code,
      group: "标准特征编码",
    };
    const title = document.createElement("strong");
    title.textContent = label.title;
    const meta = document.createElement("small");
    meta.textContent = `${label.group} · ${code}`;
    item.append(title, meta);
    featureList.appendChild(item);
  });
}

function renderEvidence(items) {
  evidenceList.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "evidence-item";
    empty.innerHTML = "<p>本次未返回知识库依据。</p>";
    evidenceList.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const wrapper = document.createElement("article");
    wrapper.className = "evidence-item";

    const title = document.createElement("div");
    title.className = "evidence-title";
    const name = document.createElement("span");
    name.textContent = item.title || `依据 ${index + 1}`;
    const score = document.createElement("small");
    const finalScore = Number(item.final_score || 0);
    score.textContent = `score ${finalScore.toFixed(3)}`;
    title.append(name, score);

    const content = document.createElement("p");
    content.textContent = String(item.content || "").slice(0, 260);

    wrapper.append(title, content);
    evidenceList.appendChild(wrapper);
  });
}

function renderResult(apiResult) {
  const data = apiResult.data || {};
  const draftReport = data.draft_report || {};
  const summary = data.summary || draftReport.summary || "后端已返回结果，但没有摘要文本。";

  reportId.textContent = data.report_id || "-";
  taskId.textContent = data.task_id || "-";
  analysisStatus.textContent = data.status || "-";
  ragState.textContent = draftReport.rag_grounded ? "已匹配" : "已返回";
  renderSummary(summary);
  currentSummary = summary;

  renderFeatures(data.detected_feature_codes || []);
  ragQuery.textContent = data.rag_query || draftReport.rag_query || "本次未返回检索查询。";
  renderEvidence(pickEvidence(draftReport));
  rawJson.textContent = JSON.stringify(data, null, 2);

  emptyState.hidden = true;
  resultContent.hidden = false;
}

async function analyze() {
  if (!selectedFile) {
    setStatus("请选择图片", "error");
    return;
  }

  const endpoint = apiEndpointInput.value.trim();
  const userId = userIdInput.value.trim();
  if (!endpoint || !userId) {
    setStatus("参数不完整", "error");
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("userId", userId);
  if (threadIdInput.value.trim()) {
    formData.append("threadId", threadIdInput.value.trim());
  }
  formData.append("clientTraceId", `trace_web_${crypto.randomUUID()}`);

  analyzeButton.disabled = true;
  resetResult();
  setStatus("分析中");
  setStep("uploading");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-User-Id": userId,
      },
      body: formData,
    });

    setStep("agent");
    const result = await response.json();
    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }

    if (result.data && result.data.task_id && !result.data.summary) {
      reportId.textContent = result.data.report_id || "-";
      taskId.textContent = result.data.task_id || "-";
      analysisStatus.textContent = result.data.status || "PENDING";
      await waitForReport({
        endpoint,
        userId,
        taskId: result.data.task_id,
        reportId: result.data.report_id,
      });
    } else {
      renderResult(result);
    }
    setStep("done");
    setStatus("完成", "ok");
  } catch (error) {
    setStatus("失败", "error");
    analysisStatus.textContent = "FAILED";
    emptyState.hidden = false;
    resultContent.hidden = true;
    showErrorState(error.message || "请求失败，请检查 Java 后端和 Python Agent 是否启动。");
  } finally {
    analyzeButton.disabled = false;
  }
}

async function waitForReport({ endpoint, userId, taskId, reportId }) {
  const baseUrl = new URL(endpoint).origin;
  const maxAttempts = 90;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(attempt === 0 ? 800 : 2000);
    const taskResponse = await fetch(`${baseUrl}/api/tongue/tasks/${taskId}`, {
      headers: {
        "X-User-Id": userId,
      },
    });
    const taskResult = await taskResponse.json();
    if (!taskResponse.ok || taskResult.code !== 0) {
      throw new Error(taskResult.message || "任务状态查询失败");
    }

    const task = taskResult.data || {};
    analysisStatus.textContent = task.status || "-";
    if (task.status === "MODEL_ANALYZING") {
      setStep("agent");
    }
    if (task.status === "REPORT_GENERATING" || task.current_stage === "REPORT_GENERATING") {
      setStep("agent");
    }
    if (task.status === "FAILED") {
      throw new Error(task.error_message || "舌象分析任务失败");
    }
    if (task.status === "COMPLETED") {
      const reportResponse = await fetch(`${baseUrl}/api/tongue/reports/${reportId}`, {
        headers: {
          "X-User-Id": userId,
        },
      });
      const reportResult = await reportResponse.json();
      if (!reportResponse.ok || reportResult.code !== 0) {
        throw new Error(reportResult.message || "报告查询失败");
      }
      renderResult(reportResult);
      return;
    }
  }

  throw new Error("分析任务等待超时，请稍后在报告列表中查看。");
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function showErrorState(message) {
  emptyState.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = "请求失败";
  const body = document.createElement("p");
  body.textContent = message;
  emptyState.append(title, body);
}

imageInput.addEventListener("change", (event) => {
  setSelectedFile(event.target.files[0]);
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragover");
  setSelectedFile(event.dataTransfer.files[0]);
});

analyzeButton.addEventListener("click", analyze);
resetButton.addEventListener("click", resetForm);
copyButton.addEventListener("click", async () => {
  if (!currentSummary) {
    return;
  }
  await navigator.clipboard.writeText(currentSummary);
  setStatus("已复制", "ok");
});

resetForm();
