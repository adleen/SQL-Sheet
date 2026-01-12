'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Row = Record<string, string | number | null | undefined>;

interface TablePreviewProps {
    headers: string[];
    data: Row[];
    maximized?: boolean;
}

export default function TablePreview({ headers, data, maximized = false }: TablePreviewProps) {

    return (
        <ScrollArea className={cn(
            "w-full rounded-md border whitespace-nowrap",
            maximized ? "h-full" : "h-96"
        )}>
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map(header => (
                            <TableHead key={header} className="font-bold whitespace-nowrap sticky top-0 bg-card">{header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {headers.map(header => (
                                <TableCell key={`${header}-${rowIndex}`} className="whitespace-nowrap">
                                    {String(row[header] ?? '')}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {data.length === 0 && <p className="p-4 text-center text-muted-foreground">No data rows found.</p>}
        </ScrollArea>
    );
}
