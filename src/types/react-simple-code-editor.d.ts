declare module 'react-simple-code-editor' {
    import * as React from 'react';

    type Props = {
        value: string;
        onValueChange: (value: string) => void;
        highlight: (value: string) => string;
        padding?: number;
        className?: string;
        textareaClassName?: string;
        style?: React.CSSProperties;
        preClassName?: string;
        textareaId?: string;
        textareaAriaLabel?: string;
        textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
        tabSize?: number;
        insertSpaces?: boolean;
        ignoreTabKey?: boolean;
    };

    const Editor: React.FC<Props>;
    export default Editor;
}
