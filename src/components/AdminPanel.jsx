import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Settings, User } from 'lucide-react';
import { PRESET_COLORS, getRandomColor, getContrastTextColor } from '../utils/colors';

export default function AdminPanel({
  calendar,
  onSaveCalendar,
  onDeleteCalendar,
  onClose
}) {
  const [title, setTitle] = useState(calendar?.title || '새 모임 달력');
  const [description, setDescription] = useState(calendar?.description || '');
  const [participants, setParticipants] = useState(() => calendar?.participants || []);

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantColor, setNewParticipantColor] = useState(getRandomColor());

  const handleAddParticipant = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newParticipantName || !newParticipantName.trim()) {
      alert('참여자 이름을 입력해 주세요.');
      return;
    }

    const newP = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: newParticipantName.trim(),
      color: newParticipantColor
    };

    setParticipants(prev => [...prev, newP]);
    setNewParticipantName('');
    setNewParticipantColor(getRandomColor());
  };

  const handleUpdateParticipantName = (id, newName) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const handleUpdateParticipantColor = (id, color) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, color } : p));
  };

  const handleRemoveParticipant = (id) => {
    if (participants.length <= 1) {
      alert('최소 1명 이상의 참여자가 있어야 합니다.');
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('달력 제목을 입력해 주세요.');
      return;
    }
    if (participants.length === 0) {
      alert('참여자를 최소 1명 이상 등록해 주세요.');
      return;
    }

    onSaveCalendar({
      ...calendar,
      title: title.trim(),
      description: description.trim(),
      participants,
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>어드민: 달력 및 참여자 설정</span>
          </div>
          <button id="btn-admin-close" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label htmlFor="calendar-title-input" className="form-label">
                달력명 (상단 표기)
              </label>
              <input
                id="calendar-title-input"
                type="text"
                className="form-input"
                placeholder="예: 8월 정기 사모임 일자 조율"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Participants Management */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} />
                <span>참여자 설정 ({participants.length}명)</span>
              </label>

              {/* Add New Participant Row */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '12px' }}>
                <input
                  id="new-participant-name-input"
                  type="text"
                  className="form-input"
                  placeholder="새 참여자 이름"
                  style={{ flex: 1 }}
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant(e);
                    }
                  }}
                />
                <button
                  type="button"
                  id="btn-add-participant"
                  className="btn btn-secondary"
                  onClick={handleAddParticipant}
                >
                  <Plus size={16} />
                  <span>추가</span>
                </button>
              </div>

              {/* List of Existing Participants */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {participants.map((p) => (
                  <div key={p.id} className="participant-edit-row">
                    <input
                      type="color"
                      value={p.color}
                      onChange={(e) => handleUpdateParticipantColor(p.id, e.target.value)}
                      style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1 }}
                      value={p.name}
                      onChange={(e) => handleUpdateParticipantName(p.id, e.target.value)}
                    />
                    <span
                      className="participant-badge"
                      style={{
                        backgroundColor: p.color,
                        color: getContrastTextColor(p.color),
                        padding: '6px 12px'
                      }}
                    >
                      {p.name}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleRemoveParticipant(p.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" id="btn-save-admin" className="btn btn-primary">
              <Save size={16} />
              <span>설정 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
