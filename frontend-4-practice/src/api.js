const key=date=>`${date.year}-${date.month}-${date.day}`;
export function validDate(date){
 if(!date||!['year','month','day'].every(field=>Number.isInteger(date[field])))return false;
 const value=new Date(date.year,date.month,date.day);
 return date.year>=2000&&date.year<=2200&&value.getFullYear()===date.year&&value.getMonth()===date.month&&value.getDate()===date.day;
}
export async function requestJSON(path,signal){
 let response;
 try{response=await fetch(path,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(10000)]):AbortSignal.timeout(10000)});}catch(error){if(['AbortError','TimeoutError'].includes(error.name))throw error;throw new Error('Нет соединения с сервером. Проверьте сеть и повторите запрос.',{cause:error});}
 if(!response.ok)throw new Error(`Не удалось получить данные (HTTP ${response.status}).`);
 try{return await response.json();}catch{throw new Error('Сервер вернул данные в неверном формате.');}
}
export async function fetchToday(signal){const date=await requestJSON('/api/booking/today',signal);if(!validDate(date))throw new Error('Сервер вернул некорректную текущую дату.');return date;}
export async function fetchSlots(date,signal){
 const query=new URLSearchParams({day:date.day,month:date.month,year:date.year});
 const result=await requestJSON(`/api/slots?${query}`,signal);
 if(!result||!validDate(result.date)||key(result.date)!==key(date))throw new Error('Ответ расписания относится к другой дате.');
 if(!Array.isArray(result.slots)||!result.slots.every(slot=>slot&&typeof slot.available==='boolean'&&typeof slot.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time))||new Set(result.slots.map(slot=>slot.time)).size!==result.slots.length)throw new Error('Сервер вернул некорректное расписание.');
 return result.slots;
}
