'use client';

import { useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Row = Record<string, string | number | null | undefined>;

interface TablePreviewProps {
    headers: string[];
    data: Row[];
}

export default function TablePreview({ headers, data }: TablePreviewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Data Preview:</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => scroll('left')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => scroll('right')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="h-96 w-full rounded-md border">
                <div ref={scrollRef} className="relative overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                            <TableRow>
                                {headers.map(header => (
                                    <TableHead key={header} className="font-bold whitespace-nowrap">{header}</TableHead>
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
                </div>
                {data.length === 0 && <p className="p-4 text-center text-muted-foreground">No data rows found.</p>}
            </ScrollArea>
        </div>
    );
}
