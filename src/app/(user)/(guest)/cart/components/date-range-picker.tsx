"use client";

import * as React from "react";
import { addDays, format, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const tomorrow = React.useMemo(() => addDays(new Date(), 1), []);

  // Set default date range to start from tomorrow if no date range is provided
  React.useEffect(() => {
    if (!dateRange?.from) {
      onDateRangeChange({ from: tomorrow, to: addDays(tomorrow, 0) });
    }
  }, []);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onDateRangeChange(undefined);
      return;
    }

    // Calculate days from tomorrow to selected date
    const daysDifference = differenceInDays(date, tomorrow);

    // If selected date is more than 30 days from tomorrow, cap it at 30 days
    if (daysDifference > 30) {
      date = addDays(tomorrow, 30);
    }

    // If selected date is before tomorrow, set it to tomorrow
    if (daysDifference < 0) {
      date = tomorrow;
    }

    onDateRangeChange({
      from: tomorrow,
      to: date,
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.to ? (
              <>
                Until {format(dateRange.to, "dd/MM/yyyy")}
                {/* <span className="ml-2 text-sm text-muted-foreground">
                  ({differenceInDays(dateRange.to, tomorrow)} days)
                </span> */}
              </>
            ) : (
              <span>Pick an end date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={tomorrow}
            selected={dateRange?.to}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={(date) => date < tomorrow}
            fromDate={addDays(tomorrow, 0)}
            toDate={addDays(tomorrow, 30)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
