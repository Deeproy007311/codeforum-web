import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function SearchBar({
    onSearch,
}: {
    onSearch: (value: string) => void;
}) {
    const [value, setValue] = useState("");

    return (
        <div className="relative w-full max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
                placeholder="Search questions by title, description, or keyword..."
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    onSearch(e.target.value);
                }}
                className="w-full pl-10 h-10.5 rounded-xl border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400/80 focus:border-indigo-500/50 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all shadow-xs"
            />
        </div>
    );
}

export default SearchBar;