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

  const displayText = selectedEmployee || "전체 직원";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto min-w-[220px] flex items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow"
        aria-label="직원 선택"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {displayText}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-[320px] overflow-y-auto z-10">
          <div className="p-1">
            <button
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                selectedEmployee === null
                  ? "bg-gray-900 dark:bg-gray-700 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <span className="font-medium">전체 직원</span>
              {selectedEmployee === null && <Check className="w-4 h-4" />}
            </button>
            <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
            {employees.map((employee) => (
              <button
                key={employee}
                onClick={() => {
                  onChange(employee);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  selectedEmployee === employee
                    ? "bg-gray-900 dark:bg-gray-700 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
