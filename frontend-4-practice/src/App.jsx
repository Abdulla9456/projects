import {useEffect,useState} from 'react';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import BookingPage from './components/BookingPage.jsx';
import {fetchToday,fetchSlots} from './api.js';

function Schedule({today}){
 const [selected,setSelected]=useState(today);
 const [attempt,setAttempt]=useState(0);
 const [resource,setResource]=useState(null);
 const {day,month,year}=selected;
 const requestKey=`${year}-${month}-${day}-${attempt}`;
 useEffect(()=>{
   const controller=new AbortController();let active=true;
   fetchSlots({day,month,year},controller.signal).then(slots=>{if(active)setResource({key:requestKey,slots,error:null});}).catch(error=>{if(active&&!controller.signal.aborted)setResource({key:requestKey,slots:[],error:error.name==='TimeoutError'?'Сервер не ответил вовремя. Повторите запрос.':error.message||'Не удалось загрузить время. Проверьте соединение.'});});
   return ()=>{active=false;controller.abort();};
 },[day,month,year,requestKey]);
 const loading=resource?.key!==requestKey;
 return <BookingPage today={today} selected={selected} onSelect={setSelected} slots={loading?[]:resource.slots} loading={loading} error={loading?null:resource.error} onRetry={()=>setAttempt(value=>value+1)}/>;
}

export default function App(){
 const [attempt,setAttempt]=useState(0);
 const [resource,setResource]=useState(null);
 useEffect(()=>{
   const controller=new AbortController();let active=true;
   fetchToday(controller.signal).then(today=>{if(active)setResource({attempt,today,error:null});}).catch(error=>{if(active&&!controller.signal.aborted)setResource({attempt,today:null,error:error.name==='TimeoutError'?'Сервер не ответил вовремя.':error.message||'Не удалось загрузить календарь. Проверьте соединение.'});});
   return ()=>{active=false;controller.abort();};
 },[attempt]);
 const loading=resource?.attempt!==attempt;
 return <div className="page"><SiteHeader/>{loading?<main className="below loading" role="status">Загрузка…</main>:resource.error?<main className="below notice error" role="alert"><h1>Календарь недоступен</h1><p>{resource.error}</p><button className="button" onClick={()=>setAttempt(value=>value+1)}>Повторить загрузку</button></main>:<Schedule today={resource.today}/>}<SiteFooter/></div>;
}
