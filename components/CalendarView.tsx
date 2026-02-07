"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

interface CalendarViewProps {
    onDateSelect: (date: Date) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarView({ onDateSelect }: CalendarViewProps) {
    const [value, onChange] = useState<Value>(new Date());

    const handleDateChange = (date: Value) => {
        onChange(date);
        if (date instanceof Date) {
            onDateSelect(date);
        }
    };

    return (
        <div className="calendarWrapper">
            <Calendar onChange={handleDateChange} value={value} />
        </div>
    );
}
