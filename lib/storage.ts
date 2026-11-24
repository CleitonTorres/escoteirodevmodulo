export type Progress = { completed:number[]; guide:string; words:number; typingBest:number };
const key='trilha-digital-v1';
export const progressRepository = {
 load():Progress { if(typeof window==='undefined') return {completed:[],guide:'',words:0,typingBest:0}; try { return {completed:[],guide:'',words:0,typingBest:0,...JSON.parse(localStorage.getItem(key)||'{}')}; } catch { return {completed:[],guide:'',words:0,typingBest:0}; } },
 save(value:Progress) { if(typeof window!=='undefined') localStorage.setItem(key,JSON.stringify(value)); }
};
