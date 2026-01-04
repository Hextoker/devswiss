import { ToolLayout } from '@/components/ToolLayout';

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ToolLayout>{children}</ToolLayout>;
}
