import test from 'node:test';
import assert from 'node:assert/strict';
import {monthCells,dateNumber} from '../src/date.js';

test('Ноябрь 2026: 1-е воскресенье, 30-е не теряется в шестой неделе',()=>{
 const cells=monthCells(2026,10);
 assert.equal(cells.length,42);assert.equal(cells[6],1);assert.equal(cells[35],30);
 assert.deepEqual(cells.filter(Boolean),Array.from({length:30},(_,i)=>i+1));
});
test('Високосный и обычный февраль имеют правильное число дней',()=>{
 assert.equal(monthCells(2028,1).filter(Boolean).length,29);
 assert.equal(monthCells(2027,1).filter(Boolean).length,28);
});
test('Запрет прошлого дня работает на границе месяца и года',()=>{
 assert.ok(dateNumber({year:2026,month:11,day:31})<dateNumber({year:2027,month:0,day:1}));
 assert.ok(dateNumber({year:2026,month:10,day:15})<dateNumber({year:2026,month:10,day:16}));
 assert.equal(dateNumber({year:2026,month:10,day:16}),20261116);
});
