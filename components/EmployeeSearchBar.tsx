"use client";

import { Search, X, Check } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

interface EmployeeSearchBarProps {
  employees: string[];
  selectedEmployee: string | null;
  onChange: (employee: string | null) => void;
}

export default function EmployeeSearchBar({
  employees,
  selectedEmployee,
  onChange,
}: EmployeeSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with selectedEmployee when it changes externally
  useEffect(() => {
    setInputValue(selectedEmployee || "");
  }, [selectedEmployee]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset input to selected employee when closing without selection
        setInputValue(selectedEmployee || "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedEmployee]);

  // Filter employees based on input
  const filteredEmployees = useMemo(() => {
    if (!inputValue.trim()) {
      return employees;
    }
    const searchTerm = inputValue.toLowerCase();
    return employees.filter((employee) =>
      employee.toLowerCase().includes(searchTerm)
    );
  }, [employees, inputValue]);

  // Check if input exactly matches an employee name (case-insensitive)
  const findExactMatch = (value: string): string | null => {
    const searchValue = value.toLowerCase().trim();
    return (
      employees.find((employee) => employee.toLowerCase() === searchValue) ||
      null
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const exactMatch = findExactMatch(inputValue);
      if (exactMatch) {
        onChange(exactMatch);
        setInputValue(exactMatch);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue(selectedEmployee || "");
      inputRef.current?.blur();
    }
  };

  const handleSelectEmployee = (employee: string | null) => {
    onChange(employee);
    setInputValue(employee || "");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setInputValue("");
    inputRef.current?.focus();
  };

  const showNoResults =
    inputValue.trim() && filteredEmployees.length === 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Input */}
      <div className="relative w-full sm:w-auto min-w-[220px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <Search className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="employee-listbox"
          aria-autocomplete="list"
          placeholder="직원 검색..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-14 pr-10 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-all shadow-sm hover:shadow font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
        {selectedEmployee && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="선택 해제"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="employee-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-[320px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="p-1">
            {/* All Employees Option */}
            <button
              type="button"
              role="option"
              aria-selected={selectedEmployee === null}
              onClick={() => handleSelectEmployee(null)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                selectedEmployee === null
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="font-medium">전체 직원</span>
              {selectedEmployee === null && <Check className="w-4 h-4" />}
            </button>

            {/* Divider */}
            {!showNoResults && filteredEmployees.length > 0 && (
              <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
            )}

            {/* No Results */}
            {showNoResults && (
              <div className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-sm">
                검색 결과 없음
              </div>
            )}

            {/* Filtered Employees */}
            {filteredEmployees.map((employee) => (
              <button
                key={employee}
                type="button"
                role="option"
                aria-selected={selectedEmployee === employee}
                onClick={() => handleSelectEmployee(employee)}
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
