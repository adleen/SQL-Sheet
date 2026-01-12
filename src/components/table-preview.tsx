import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type Row = Record<string, string | number | null | undefined>;

interface TablePreviewProps {
    headers: string[];
    data: Row[];
}

export default function TablePreview({ headers, data }: TablePreviewProps) {
    return (
        <div>
            <p className="text-sm font-medium mb-2">Data Preview:</p>
            <ScrollArea className="h-96 w-full rounded-md border">
                <div className="relative">
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
