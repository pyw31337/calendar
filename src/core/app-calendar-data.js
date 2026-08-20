(function () {
  const KOREAN_LUNAR_HOLIDAY_DATES = Object.freeze({
    2021: Object.freeze({ seollal: '2021-02-12', chuseok: '2021-09-21', buddha: '2021-05-19' }),
    2022: Object.freeze({ seollal: '2022-02-01', chuseok: '2022-09-10', buddha: '2022-05-08' }),
    2023: Object.freeze({ seollal: '2023-01-22', chuseok: '2023-09-29', buddha: '2023-05-27' }),
    2024: Object.freeze({ seollal: '2024-02-10', chuseok: '2024-09-17', buddha: '2024-05-15' }),
    2025: Object.freeze({ seollal: '2025-01-29', chuseok: '2025-10-06', buddha: '2025-05-05' }),
    2026: Object.freeze({ seollal: '2026-02-17', chuseok: '2026-09-25', buddha: '2026-05-24' }),
    2027: Object.freeze({ seollal: '2027-02-07', chuseok: '2027-09-15', buddha: '2027-05-13' }),
    2028: Object.freeze({ seollal: '2028-01-27', chuseok: '2028-10-03', buddha: '2028-05-02' }),
    2029: Object.freeze({ seollal: '2029-02-13', chuseok: '2029-09-22', buddha: '2029-05-20' }),
    2030: Object.freeze({ seollal: '2030-02-03', chuseok: '2030-09-12', buddha: '2030-05-09' }),
    2031: Object.freeze({ seollal: '2031-01-23', chuseok: '2031-10-01', buddha: '2031-05-28' }),
    2032: Object.freeze({ seollal: '2032-02-11', chuseok: '2032-09-19', buddha: '2032-05-16' })
  });

  const KOREAN_TEMPORARY_HOLIDAYS = Object.freeze([
    Object.freeze({ date: '2023-10-02', name: '임시공휴일' }),
    Object.freeze({ date: '2025-01-27', name: '임시공휴일' })
  ]);

  const KOREAN_FIXED_HOLIDAYS = Object.freeze([
    Object.freeze({ month: 1, day: 1, name: '신정', subType: 'none' }),
    Object.freeze({ month: 3, day: 1, name: '삼일절', subType: 'weekend', subFromYear: 2022 }),
    Object.freeze({ month: 5, day: 5, name: '어린이날', subType: 'weekend' }),
    Object.freeze({ month: 6, day: 6, name: '현충일', subType: 'none' }),
    Object.freeze({ month: 7, day: 17, name: '제헌절', subType: 'weekend', fromYear: 2026 }),
    Object.freeze({ month: 8, day: 15, name: '광복절', subType: 'weekend', subFromYear: 2021 }),
    Object.freeze({ month: 10, day: 3, name: '개천절', subType: 'weekend', subFromYear: 2021 }),
    Object.freeze({ month: 10, day: 9, name: '한글날', subType: 'weekend', subFromYear: 2021 }),
    Object.freeze({ month: 12, day: 25, name: '성탄절', subType: 'weekend', subFromYear: 2023 }),
    Object.freeze({ month: 5, day: 1, name: '노동절', subType: 'none', fromYear: 2026 })
  ]);

  const KOREAN_SOLAR_TERMS = Object.freeze([
    Object.freeze(['소한', 285]), Object.freeze(['대한', 300]), Object.freeze(['입춘', 315]),
    Object.freeze(['우수', 330]), Object.freeze(['경칩', 345]), Object.freeze(['춘분', 0]),
    Object.freeze(['청명', 15]), Object.freeze(['곡우', 30]), Object.freeze(['입하', 45]),
    Object.freeze(['소만', 60]), Object.freeze(['망종', 75]), Object.freeze(['하지', 90]),
    Object.freeze(['소서', 105]), Object.freeze(['대서', 120]), Object.freeze(['입추', 135]),
    Object.freeze(['처서', 150]), Object.freeze(['백로', 165]), Object.freeze(['추분', 180]),
    Object.freeze(['한로', 195]), Object.freeze(['상강', 210]), Object.freeze(['입동', 225]),
    Object.freeze(['소설', 240]), Object.freeze(['대설', 255]), Object.freeze(['동지', 270])
  ]);

  const MONTH_NAMES = Object.freeze(['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']);

  window.GATHER_APP_CALENDAR_DATA = Object.freeze({
    KOREAN_LUNAR_HOLIDAY_DATES,
    KOREAN_TEMPORARY_HOLIDAYS,
    KOREAN_FIXED_HOLIDAYS,
    KOREAN_SOLAR_TERMS,
    MONTH_NAMES
  });
})();
