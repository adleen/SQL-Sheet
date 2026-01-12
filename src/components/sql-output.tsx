'use client';

import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface SqlOutputProps {
    sql: string;
    tableName: string;
}

export default function SqlOutput({ sql, tableName }: SqlOutputProps) {
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sql).then(() => {
            setHasCopied(true);
            toast({
                title: "Copied to clipboard!",
                description: "The SQL code has been copied successfully.",
            });
            setTimeout(() => setHasCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                variant: "destructive",
                title: "Copy failed",
                description: "Could not copy to clipboard. Please try again.",
            });
        });
    };

    const downloadSqlFile = () => {
        const blob = new Blob([sql], { type: 'application/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName.trim() || 'data'}_inserts.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <pre className="bg-muted rounded-md p-4 pr-12 max-h-96 overflow-auto text-sm font-code">
                    <code>{sql}</code>
                </pre>
                <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy to clipboard">
                        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={downloadSqlFile}>
                    <Download className="mr-2 h-4 w-4" />
                    Download .sql file
                </Button>
            </div>
        </div>
    );
}
