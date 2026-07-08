import { useState } from "react";
import { Input } from "@/components/ui/input";

function SearchBar({
    onSearch,
}: {
    onSearch: (value: string) => void;
}) {
    const [value, setValue] = useState("");

    return (
        <Input
            placeholder="Search questions by title or keyword..."
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
                onSearch(e.target.value);
            }}
            className="max-w-md"
        />
    );
}

export default SearchBar;