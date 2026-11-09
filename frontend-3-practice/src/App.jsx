import {useState} from 'react';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import BookingPage from './components/BookingPage.jsx';
import {TODAY,readSlots} from './date.js';

export default function App(){
 const [selected,setSelected]=useState({...TODAY});
 const [slots,setSlots]=useState(()=>readSlots(TODAY));
 const choose=date=>{setSelected(date);setSlots(readSlots(date));};
 return <div className="page"><SiteHeader/><BookingPage today={TODAY} selected={selected} onSelect={choose} slots={slots}/><SiteFooter/></div>;
}
