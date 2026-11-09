import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchToday,fetchSlots,requestJSON} from '../src/api.js';

const date={day:16,month:10,year:2026};
const original=globalThis.fetch;
test.afterEach(()=>{globalThis.fetch=original;});
const respond=(body,status=200)=>{globalThis.fetch=async()=>({ok:status>=200&&status<300,status,json:async()=>body});};
test('Сегодня загружается с API и проверяется как календарная дата',async()=>{
 respond(date);assert.deepEqual(await fetchToday(),date);
 respond({year:2026,month:1,day:30});await assert.rejects(fetchToday(),/дату/);
});
test('Слоты запрашиваются с 0-индексным месяцем и нужной датой',async()=>{
 globalThis.fetch=async(url,options)=>{assert.equal(url,'/api/slots?day=16&month=10&year=2026');assert.ok(options.signal);return {ok:true,json:async()=>({date,slots:[{time:'14:30',available:true}]})};};
 assert.deepEqual(await fetchSlots(date),[{time:'14:30',available:true}]);
});
test('HTTP-ошибка и отсутствие сети не превращаются в успешную загрузку',async()=>{
 respond({},503);await assert.rejects(fetchToday(),/HTTP 503/);
 globalThis.fetch=async()=>{throw new TypeError('Failed to fetch');};await assert.rejects(fetchToday(),/Нет соединения/);
});
test('Чужая дата, неверные слоты и повторяющееся время отклоняются',async()=>{
 respond({date:{...date,day:17},slots:[]});await assert.rejects(fetchSlots(date),/другой дате/);
 for(const slots of [[{time:'25:90',available:true}],[{time:'14:30',available:'yes'}],[{time:'14:30',available:true},{time:'14:30',available:false}]]){respond({date,slots});await assert.rejects(fetchSlots(date),/некорректное расписание/);}
});
test('Пустое расписание является корректным ответом',async()=>{respond({date,slots:[]});assert.deepEqual(await fetchSlots(date),[]);});
test('Отмена передаётся fetch, AbortError сохраняет свой тип',async()=>{
 const controller=new AbortController();controller.abort();globalThis.fetch=async(_url,{signal})=>{assert.equal(signal.aborted,true);throw new DOMException('aborted','AbortError');};
 await assert.rejects(requestJSON('/api/booking/today',controller.signal),{name:'AbortError'});
});
test('Повреждённый JSON сообщает о формате ответа',async()=>{globalThis.fetch=async()=>({ok:true,json:async()=>{throw new SyntaxError('bad json');}});await assert.rejects(fetchToday(),/неверном формате/);});
