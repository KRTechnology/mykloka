"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, Check, Filter, Users2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
}

interface AttendanceFilterProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onRangeChange?: (range: { from: Date; to: Date }) => void;
  onStatusFilter?: (statuses: ("present" | "late" | "absent")[]) => void;
  onDepartmentChange?: (departmentId: string | null) => void;
  canViewDepartment?: boolean;
  canViewAll?: boolean;
}

const presetRanges = [
  {
    label: "Today",
    getValue: (date: Date) => ({ from: date, to: date }),
  },
  {
    label: "This Week",
    getValue: (date: Date) => ({
      from: startOfWeek(date, { weekStartsOn: 1 }),
      to: endOfWeek(date, { weekStartsOn: 1 }),
    }),
  },
  {
    label: "This Month",
    getValue: (date: Date) => ({
      from: startOfMonth(date),
      to: endOfMonth(date),
    }),
  },
];

const statusOptions = [
  { label: "Present", value: "present" as const, color: "text-kr-green" },
  { label: "Late", value: "late" as const, color: "text-yellow-500" },
  { label: "Absent", value: "absent" as const, color: "text-destructive" },
] as const;

export function AttendanceFilter({
  date,
  onDateChange,
  onRangeChange,
  onStatusFilter,
  onDepartmentChange,
  canViewDepartment,
  canViewAll,
}: AttendanceFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<
    ("present" | "late" | "absent")[]
  >([]);
  const [selectedRange, setSelectedRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/departments");
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        toast.error("Failed to load departments");
      }
    }

    if (canViewDepartment || canViewAll) {
      fetchDepartments();
    }
  }, [canViewDepartment, canViewAll]);

  const handleStatusToggle = useCallback(
    (status: "present" | "late" | "absent") => {
      setSelectedStatuses((current) =>
        current.includes(status)
          ? current.filter((s) => s !== status)
          : [...current, status]
      );
    },
    []
  );

  useEffect(() => {
    onStatusFilter?.(selectedStatuses);
  }, [selectedStatuses, onStatusFilter]);

  const handleRangeSelect = useCallback((range: { from: Date; to: Date }) => {
    setSelectedRange(range);
    setIsCalendarOpen(false);
  }, []);

  const handleDepartmentChange = useCallback(
    (departmentId: string | null) => {
      setSelectedDepartment(departmentId);
      onDepartmentChange?.(departmentId);
      setIsDepartmentOpen(false);
    },
    [onDepartmentChange]
  );

  const clearFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedRange(null);
  }, []);

  useEffect(() => {
    if (selectedRange) {
      onRangeChange?.(selectedRange);
    }
  }, [selectedRange, onRangeChange]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange ? (
              <>
                {format(selectedRange.from, "PP")} -{" "}
                {format(selectedRange.to, "PP")}
              </>
            ) : (
              format(date, "PPP")
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleRangeSelect(preset.getValue(date))}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Separator />
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && onDateChange(newDate)}
              initialFocus
            />
          </div>
        </PopoverContent>
      </Popover>

      {(canViewDepartment || canViewAll) && (
        <Popover open={isDepartmentOpen} onOpenChange={setIsDepartmentOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDepartment && "text-muted-foreground"
              )}
            >
              <Users2 className="mr-2 h-4 w-4" />
              {selectedDepartment
                ? departments.find((d) => d.id === selectedDepartment)?.name
                : "All Departments"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search department..." />
              <CommandList>
                <CommandEmpty>No department found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleDepartmentChange(null)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedDepartment ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Departments
                  </CommandItem>
                  {departments.map((department) => (
                    <CommandItem
                      key={department.id}
                      onSelect={() => handleDepartmentChange(department.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedDepartment === department.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {department.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Filter className="h-4 w-4" />
            {selectedStatuses.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs"
              >
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Filter status..." />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {statusOptions.map((status) => (
                  <CommandItem
                    key={status.value}
                    onSelect={() =>
                      handleStatusToggle(
                        status.value as "present" | "late" | "absent"
                      )
                    }
                  >
                    <div
                      className={cn(
                        "mr-2",
                        selectedStatuses.includes(
                          status.value as "present" | "late" | "absent"
                        )
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span className={status.color}>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {selectedStatuses.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={clearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                </div>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <AnimatePresence>
        {(selectedStatuses.length > 0 ||
          selectedRange ||
          selectedDepartment) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2"
          >
            {selectedStatuses.map((status) => (
              <Badge
                key={status}
                variant="secondary"
                className="text-xs"
                onClick={() =>
                  handleStatusToggle(status as "present" | "late" | "absent")
                }
              >
                {status}
                <X className="ml-1 h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
            {selectedDepartment && (
              <Badge
                variant="secondary"
                className="text-xs"
                onClick={() => handleDepartmentChange(null)}
              >
                {departments.find((d) => d.id === selectedDepartment)?.name}
                <X className="ml-1 h-3 w-3 cursor-pointer" />
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
