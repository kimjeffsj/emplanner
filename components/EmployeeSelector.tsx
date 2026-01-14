"use client";

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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "all") {
      onChange(null);
    } else {
      onChange(value);
    }
  };

  return (
    <select
      value={selectedEmployee || "all"}
      onChange={handleChange}
      className="employee-selector"
    >
      <option value="all">전체 보기</option>
      {employees.map((employee) => (
        <option key={employee} value={employee}>
          {employee}
        </option>
      ))}
    </select>
  );
}
