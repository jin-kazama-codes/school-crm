/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";

const Search = ({
    getSearchData,
    condition,
    setSearchFlag,
    reloadBtn,
    action,
    api
}) => {
    const [inputValue, setInputValue] = useState("");

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSearch = () => {
        if (!inputValue.trim()) {
            handleReload();
            return;
        }
        getSearchData(0, 5, action, api, condition, inputValue.trim());
        setSearchFlag({
            search: true,
            searching: true,
        });
        if (reloadBtn) {
            reloadBtn.style.display = "inline-flex";
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleReload = () => {
        if (reloadBtn) {
            reloadBtn.style.display = "none";
        }
        setInputValue('');
        setSearchFlag({
            search: false,
            searching: false
        });
        getSearchData(0, 5, action, api, condition, '');
    };

    return (
        <div className="flex items-center bg-white dark:bg-[#141414] rounded-xl border border-slate-200 dark:border-[#222] overflow-hidden w-full max-w-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 shadow-xs h-10 px-3 space-x-2">
            <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <input
                className="flex-1 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                placeholder="Search records…"
                id="input"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
            
            {inputValue && (
                <button
                    type="button"
                    onClick={handleReload}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            <button
                type="button"
                onClick={handleSearch}
                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                title="Execute search"
            >
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

Search.propTypes = {
    getSearchData: PropTypes.func,
    condition: PropTypes.any,
    setSearchFlag: PropTypes.func,
    reloadBtn: PropTypes.object,
    action: PropTypes.func,
    api: PropTypes.object
};

export default Search;
