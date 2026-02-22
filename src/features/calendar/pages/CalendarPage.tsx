import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { useQuery } from '@tanstack/react-query'
import { reservationsApi } from '@/api/reservations'
import type { View } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { ko }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const year = date.getFullYear()
  const month = date.getMonth() + 1

  const { data: reservations } = useQuery({
    queryKey: ['reservations', year, month],
    queryFn: () => reservationsApi.getMonthly(year, month).then((res) => res.data),
  })

  const events = useMemo(
    () =>
      (reservations ?? []).map((r) => ({
        id: r.reservation_id,
        title: r.title,
        start: new Date(`${r.reservation_date}T${r.start_time}`),
        end: new Date(`${r.reservation_date}T${r.end_time}`),
        resource: r,
      })),
    [reservations],
  )

  return (
    <div className="h-[calc(100vh-8rem)] p-4">
      <Calendar
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        onNavigate={setDate}
        onView={setView}
        views={['month', 'week']}
        messages={{
          today: '오늘',
          previous: '이전',
          next: '다음',
          month: '월',
          week: '주',
        }}
        style={{ height: '100%' }}
      />
    </div>
  )
}
