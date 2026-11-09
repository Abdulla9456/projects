export const dateNumber = date => date.year*10000+(date.month+1)*100+date.day;
export const asDate = date => new Date(date.year,date.month,date.day);
export const fullDate = date => new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(asDate(date));
export const shortDate = date => new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',weekday:'long'}).format(asDate(date));
export function monthCells(year,month){
  const offset=(new Date(year,month,1).getDay()+6)%7;
  const count=new Date(year,month+1,0).getDate();
  return Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{const day=i-offset+1;return day>0&&day<=count?day:null;});
}
