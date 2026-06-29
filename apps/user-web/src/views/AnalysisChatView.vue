<template>
  <section class="chat">
    <main ref="listRef" class="list">
      <article v-for="m in messages" :key="m.id" :class="['row',m.role]">
        <div class="avatar"><Bot v-if="m.role==='assistant'" :size="18"/><User v-else :size="18"/></div>
        <div class="bubble">
          <img v-if="m.imageUrl" :src="m.imageUrl" class="preview" alt="舌象图片"/>
          <div v-if="m.thinking" class="thinking"><span></span>{{ m.stageText }}</div>
          <AnalysisProgressCard v-else-if="m.status==='PENDING'&&!m.typing&&(m.task||m.phase)" :phase="m.phase" :task="m.task"/>
          <p v-else>{{ m.display ?? m.content }}<i v-if="m.typing" class="cursor"></i></p>
          <el-button v-if="m.status==='COMPLETED'&&m.reportId" class="report-btn" type="primary" plain @click="router.push(`/reports/${m.reportId}`)">查看完整报告</el-button>
        </div>
      </article>
    </main>

    <footer class="composer">
      <div v-if="file" class="file"><span>{{ file.name }}</span><el-button link :icon="X" @click="clearFile"/></div>
      <div class="input-row">
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="pickFile"/>
        <el-button class="image-upload-button" :disabled="running" @click="fileInput?.click()"><ImagePlus :size="18"/>图片</el-button>
        <el-input v-model="draft" type="textarea" :autosize="{minRows:1,maxRows:5}" resize="none" maxlength="500" placeholder="给舌象健康助手发送消息" @keydown.enter.exact.prevent="send"/>
        <el-button type="primary" :loading="running" @click="send"><Send v-if="!running" :size="18"/></el-button>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { nextTick,onBeforeUnmount,ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Bot,ImagePlus,Send,User,X } from 'lucide-vue-next';
import { agentChatV2Api,tongueApi,type AgentMessageStatus,type TaskStatus } from '@tongue/shared';
import AnalysisProgressCard from '../components/analysis/AnalysisProgressCard.vue';

type Phase='UPLOADING'|'PENDING'|'MODEL_ANALYZING'|'REPORT_GENERATING';
interface Msg{ id:string; requestId:string; role:'assistant'|'user'; content:string; status:AgentMessageStatus; imageUrl?:string; task?:TaskStatus; phase?:Phase; typing?:boolean; display?:string; thinking?:boolean; stageText?:string; reportId?:number }

const router=useRouter();
const draft=ref('');
const file=ref<File|null>(null);
const previewUrl=ref('');
const fileInput=ref<HTMLInputElement|null>(null);
const listRef=ref<HTMLElement|null>(null);
const running=ref(false);
const messages=ref<Msg[]>([]);
const threadId=ref(`web_${id()}`);
const conversationId=ref(`conv_${id()}`);
const timers=new Map<string,number>();
const polls=new Set<number>();

function id(){return crypto.randomUUID?.()||`${Date.now()}_${Math.random()}`}
function scroll(){return nextTick().then(()=>{if(listRef.value)listRef.value.scrollTop=listRef.value.scrollHeight})}
function stopTimer(mid:string){const t=timers.get(mid);if(t)clearInterval(t);timers.delete(mid)}
function type(mid:string,text:string,done:()=>void){const m=messages.value.find(x=>x.id===mid);if(!m)return;m.content=text;m.task=undefined;m.phase=undefined;m.thinking=false;m.typing=true;m.display='';let i=0;const t=window.setInterval(()=>{i=Math.min(text.length,i+4);m.display=text.slice(0,i);void scroll();if(i===text.length){clearInterval(t);timers.delete(mid);m.typing=false;m.display=undefined;done()}},28);timers.set(mid,t)}
function think(m:Msg){m.thinking=true;const stages=['理解你的问题','读取上下文','整理相关信息','生成回答'];let i=0;m.stageText=stages[0];const t=window.setInterval(()=>{i=Math.min(i+1,stages.length-1);m.stageText=stages[i];if(i===stages.length-1){clearInterval(t);timers.delete(m.id)}},1100);timers.set(m.id,t)}
function phaseOf(task:TaskStatus):Phase{const s=String(task.currentStage||task.status).toUpperCase();if(s==='MODEL_ANALYZING'||s==='RUNNING')return'MODEL_ANALYZING';if(s==='REPORT_GENERATING'||s==='REPORT_READY'||s==='COMPLETED')return'REPORT_GENERATING';return'PENDING'}

function clearFile(){file.value=null;if(previewUrl.value)URL.revokeObjectURL(previewUrl.value);previewUrl.value='';if(fileInput.value)fileInput.value.value=''}
function pickFile(e:Event){const input=e.target as HTMLInputElement;const f=input.files?.[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)){ElMessage.error('仅支持 JPG、PNG、WEBP 图片');return}if(f.size>10*1024*1024){ElMessage.error('单张图片不能超过 10MB');return}clearFile();file.value=f;previewUrl.value=URL.createObjectURL(f)}

async function send(){if(running.value)return;const text=draft.value.trim();const img=file.value;if(!text&&!img){ElMessage.warning('先输入内容，或添加一张图片');return}const req=`req_${id()}`;const content=text||'请结合这张舌象图片做一次健康分析';messages.value.push({id:`user_${id()}`,requestId:req,role:'user',content,status:'COMPLETED',imageUrl:previewUrl.value||undefined});draft.value='';file.value=null;previewUrl.value='';if(fileInput.value)fileInput.value.value='';await scroll();if(img)await sendImage(img,content,req);else await sendText(content,req)}

async function sendText(content:string,requestId:string){running.value=true;const mid=`assistant_${id()}`;messages.value.push({id:mid,requestId,role:'assistant',content:'',status:'PENDING'});const target=messages.value.find(x=>x.id===mid)!;think(target);try{const r=await agentChatV2Api.chat({requestId,clientMessageId:`user_${id()}`,threadId:threadId.value,conversationId:conversationId.value,message:{role:'user',contentType:'text',content},contextBinding:{mode:'AUTO'},clientContext:{page:'analysis',locale:'zh-CN'}});stopTimer(mid);threadId.value=r.threadId||threadId.value;conversationId.value=r.conversationId||conversationId.value;if(r.status==='FAILED'){target.thinking=false;target.content=r.assistantMessage.content;target.status='FAILED'}else type(mid,r.assistantMessage.content||'我暂时没有生成有效回复。',()=>{target.status='COMPLETED';target.reportId=r.assistantMessage.reportRef?.reportId})}catch(e){stopTimer(mid);target.thinking=false;target.status='FAILED';target.content=e instanceof Error?e.message:'发送失败'}finally{running.value=false}}

async function sendImage(img:File,description:string,requestId:string){running.value=true;const mid=`assistant_${id()}`;messages.value.push({id:mid,requestId,role:'assistant',content:'',status:'PENDING',phase:'UPLOADING'});const target=messages.value.find(x=>x.id===mid&&x.requestId===requestId);if(!target){running.value=false;return}try{const c=await tongueApi.analyze(img,{clientTraceId:requestId,threadId:threadId.value,conversationId:conversationId.value,userDescription:description});threadId.value=c.threadId||threadId.value;conversationId.value=c.conversationId||conversationId.value;target.phase='PENDING';target.task={taskId:c.taskId,reportId:c.reportId,status:c.status,currentStage:'PENDING',progress:0};await poll(c.taskId,target)}catch(e){target.phase=undefined;target.task=undefined;target.status='FAILED';target.content=e instanceof Error?e.message:'创建分析任务失败'}finally{running.value=false}}

async function poll(taskId:number,target:Msg){if(polls.has(taskId))return;polls.add(taskId);try{for(let i=0;i<240;i++){if(i)await new Promise(r=>setTimeout(r,1500));const task=await tongueApi.task(taskId);target.task=task;target.phase=phaseOf(task);await scroll();if(task.status==='COMPLETED'){const report=await tongueApi.report(task.reportId);type(target.id,report.summary||report.featureSummary||'报告已生成。',()=>{target.status='COMPLETED';target.reportId=task.reportId});ElMessage.success('报告已生成');return}if(task.status==='FAILED'||task.status==='CANCELED'){target.phase=undefined;target.task=undefined;target.status='FAILED';target.content=task.errorMessage||'分析任务失败';return}}target.status='FAILED';target.phase=undefined;target.task=undefined;target.content='分析等待时间较长，请稍后查看报告中心。'}finally{polls.delete(taskId)}}

onBeforeUnmount(()=>{for(const t of timers.values())clearInterval(t);if(previewUrl.value)URL.revokeObjectURL(previewUrl.value)})
</script>

<style scoped>
.chat{position:relative;min-height:620px;background:#f4f7fb}.list{height:680px;overflow-y:auto;padding:24px 18px 160px}.row{display:grid;grid-template-columns:36px minmax(0,1fr);gap:10px;width:min(900px,100%);margin:0 auto 18px}.row.user{grid-template-columns:minmax(0,1fr) 36px}.row.user .avatar{grid-column:2}.row.user .bubble{grid-column:1;grid-row:1;justify-self:end;background:#e8f3ff}.avatar{display:grid;width:36px;height:36px;place-items:center;border-radius:50%;background:#fff;color:#28684a}.bubble{width:fit-content;max-width:720px;padding:14px 16px;border:1px solid #e1e9f0;border-radius:16px;background:#fff}.bubble p{margin:0;white-space:pre-wrap;line-height:1.75}.preview{width:min(280px,100%);max-height:280px;object-fit:contain;margin-bottom:12px;border-radius:12px}.thinking{display:flex;align-items:center;gap:8px;color:#738078}.thinking span{width:8px;height:8px;border-radius:50%;background:#2f704d;animation:pulse 1s infinite}.cursor{display:inline-block;width:1px;height:1em;margin-left:2px;background:currentColor;animation:blink .8s infinite}.report-btn{margin-top:12px}.composer{position:absolute;right:0;bottom:0;left:0;width:min(900px,calc(100% - 24px));margin:auto;padding:10px;border:1px solid #d4e1ec;border-radius:16px;background:#fff}.input-row{display:grid;grid-template-columns:auto minmax(0,1fr) 44px;gap:8px;align-items:end}.file{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:8px;border-radius:10px;background:#f2f7fb}.image-upload-button{height:42px}.structured{display:grid;gap:10px}.structured section{padding-top:10px;border-top:1px solid #e1e8e3}@keyframes pulse{50%{opacity:.35}}@keyframes blink{50%{opacity:0}}@media(max-width:760px){.list{height:620px}.row{grid-template-columns:32px minmax(0,1fr)}.row.user{grid-template-columns:minmax(0,1fr) 32px}}
</style>
