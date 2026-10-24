// Numerology engine: Chaldean (default) and Pythagorean tables. Methods are never mixed.
const build=s=>{const m={};s.split(',').forEach(p=>{const[n,l]=p.split(':');[...l].forEach(c=>m[c]=+n)});return m};
const METHODS={pythagorean:build("1:AJS,2:BKT,3:CLU,4:DMV,5:ENW,6:FOX,7:GPY,8:HQZ,9:IR"),chaldean:build("1:AIJQY,2:BKR,3:CGLS,4:DMT,5:EHNX,6:UVW,7:OZ,8:FP")};
const normalizeName=n=>String(n||'').trim().toUpperCase();
const getLetterNumber=(l,m='pythagorean')=>(METHODS[m]||{})[l]??null;
const reduce=t=>{const s=[t];while(t>9){t=[...String(t)].reduce((a,d)=>a+ +d,0);s.push(t)}return s};
function calculateNameNumber(name,method='pythagorean'){
  const norm=normalizeName(name);if(!norm)return{error:'empty'};
  if(/[\u0900-\u097F]/.test(norm))return{error:'deva'};
  const letters=[],bad=[];
  for(const c of norm){if(/[A-Z]/.test(c))letters.push({letter:c,value:getLetterNumber(c,method)});else if(!/[\s\-'’.]/.test(c))bad.push(c)}
  if(bad.length)return{error:'bad',bad};if(!letters.length)return{error:'none'};
  const total=letters.reduce((a,l)=>a+l.value,0),steps=reduce(total);
  return{input:String(name).trim(),letters,total,steps,number:steps[steps.length-1],method};
}
/* Marathi -> Latin suggestion (user must review) */
const C={क:'k',ख:'kh',ग:'g',घ:'gh',च:'ch',छ:'chh',ज:'j',झ:'jh',ट:'t',ठ:'th',ड:'d',ढ:'dh',ण:'n',त:'t',थ:'th',द:'d',ध:'dh',न:'n',प:'p',फ:'f',ब:'b',भ:'bh',म:'m',य:'y',र:'r',ल:'l',व:'v',श:'sh',ष:'sh',स:'s',ह:'h',ळ:'l'};
const V={अ:'a',आ:'aa',इ:'i',ई:'i',उ:'u',ऊ:'u',ए:'e',ऐ:'ai',ओ:'o',औ:'au'},MT={'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','े':'e','ै':'ai','ो':'o','ौ':'au'};
function translit(s){let o='';const a=[...s];a.forEach((c,i)=>{const nx=a[i+1];if(C[c]){o+=C[c];if(nx&&MT[nx])return;if(nx==='्')return;if(nx&&C[nx])o+='a'}else if(MT[c])o+=MT[c];else if(V[c])o+=V[c];else if(c==='ं')o+='n';else if(/[\s\-'’.]/.test(c))o+=c});return o}
export{METHODS,normalizeName,getLetterNumber,calculateNameNumber,translit};
