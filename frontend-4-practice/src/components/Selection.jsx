import {fullDate} from '../date.js';
export default function Selection({date,time,ready,onContinue}){return <><div className="selection" aria-live="polite"><p>{fullDate(date)} · {time||'выберите время'}</p><p>Стрижка и укладка · 2 400 ₽</p></div><button type="button" className="button continue" disabled={!ready||!time} onClick={onContinue}>Продолжить</button></>;}
