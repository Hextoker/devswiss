declare module 'exifreader' {
    const ExifReader: {
        load: (data: ArrayBuffer, options?: { expanded?: boolean }) => Record<string, unknown>;
    };

    export default ExifReader;
}
