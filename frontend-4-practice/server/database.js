// Только учебные данные. Серверный middleware сохранён из шаблона курса.
export const database = {
  today: {day: 16, month: 10, year: 2026},
  slotsEvenDay: [
    {time:'09:00',available:true},{time:'10:30',available:true},
    {time:'12:00',available:false},{time:'14:30',available:true},
    {time:'16:00',available:false},{time:'18:00',available:true}
  ],
  slotsOddDay: [
    {time:'09:00',available:false},{time:'10:30',available:false},
    {time:'12:00',available:false},{time:'14:30',available:false},
    {time:'16:00',available:false},{time:'18:00',available:false}
  ]
};
