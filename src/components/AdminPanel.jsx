import React, { useState } from 'react';
import { X, Plus, Trash2, CalendarPlus, Palette } from 'lucide-react';
import { PRESET_COLORS } from '../utils/colors';

export default function AdminPanel({ calendar, allCalendars, onSelectCalendar, onSave, onClose }) {
  const [title, setTitle] = useState(calendar ? calendar.title : '');
  const [description, setDescription] = useState(calendar ? (calendar.description || '') : '');
  const [participants, setParticipants] = useState(calendar ? calendar.participants : []);
  const [newName, setNewName] = useState('');

  const handleAddParticipant = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newName || !newName.trim()) {
      alert('참여자 이름을 입력해 주세요.');
      return;
    }
    const newParticipant = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: newName.trim(),
      color: PRESET_COLORS[participants.length % PRESET_COLORS.length]
    };
    setParticipants(prev => [...prev, newParticipant]);
    setNewName('');
  };

  const handleCreateNewCalInAdmin = () => {
    const id = prompt('새 모임 캘린더의 영문/한글 ID를 입력하세요 (예: kkot, cw, trip):', 'cal_' + Date.now().toString().slice(-4));
    if (!id) return;
    const calTitle = prompt('캘린더 제목을 입력해 주세요:', `${id} 모임 캘린더`);
    if (!calTitle) return;

    const newCal = {
      id: id.trim(),
      title: calTitle.trim(),
      description: `${calTitle.trim()} 참여자들의 일정 조율`,
      participants: [
        { id: 'p1', name: '참여자 1', color: '#EF4444' },
        { id: 'p2', name: '참여자 2', color: '#3B82F6' }
      ],
      availabilities: []
    };

    onSave(calendar, newCal);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...calendar,
      title: title.trim(),
      description: description.trim(),
      participants
    }, null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>캘린더 설정</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Calendar Switcher & Create New Calendar Button */}
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>캘린더 선택 및 관리</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-select"
                  style={{ flex: 1, fontWeight: '700' }}
                  value={calendar.id}
                  onChange={(e) => { onSelectCalendar(e.target.value); onClose(); }}
                >
                  {allCalendars.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (?id={c.id})</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" onClick={handleCreateNewCalInAdmin}>
                  + 새 캘린더 생성
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }}>캘린더명</label>
              <input type="text" className="form-input" style={{ width: '100%' }} value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }}>캘린더 설명</label>
              <input type="text" className="form-input" style={{ width: '100%' }} placeholder="예: cw 동창 모임 참여자들의 일정 조율" value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#64748B' }}>참여자 설정 ({participants.length}명)</label>
              
              {/* Participant Input & Add Button */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="새 참여자 이름"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddParticipant}
                >
                  추가
                </button>
              </div>

              {/* List of Participants */}
              {participants.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <input type="color" value={p.color} onChange={e => setParticipants(participants.map(item => item.id === p.id ? { ...item, color: e.target.value } : item))} style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer' }} />
                  <input type="text" className="form-input" style={{ flex: 1, padding: '4px 8px' }} value={p.name} onChange={e => setParticipants(participants.map(item => item.id === p.id ? { ...item, name: e.target.value } : item))} />
                  <button type="button" className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => setParticipants(participants.filter(item => item.id !== p.id))}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn btn-primary">설정 저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}
