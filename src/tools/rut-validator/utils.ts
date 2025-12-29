const sanitizeRut = (value: string) => value.replace(/[^\dkK]/g, '');

export const calculateDV = (body: string | number): string => {
    const digits = String(body).replace(/\D/g, '');
    if (!digits) return '';

    let sum = 0;
    let multiplier = 2;

    for (let i = digits.length - 1; i >= 0; i -= 1) {
        sum += Number(digits[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = 11 - (sum % 11);
    if (remainder === 11) return '0';
    if (remainder === 10) return 'K';
    return String(remainder);
};

export const formatRut = (
    body: string,
    dv?: string,
    options: { withDots?: boolean; withDash?: boolean } = {}
) => {
    const { withDots = true, withDash = true } = options;
    const digits = body.replace(/\D/g, '');
    const dotted = withDots ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : digits;

    if (withDash && dv) return `${dotted}-${dv}`;
    return dotted;
};

export type RutValidationResult = {
    raw: string;
    cleaned: string;
    body: string;
    providedDV: string | null;
    expectedDV: string;
    missingDV: boolean;
    isValid: boolean;
    message: string;
    formatted: {
        pretty: string;
        dashed: string;
        compact: string;
    };
};

export const validateRut = (input: string): RutValidationResult => {
    const cleaned = sanitizeRut(input);

    if (!cleaned) {
        return {
            raw: input,
            cleaned: '',
            body: '',
            providedDV: null,
            expectedDV: '',
            missingDV: true,
            isValid: false,
            message: 'Ingresa un RUT para validar.',
            formatted: { pretty: '', dashed: '', compact: '' },
        };
    }

    const hasExplicitDV = /-/.test(input) || /[kK]$/.test(cleaned) || cleaned.length > 8;
    const candidateBody = cleaned.slice(0, -1);
    const candidateDV = cleaned.slice(-1).toUpperCase();
    const dvMatchesCandidate = calculateDV(candidateBody) === candidateDV;

    const useCandidateDV = cleaned.length >= 2 && (hasExplicitDV || dvMatchesCandidate);
    const body = useCandidateDV ? candidateBody : cleaned;
    const providedDV = useCandidateDV ? candidateDV : null;

    const expectedDV = calculateDV(body);
    const missingDV = !providedDV;
    const isValid = !!providedDV && expectedDV === providedDV;

    const formatted = {
        pretty: formatRut(body, missingDV ? expectedDV : providedDV ?? expectedDV, { withDots: true, withDash: true }),
        dashed: formatRut(body, missingDV ? expectedDV : providedDV ?? expectedDV, { withDots: false, withDash: true }),
        compact: formatRut(body, undefined, { withDots: false, withDash: false }),
    };

    let message = '';
    if (missingDV) {
        message = `DV faltante. El dígito verificador correcto es ${expectedDV}.`;
    } else if (isValid) {
        message = 'RUT válido según el algoritmo Módulo 11.';
    } else {
        message = `DV no coincide. El DV correcto debería ser ${expectedDV}.`;
    }

    return {
        raw: input,
        cleaned,
        body,
        providedDV,
        expectedDV,
        missingDV,
        isValid,
        message,
        formatted,
    };
};

export const generateRandomRut = () => {
    const body = String(Math.floor(Math.random() * (25000000 - 5000000) + 5000000));
    const dv = calculateDV(body);
    return {
        body,
        dv,
        formatted: {
            pretty: formatRut(body, dv, { withDots: true, withDash: true }),
            dashed: formatRut(body, dv, { withDots: false, withDash: true }),
            compact: formatRut(body, undefined, { withDots: false, withDash: false }),
        },
    };
};
