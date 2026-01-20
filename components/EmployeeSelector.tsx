"use client";

import { User, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayText = selectedEmployee || "All Employees";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto min-w-[220px] flex items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow"
        aria-label="Select employee"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {displayText}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-[320px] overflow-y-auto z-50">
          <div className="p-1">
            <button
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                selectedEmployee === null
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="font-medium">All Employees</span>
              {selectedEmployee === null && <Check className="w-4 h-4" />}
            </button>
            <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
            {employees.map((employee) => (
              <button
                key={employee}
                onClick={() => {
                  onChange(employee);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  selectedEmployee === employee
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-medium">{employee}</span>
                {selectedEmployee === employee && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
