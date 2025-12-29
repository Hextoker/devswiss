'use client';

import React, { useEffect, useMemo, useState } from 'react';

type CronField = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

type ParsedField = {
    name: CronField;
    raw: string;
    values: number[];
    valueSet: Set<number>;
    isFullRange: boolean;
    every?: number;
    min: number;
    max: number;
};

type CronParseSuccess = {
    valid: true;
    expression: string;
    fields: Record<CronField, ParsedField>;
};

type CronParseError = {
    valid: false;
    expression: string;
    error: string;
};

export type CronParseResult = CronParseSuccess | CronParseError;

const FIELD_META: Record<
    CronField,
    {
        label: string;
        min: number;
        max: number;
    }
> = {
    minute: { label: 'Minutos', min: 0, max: 59 },
    hour: { label: 'Horas', min: 0, max: 23 },
    dayOfMonth: { label: 'Día del mes', min: 1, max: 31 },
    month: { label: 'Mes', min: 1, max: 12 },
    dayOfWeek: { label: 'Día de la semana', min: 0, max: 6 },
};

const MONTH_NAMES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
];

const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const isCronParseSuccess = (result: CronParseResult): result is CronParseSuccess => result.valid;

const parseField = (name: CronField, rawValue: string): ParsedField | string => {
    const meta = FIELD_META[name];
    if (!rawValue.trim()) {
        return `El campo ${meta.label.toLowerCase()} está vacío.`;
    }

    const allowed = new Set<number>();
    const segments = rawValue.split(',');
    let every: number | undefined;

    for (const segment of segments) {
        const [rangePart, stepPart] = segment.split('/');
        const step = stepPart ? Number(stepPart) : 1;
        if (!Number.isInteger(step) || step <= 0) {
            return `Paso inválido "${segment}" en ${meta.label.toLowerCase()}.`;
        }

        const addRange = (start: number, end: number) => {
            if (start > end) {
                return `El rango ${start}-${end} en ${meta.label.toLowerCase()} es inválido.`;
            }
            for (let value = start; value <= end; value += step) {
                if (name === 'dayOfWeek' && value === 7) {
                    allowed.add(0);
                } else {
                    allowed.add(value);
                }
            }
            return null;
        };

        if (rangePart === '*') {
            const err = addRange(meta.min, meta.max);
            if (err) return err;
            if (segments.length === 1 && step > 1) {
                every = step;
            }
            continue;
        }

        if (rangePart.includes('-')) {
            const [startStr, endStr] = rangePart.split('-');
            const start = Number(startStr);
            const end = Number(endStr);
            if (!Number.isInteger(start) || !Number.isInteger(end)) {
                return `Rango inválido "${segment}" en ${meta.label.toLowerCase()}.`;
            }
            if (start < meta.min || end > meta.max + (name === 'dayOfWeek' ? 1 : 0)) {
                return `Valores fuera de rango en ${meta.label.toLowerCase()} (${meta.min}-${meta.max}).`;
            }
            const err = addRange(start, end);
            if (err) return err;
            continue;
        }

        const single = Number(rangePart);
        if (!Number.isInteger(single)) {
            return `Valor inválido "${segment}" en ${meta.label.toLowerCase()}.`;
        }
        if (single < meta.min || single > meta.max + (name === 'dayOfWeek' ? 1 : 0)) {
            return `Valor ${single} fuera de rango para ${meta.label.toLowerCase()} (${meta.min}-${meta.max}).`;
        }
        if (name === 'dayOfWeek' && single === 7) {
            allowed.add(0);
        } else {
            allowed.add(single);
        }
    }

    const values = Array.from(allowed).sort((a, b) => a - b);
    const isFullRange = values.length === meta.max - meta.min + 1;

    return {
        name,
        raw: rawValue,
        values,
        valueSet: new Set(values),
        isFullRange,
        every,
        min: meta.min,
        max: meta.max,
    };
};

export const parseCronExpression = (expression: string): CronParseResult => {
    const cleaned = expression.trim().replace(/\s+/g, ' ');
    if (!cleaned) {
        return { valid: false, expression: cleaned, error: 'Completa los 5 campos de cron.' };
    }

    const parts = cleaned.split(' ');
    if (parts.length !== 5) {
        return { valid: false, expression: cleaned, error: 'La expresión debe tener 5 campos estándar (minuto, hora, día del mes, mes, día de la semana).' };
    }

    const [minuteRaw, hourRaw, domRaw, monthRaw, dowRaw] = parts;
    const minute = parseField('minute', minuteRaw);
    if (typeof minute === 'string') return { valid: false, expression: cleaned, error: minute };
    const hour = parseField('hour', hourRaw);
    if (typeof hour === 'string') return { valid: false, expression: cleaned, error: hour };
    const dayOfMonth = parseField('dayOfMonth', domRaw);
    if (typeof dayOfMonth === 'string') return { valid: false, expression: cleaned, error: dayOfMonth };
    const month = parseField('month', monthRaw);
    if (typeof month === 'string') return { valid: false, expression: cleaned, error: month };
    const dayOfWeek = parseField('dayOfWeek', dowRaw);
    if (typeof dayOfWeek === 'string') return { valid: false, expression: cleaned, error: dayOfWeek };

    return {
        valid: true,
        expression: cleaned,
        fields: { minute, hour, dayOfMonth, month, dayOfWeek },
    };
};

const formatTime = (minutes: number, hours: number) => {
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = ((hours + 11) % 12) + 1;
    const minuteStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minuteStr} ${suffix}`;
};

const formatList = (values: number[], mapper?: (value: number) => string): string => {
    const mapped = mapper ? values.map(mapper) : values.map(String);
    if (mapped.length === 1) return mapped[0];
    if (mapped.length === 2) return `${mapped[0]} y ${mapped[1]}`;
    const preview = mapped.slice(0, 3);
    const rest = mapped.length - preview.length;
    return `${preview.join(', ')}${rest > 0 ? ` y ${rest} más` : ''}`;
};

const describeDayOfMonth = (field: ParsedField) => {
    if (field.isFullRange) return 'todos los días';
    if (field.every) return `cada ${field.every} días del mes`;
    if (field.values.length === 1) return `el día ${field.values[0]} de cada mes`;
    return `los días ${formatList(field.values)} del mes`;
};

const describeDayOfWeek = (field: ParsedField) => {
    if (field.isFullRange) return '';
    if (field.every) return `cada ${field.every} días de la semana`;
    return formatList(field.values.map((value) => value % 7), (value) => WEEKDAY_NAMES[value] ?? String(value));
};

const describeMonth = (field: ParsedField) => {
    if (field.isFullRange) return '';
    if (field.every) return `cada ${field.every} meses`;
    if (field.values.length === 1) return `en ${MONTH_NAMES[field.values[0] - 1]}`;
    return `en ${formatList(field.values, (value) => MONTH_NAMES[value - 1] ?? String(value))}`;
};

export const describeCron = (result: CronParseResult): string => {
    if (!result.expression.trim()) {
        return 'Ingresa tu cron de 5 campos (minuto hora día mes díaSemana).';
    }
    if (!isCronParseSuccess(result)) {
        return `Expresión inválida: ${result.error}`;
    }

    const { minute, hour, dayOfMonth, month, dayOfWeek } = result.fields;
    const singleMinute = minute.values.length === 1;
    const singleHour = hour.values.length === 1;
    const minuteInterval = minute.every && minute.values.length !== minute.max - minute.min + 1;
    const hourInterval = hour.every && hour.values.length !== hour.max - hour.min + 1;

    const timePieces: string[] = [];
    if (minuteInterval && hour.isFullRange) {
        timePieces.push(`cada ${minute.every} minutos`);
    } else if (hourInterval && singleMinute) {
        timePieces.push(`cada ${hour.every} horas en el minuto ${minute.values[0].toString().padStart(2, '0')}`);
    } else if (singleHour && singleMinute) {
        timePieces.push(`a las ${formatTime(minute.values[0], hour.values[0])}`);
    } else if (singleHour) {
        timePieces.push(`en la hora ${hour.values[0]}`);
    } else if (hourInterval) {
        timePieces.push(`cada ${hour.every} horas`);
    } else if (!hour.isFullRange) {
        timePieces.push(`en las horas ${formatList(hour.values.map((value) => value))}`);
    }

    if (!singleMinute && !minuteInterval && !minute.isFullRange) {
        timePieces.push(`minutos ${formatList(minute.values.map((value) => value))}`);
    }

    let datePhrase = 'todos los días';
    if (!dayOfMonth.isFullRange && dayOfWeek.isFullRange) {
        datePhrase = describeDayOfMonth(dayOfMonth);
    } else if (dayOfMonth.isFullRange && !dayOfWeek.isFullRange) {
        datePhrase = describeDayOfWeek(dayOfWeek);
    } else if (!dayOfMonth.isFullRange && !dayOfWeek.isFullRange) {
        datePhrase = `${describeDayOfMonth(dayOfMonth)} que caigan en ${describeDayOfWeek(dayOfWeek)}`;
    }

    const monthPhrase = describeMonth(month);
    const pieces = [datePhrase, monthPhrase, timePieces.join(' ')];
    const final = pieces
        .filter(Boolean)
        .map((piece) => piece.trim())
        .filter(Boolean)
        .join(' ')
        .trim();

    return final.charAt(0).toUpperCase() + final.slice(1);
};

const matchesDate = (fields: Record<CronField, ParsedField>, date: Date) => {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return (
        fields.minute.valueSet.has(minute) &&
        fields.hour.valueSet.has(hour) &&
        fields.dayOfMonth.valueSet.has(dayOfMonth) &&
        fields.month.valueSet.has(month) &&
        (fields.dayOfWeek.valueSet.has(dayOfWeek) || (dayOfWeek === 0 && fields.dayOfWeek.valueSet.has(7)))
    );
};

const getNextRuns = (result: CronParseResult, count = 5) => {
    if (!isCronParseSuccess(result)) {
        return { runs: [] as Date[], error: result.error };
    }

    const runs: Date[] = [];
    const now = new Date();
    const cursor = new Date(now);
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);

    // Cap at ~12 months ahead to avoid infinite loops.
    const maxIterations = 525_600;
    for (let i = 0; i < maxIterations && runs.length < count; i++) {
        if (matchesDate(result.fields, cursor)) {
            runs.push(new Date(cursor));
        }
        cursor.setMinutes(cursor.getMinutes() + 1);
    }

    return {
        runs,
        error: runs.length ? undefined : 'No se encontraron ejecuciones en los próximos 12 meses.',
    };
};

const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

interface NextRunsProps {
    parseResult: CronParseResult;
}

export const NextRuns: React.FC<NextRunsProps> = ({ parseResult }) => {
    const [runs, setRuns] = useState<Date[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { runs: computedRuns, error: runsError } = getNextRuns(parseResult, 5);
        setRuns(computedRuns);
        setError(runsError ?? null);
    }, [parseResult]);

    const hasContent = useMemo(() => parseResult.expression.trim().length > 0, [parseResult.expression]);

    return (
        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/80 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between gap-2 border-b border-emerald-500/10 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]" />
                    Próximas ejecuciones
                </div>
                <span className="text-[11px] uppercase tracking-widest text-emerald-400/70">preview x5</span>
            </div>

            {!hasContent ? (
                <p className="pt-3 text-sm text-zinc-400">Completa los campos para ver las próximas 5 fechas.</p>
            ) : error ? (
                <p className="pt-3 text-sm text-amber-300">{error}</p>
            ) : (
                <ul className="mt-3 space-y-2 font-mono text-sm text-emerald-100">
                    {runs.map((run, index) => (
                        <li
                            key={run.toISOString()}
                            className="flex items-center gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2"
                        >
                            <span className="text-xs text-emerald-300/80">#{index + 1}</span>
                            <span>{formatter.format(run)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NextRuns;
