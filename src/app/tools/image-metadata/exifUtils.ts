export type ExifTag = {
    description?: string;
    value?: unknown;
};

export type ExifSectionItem = {
    label: string;
    value: string;
};

export type ExifSection = {
    id: string;
    title: string;
    items: ExifSectionItem[];
    emptyLabel: string;
};

export type FileMeta = {
    name: string;
    size: number;
    type: string;
    lastModified: number;
};

const labelMap: Record<string, string> = {
    Make: 'Marca',
    Model: 'Modelo',
    LensMake: 'Marca del lente',
    LensModel: 'Lente',
    SerialNumber: 'Numero de serie',
    BodySerialNumber: 'Serie del cuerpo',
    Software: 'Software',
    DateTimeOriginal: 'Fecha de captura',
    CreateDate: 'Fecha de creacion',
    ModifyDate: 'Ultima modificacion',
    ExposureTime: 'Tiempo de exposicion',
    FNumber: 'Apertura (f)',
    ApertureValue: 'Apertura (valor)',
    ShutterSpeedValue: 'Velocidad de obturacion',
    ISOSpeedRatings: 'ISO',
    ISO: 'ISO',
    ExposureBiasValue: 'Compensacion de exposicion',
    ExposureProgram: 'Programa de exposicion',
    ExposureMode: 'Modo de exposicion',
    MeteringMode: 'Medicion',
    WhiteBalance: 'Balance de blancos',
    Flash: 'Flash',
    FocalLength: 'Distancia focal',
    FocalLengthIn35mmFilm: 'Focal equivalente 35mm',
    DigitalZoomRatio: 'Zoom digital',
    SceneCaptureType: 'Tipo de escena',
    Orientation: 'Orientacion',
    ColorSpace: 'Espacio de color',
    ImageWidth: 'Ancho',
    ImageHeight: 'Alto',
    PixelXDimension: 'Ancho (px)',
    PixelYDimension: 'Alto (px)',
    GPSLatitude: 'Latitud',
    GPSLongitude: 'Longitud',
    GPSAltitude: 'Altitud',
    GPSTimeStamp: 'Hora GPS',
    GPSDateStamp: 'Fecha GPS',
    GPSImgDirection: 'Direccion',
    GPSImgDirectionRef: 'Referencia direccion',
    GPSProcessingMethod: 'Metodo de posicionamiento',
    FileType: 'Tipo de archivo',
    FileTypeExtension: 'Extension',
    MIMEType: 'MIME',
    FileSize: 'Tamano',
};

const humanizeLabel = (value: string) =>
    labelMap[value] ?? value.replace(/([a-z])([A-Z])/g, '$1 $2');

const formatValue = (tag?: ExifTag): string | null => {
    if (!tag) return null;
    if (typeof tag.description === 'string' && tag.description.trim()) {
        return tag.description;
    }
    if (tag.value === null || tag.value === undefined) return null;
    if (Array.isArray(tag.value)) {
        return tag.value.map((entry) => String(entry)).join(', ');
    }
    if (typeof tag.value === 'object') {
        try {
            return JSON.stringify(tag.value);
        } catch {
            return String(tag.value);
        }
    }
    return String(tag.value);
};

const isExpandedTags = (tags: Record<string, unknown> | null) => {
    if (!tags) return false;
    return (
        'file' in tags ||
        'exif' in tags ||
        'gps' in tags ||
        'image' in tags ||
        'tiff' in tags ||
        'xmp' in tags ||
        'iptc' in tags
    );
};

const getTagValue = (
    tags: Record<string, unknown> | null,
    key: string,
    groupOrder: string[] = []
): string | null => {
    if (!tags) return null;
    if (isExpandedTags(tags)) {
        for (const group of groupOrder) {
            const tag = (tags[group] as Record<string, ExifTag> | undefined)?.[key];
            const value = formatValue(tag);
            if (value) return value;
        }
        return null;
    }
    return formatValue(tags[key] as ExifTag | undefined);
};

const mapKeysToItems = (
    tags: Record<string, unknown> | null,
    keys: string[],
    groupOrder: string[]
): ExifSectionItem[] =>
    keys
        .map((key) => {
            const value = getTagValue(tags, key, groupOrder);
            if (value === null || value === '') return null;
            return { label: humanizeLabel(key), value };
        })
        .filter((item): item is ExifSectionItem => Boolean(item));

const cameraKeys = [
    'Make',
    'Model',
    'LensMake',
    'LensModel',
    'SerialNumber',
    'BodySerialNumber',
    'Software',
    'DateTimeOriginal',
    'CreateDate',
    'ModifyDate',
];

const technicalKeys = [
    'ExposureTime',
    'FNumber',
    'ApertureValue',
    'ShutterSpeedValue',
    'ISOSpeedRatings',
    'ISO',
    'ExposureBiasValue',
    'ExposureProgram',
    'ExposureMode',
    'MeteringMode',
    'WhiteBalance',
    'Flash',
    'FocalLength',
    'FocalLengthIn35mmFilm',
    'DigitalZoomRatio',
    'SceneCaptureType',
    'Orientation',
    'ColorSpace',
];

const gpsKeys = [
    'GPSLatitude',
    'GPSLongitude',
    'GPSAltitude',
    'GPSDateStamp',
    'GPSTimeStamp',
    'GPSImgDirection',
    'GPSImgDirectionRef',
    'GPSProcessingMethod',
];

const fileKeys = ['FileType', 'FileTypeExtension', 'MIMEType', 'FileSize'];

const dimensionKeys = ['ImageWidth', 'ImageHeight', 'PixelXDimension', 'PixelYDimension'];

export const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const buildExifSections = (
    tags: Record<string, unknown> | null,
    fileMeta: FileMeta | null
): ExifSection[] => {
    const cameraItems = mapKeysToItems(tags, cameraKeys, ['image', 'tiff', 'exif']);
    const technicalItems = mapKeysToItems(tags, technicalKeys, ['exif', 'image']);
    const gpsItems = mapKeysToItems(tags, gpsKeys, ['gps', 'exif']);
    const fileItems = mapKeysToItems(tags, fileKeys, ['file', 'image']);

    const dimensionItems = mapKeysToItems(tags, dimensionKeys, ['image', 'file', 'exif']);
    if (dimensionItems.length) {
        const existingLabels = new Set(fileItems.map((item) => item.label));
        dimensionItems.forEach((item) => {
            if (!existingLabels.has(item.label)) {
                fileItems.push(item);
            }
        });
    }

    if (fileMeta) {
        fileItems.unshift({ label: 'Nombre', value: fileMeta.name });
        fileItems.unshift({ label: 'Tamano', value: formatFileSize(fileMeta.size) });
        fileItems.unshift({ label: 'Tipo MIME', value: fileMeta.type || 'No detectado' });
        fileItems.unshift({ label: 'Modificado', value: new Date(fileMeta.lastModified).toLocaleString() });
    }

    return [
        {
            id: 'camera',
            title: 'Camara',
            items: cameraItems,
            emptyLabel: 'Sin datos de camara detectados.',
        },
        {
            id: 'gps',
            title: 'Ubicacion (GPS)',
            items: gpsItems,
            emptyLabel: 'No hay coordenadas GPS en la imagen.',
        },
        {
            id: 'technical',
            title: 'Configuracion tecnica',
            items: technicalItems,
            emptyLabel: 'Sin parametros tecnicos visibles.',
        },
        {
            id: 'file',
            title: 'Informacion del archivo',
            items: fileItems,
            emptyLabel: 'No se pudieron leer datos del archivo.',
        },
    ];
};
