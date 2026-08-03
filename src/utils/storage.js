const STORAGE_KEY = 'gather_calendars_persistent_v4';
const ACTIVE_CAL_KEY = 'gather_active_calendar_id';

const INITIAL_CALENDARS = [
  {
    id: 'kkot',
    title: '8월 여름휴가 친목 모임',
    description: '친구들과 함께 떠나는 여름 휴가 및 계곡 사모임 일정 조율',
    createdAt: new Date().toISOString(),
    participants: [
      { id: 'p1', name: '김민준', color: '#EF4444' },
      { id: 'p2', name: '이서연', color: '#3B82F6' },
      { id: 'p3', name: '박도현', color: '#10B981' },
      { id: 'p4', name: '최지아', color: '#EC4899' },
      { id: 'p5', name: '정현우', color: '#8B5CF6' }
    ],
    availabilities: [
      { id: 'a1', date: '2026-08-08', participantId: 'p1', note: '주말 전일 가능' },
      { id: 'a2', date: '2026-08-08', participantId: 'p2', note: '차량 운전 가능' },
      { id: 'a3', date: '2026-08-08', participantId: 'p3', note: '오후 1시 이후' },
      { id: 'a4', date: '2026-08-08', participantId: 'p4', note: '참석 가능' },
      { id: 'a5', date: '2026-08-08', participantId: 'p5', note: '참석 가능' },
      { id: 'a6', date: '2026-08-15', participantId: 'p1', note: '공휴일 가능' },
      { id: 'a7', date: '2026-08-15', participantId: 'p2', note: '펜션 예약 담당' },
      { id: 'a8', date: '2026-08-15', participantId: 'p3', note: '좋습니다' },
      { id: 'a9', date: '2026-08-15', participantId: 'p4', note: '참석' },
      { id: 'a10', date: '2026-08-15', participantId: 'p5', note: '무조건 참석' }
    ]
  },
  {
    id: 'cw',
    title: 'cw 동창회 사모임 캘린더',
    description: 'cw 동창 모임 참여자들의 일정 조율',
    createdAt: new Date().toISOString(),
    participants: [
      { id: 'hp1', name: '강동원', color: '#F97316' },
      { id: 'hp2', name: '한소희', color: '#06B6D4' },
      { id: 'hp3', name: '송중기', color: '#6366F1' }
    ],
    availabilities: [
      { id: 'ha1', date: '2026-08-15', participantId: 'hp1', note: '공휴일 가능' },
      { id: 'ha2', date: '2026-08-15', participantId: 'hp2', note: '참석 가능' },
      { id: 'ha3', date: '2026-08-15', participantId: 'hp3', note: '참석 가능' }
    ]
  }
];

export function getStoredCalendars() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load calendars from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CALENDARS));
  return INITIAL_CALENDARS;
}

export function saveStoredCalendars(calendars) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));
  } catch (e) {
    console.error('Failed to save calendars to localStorage', e);
  }
}

export function getActiveCalendarId(calendars) {
  const urlParams = new URLSearchParams(window.location.search);
  const calParam = urlParams.get('id') || urlParams.get('cal');
  if (calParam && calendars.some(c => c.id === calParam)) {
    return calParam;
  }

  const savedId = localStorage.getItem(ACTIVE_CAL_KEY);
  if (savedId && calendars.some(c => c.id === savedId)) {
    return savedId;
  }

  return calendars[0]?.id || 'kkot';
}

export function setActiveCalendarId(id) {
  localStorage.setItem(ACTIVE_CAL_KEY, id);
  const url = new URL(window.location.href);
  url.searchParams.set('id', id);
  window.history.replaceState({}, '', url.toString());
}
