import React from "react";
import Select from "react-select";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import "./CategorySelect.css";

interface Props {
    id: string;
    onChange: () => void;
    data?: Record<string, Array<CategoryDefinition>>;
    initial: string;
}

const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    data,
    initial,
}: Props) => {
    if (!data) {
        return <Select id={id}></Select>;
    }
    const optGroups = Object.entries(data).map(([groupName, groupEntries]) => {
        const options = groupEntries.map(entry => {
            return {
                value: entry.fileName,
                label: entry.displayName,
            };
        });
        return {
            label: groupName,
            options: options,
        };
    });
    return (
        <Select className="catsel"
            id={id}
            options={optGroups}
        />
    );
};
export default CategorySelect;
