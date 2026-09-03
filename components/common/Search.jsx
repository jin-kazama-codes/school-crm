/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useState } from "react";
import PropTypes from 'prop-types';
import { Search as SearchIcon, RotateCcw } from "lucide-react";

const Search = ({
    getSearchData,
    condition,
    setSearchFlag,
    reloadBtn,
    action,
    api
}) => {
    const [inputValue, setInputValue] = useState("");
    const isTab = typeof window !== "undefined" && window.innerWidth <= 920;

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSearch = () => {
        getSearchData(0, 5, action, api, condition, inputValue);
        setSearchFlag({
            search: true,
            searching: true,
        });
        if (reloadBtn) {
            reloadBtn.style.display = "inline-flex";
        }
    };

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
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
    };

    return (
        <div className={`flex items-center bg-slate-100 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2a2a2a] overflow-hidden w-full max-w-xl transition-all focus-within:ring-2 focus-within:ring-emerald-500/50 ${isTab ? 'h-10' : 'h-12'}`}>
            <input
                className="flex-1 bg-transparent px-4 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                placeholder="Search..."
                id="input"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
            
            <button
                id="reload-btn"
                type="button"
                onClick={handleReload}
                className="hidden items-center justify-center p-2 mx-1 text-slate-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-white/10"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
                onClick={handleSearch}
                className="flex items-center justify-center p-3 text-slate-400 hover:text-emerald-500 transition-colors bg-slate-200/50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            >
                <SearchIcon className="w-5 h-5" />
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
