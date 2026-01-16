"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeSelectorProps {
  employees: string[];
  selectedEmployee: string | null;
  onChange: (employee: string | null) => void;
}

export default function EmployeeSelector({
  employees,
  selectedEmployee,
  onChange,
}: EmployeeSelectorProps) {
  const handleChange = (value: string) => {
    if (value === "all") {
      onChange(null);
    } else {
      onChange(value);
    }
  };

  return (
    <Select value={selectedEmployee || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]" aria-label="직원 선택">
        <SelectValue placeholder="직원 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">전체 보기</SelectItem>
        {employees.map((employee) => (
          <SelectItem key={employee} value={employee}>
            {employee}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
