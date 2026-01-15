import { useMemo, useState } from "react";
import { Shell } from "../../components/Shell";
import { Card } from "../../components/ui/Card";
import type { Task } from "./home.types";

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // make Monday=0
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0,0,0,0);
  return copy;
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function HomePage() {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);

  // mock (essas tasks “vêm de outra tab”, conforme PDF)
  const tasks: Task[] = [
    { id: "1", title: "Enviar proposta", date: new Date().toISOString().slice(0,10) },
    { id: "2", title: "Reunião com cliente", date: new Date().toISOString().slice(0,10) },
  ];

  const weekStart = useMemo(() => addDays(startOfWeek(today), weekOffset * 7), [weekOffset]);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  function iso(d: Date) {
    return d.toISOString().slice(0,10);
  }

  return (
    <Shell>
      <div className="page">
        <div className="page-header row">
          <h1>Home</h1>
          <div className="muted">{today.toLocaleDateString()}</div>
        </div>

        <div className="grid-2">
          <Card title="Tasks">
            <ul className="list">
              {tasks.map((t) => (
                <li key={t.id} className="list-item">
                  <span>{t.title}</span>
                  <span className="muted">{t.date}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Calendar">
            <div className="calendar-head">
              <button className="link-btn" onClick={() => setWeekOffset((p) => p - 1)}>← Semana anterior</button>
              <div className="muted">
                {weekStart.toLocaleDateString()} – {addDays(weekStart, 6).toLocaleDateString()}
              </div>
              <button className="link-btn" onClick={() => setWeekOffset((p) => p + 1)}>Próxima semana →</button>
            </div>

            <div className="calendar-grid">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((w) => (
                <div key={w} className="calendar-cell calendar-label">{w}</div>
              ))}
              {days.map((d) => {
                const isToday = iso(d) === iso(today);
                return (
                  <div key={d.toISOString()} className={`calendar-cell ${isToday ? "today" : ""}`}>
                    <div className="calendar-date">{d.getDate()}</div>
                    <div className="calendar-mini">
                      {tasks.filter((t) => t.date === iso(d)).slice(0,2).map((t) => (
                        <div key={t.id} className="pill">{t.title}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
