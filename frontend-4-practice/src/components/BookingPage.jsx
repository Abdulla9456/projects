import {useState} from 'react';
import MonthCalendar from './MonthCalendar.jsx';
import TimePicker from './TimePicker.jsx';
import Selection from './Selection.jsx';
import {fullDate} from '../date.js';

export default function BookingPage({today,slots,loading,error,onRetry,selected,onSelect}){
 const [currentYear,setCurrentYear]=useState(today.year);
 const [currentMonth,setCurrentMonth]=useState(today.month);
 const [selectedTime,setSelectedTime]=useState(null);
 const [feedback,setFeedback]=useState(false);
 const chooseDate=date=>{onSelect(date);setSelectedTime(null);setFeedback(false);};
 const chooseTime=value=>{setSelectedTime(value);setFeedback(false);};
 const navigate=delta=>{const date=new Date(currentYear,currentMonth+delta,1);setCurrentYear(date.getFullYear());setCurrentMonth(date.getMonth());};
 const time=!loading&&!error&&slots.some(slot=>slot.available&&slot.time===selectedTime)?selectedTime:null;
 return <main id="main"><ol className="steps" aria-label="Шаги записи">{['Мастер','Услуга','Дата и время','Контакты','Подтверждение'].map((label,index)=><li key={label} aria-current={index===2?'step':undefined}>{index+1}. {label}</li>)}</ol><h1>Выберите дату и время</h1><p className="intro">Роман Соколов · Стрижка и укладка · 60 минут</p><div className="booking-area"><MonthCalendar year={currentYear} month={currentMonth} today={today} selected={selected} onSelect={chooseDate} onNavigate={navigate}/><TimePicker selected={selected} slots={slots} time={time} onTime={chooseTime} loading={loading} error={error} onRetry={onRetry}><Selection date={selected} time={time} ready={!loading&&!error} onContinue={()=>setFeedback(true)}/>{feedback&&time&&<p className="feedback" role="status">Вы выбрали: {fullDate(selected)} в {time}. Роман Соколов · Стрижка и укладка · 60 минут · 2 400 ₽. Следующий шаг — контактные данные.</p>}</TimePicker></div><div className="below"><button type="button" className="button secondary" onClick={()=>{setSelectedTime(null);setFeedback(false);}}>Сбросить время</button></div></main>;
}
