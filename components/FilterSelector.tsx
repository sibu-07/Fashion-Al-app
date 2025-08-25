
import React from 'react';

interface FilterSelectorProps<T extends string> {
  label: string;
  options: T[];
  selectedValue: T;
  onChange: (value: T) => void;
}

const FilterSelector = <T extends string,>({ label, options, selectedValue, onChange }: FilterSelectorProps<T>) => {
  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ease-in-out
              ${selectedValue === option
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSelector;
