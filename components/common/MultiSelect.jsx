import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, X, Check, Search } from 'lucide-react';

const MultiSelect = ({
    options = [],
    value = [],
    onChange,
    getOptionLabel = (option) => option?.name || option?.title || option?.section_name || String(option || ''),
    placeholder = "Select options...",
    error = false,
    helperText = "",
    disabled = false,
    className = "",
    onFocus
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedValues = Array.isArray(value) ? value : [];

    const isSelected = (option) => {
        return selectedValues.some(item => {
            if (item?.id !== undefined && option?.id !== undefined) return item.id === option.id;
            if (item?.section_id !== undefined && option?.section_id !== undefined) return item.section_id === option.section_id;
            if (item?.class_id !== undefined && option?.class_id !== undefined) return item.class_id === option.class_id;
            return getOptionLabel(item) === getOptionLabel(option);
        });
    };

    const toggleOption = (option) => {
        let newValues;
        if (isSelected(option)) {
            newValues = selectedValues.filter(item => {
                if (item?.id !== undefined && option?.id !== undefined) return item.id !== option.id;
                if (item?.section_id !== undefined && option?.section_id !== undefined) return item.section_id !== option.section_id;
                if (item?.class_id !== undefined && option?.class_id !== undefined) return item.class_id !== option.class_id;
                return getOptionLabel(item) !== getOptionLabel(option);
            });
        } else {
            newValues = [...selectedValues, option];
        }
        if (onChange) {
            onChange(null, newValues);
        }
    };

    const removeOption = (e, option) => {
        e.stopPropagation();
        const newValues = selectedValues.filter(item => {
            if (item?.id !== undefined && option?.id !== undefined) return item.id !== option.id;
            if (item?.section_id !== undefined && option?.section_id !== undefined) return item.section_id !== option.section_id;
            if (item?.class_id !== undefined && option?.class_id !== undefined) return item.class_id !== option.class_id;
            return getOptionLabel(item) !== getOptionLabel(option);
        });
        if (onChange) {
            onChange(null, newValues);
        }
    };

    const filteredOptions = options.filter(option => {
        const label = getOptionLabel(option);
        return String(label).toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Input Trigger Box */}
            <div
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                        if (onFocus && !isOpen) onFocus();
                    }
                }}
                className={`min-h-[44px] w-full bg-white dark:bg-[#141414] border ${
                    error
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : isOpen
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-[#2a2a2a] hover:border-slate-300 dark:hover:border-[#333]'
                } rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 cursor-pointer transition-all shadow-xs`}
            >
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    {selectedValues.length === 0 ? (
                        <span className="text-xs text-slate-400 dark:text-gray-500 select-none">
                            {placeholder}
                        </span>
                    ) : (
                        selectedValues.map((item, idx) => {
                            const label = getOptionLabel(item);
                            return (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold animate-in fade-in zoom-in-95"
                                >
                                    <span className="truncate max-w-[140px]">{label}</span>
                                    <span
                                        role="button"
                                        onClick={(e) => removeOption(e, item)}
                                        className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded p-0.5 cursor-pointer text-emerald-600 dark:text-emerald-400"
                                    >
                                        <X className="w-3 h-3" />
                                    </span>
                                </span>
                            );
                        })
                    )}
                </div>

                <div className="flex items-center space-x-1 shrink-0 text-slate-400">
                    {selectedValues.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onChange) onChange(null, []);
                            }}
                            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#141414] border border-slate-100 dark:border-[#222] rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search inside dropdown */}
                    <div className="relative px-1 pt-1 pb-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter options..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar px-1">
                        {filteredOptions.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 dark:text-gray-500 py-3">
                                No matching options
                            </p>
                        ) : (
                            filteredOptions.map((option, idx) => {
                                const selected = isSelected(option);
                                const label = getOptionLabel(option);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleOption(option)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                                            selected
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                                                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => {}}
                                                className="rounded accent-emerald-600 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className="truncate">{label}</span>
                                        </div>
                                        {selected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Helper text */}
            {helperText && (
                <p className={`text-[11px] mt-1 ${error ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

MultiSelect.propTypes = {
    options: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func,
    getOptionLabel: PropTypes.func,
    placeholder: PropTypes.string,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onFocus: PropTypes.func
};

export default MultiSelect;
