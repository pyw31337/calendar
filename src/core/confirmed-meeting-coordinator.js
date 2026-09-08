export function cloneConfirmedMeetings(meetings = []) {
  return meetings.map(meeting => ({
    ...meeting,
    photos: Array.isArray(meeting.photos) ? meeting.photos.map(photo => ({ ...photo })) : []
  }));
}

export async function commitConfirmedMeetingChanges({
  activeCalendar, calendars, nextConfirmedMeetings, toastMessage = null,
  activityLogs = [], toastType = 'success', getConfirmedMeetings,
  getCalendarActivityLogs, updateCalendars, setConfirmedMeetingsSubcollection,
  mergeConfirmedMeetings
}) {
  if (!activeCalendar) return false;
  const previousMeetings = getConfirmedMeetings(activeCalendar);
  const previousByDate = new Map(previousMeetings.map(meeting => [meeting.date, JSON.stringify(meeting)]));
  const mutationStamp = Date.now();
  const stampedMeetings = nextConfirmedMeetings.map(meeting => (
    previousByDate.get(meeting.date) !== JSON.stringify(meeting)
      ? { ...meeting, updatedAt: Math.max(Number(meeting.updatedAt || 0) || 0, mutationStamp) }
      : meeting
  ));
  const changedMeetings = stampedMeetings.filter(meeting => previousByDate.get(meeting.date) !== JSON.stringify(meeting));
  const updatedCalendar = {
    ...activeCalendar,
    confirmedMeeting: stampedMeetings,
    updatedAt: mutationStamp,
    revision: (activeCalendar.revision || 0) + 1,
    activityLogs: activityLogs.length > 0
      ? [...getCalendarActivityLogs(activeCalendar), ...activityLogs]
      : getCalendarActivityLogs(activeCalendar)
  };
  const nextCalendars = calendars.map(calendar => calendar.id === updatedCalendar.id ? updatedCalendar : calendar);
  const saved = await updateCalendars(nextCalendars, toastMessage, toastType, updatedCalendar.id, 'settings', activityLogs, {
    confirmedMeetings: changedMeetings,
    settingsFields: ['confirmedMeeting']
  });
  if (!saved) return false;
  setConfirmedMeetingsSubcollection(previous => mergeConfirmedMeetings(Array.isArray(previous) ? previous : [], stampedMeetings));
  return true;
}
