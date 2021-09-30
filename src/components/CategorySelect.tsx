import React from "react";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import "./CategorySelect.css";

interface Props {
    id: string;
    onChange: () => void;
    categories?: Record<string, Array<CategoryDefinition>>;
    currentCategory: CategoryDefinition;
}

const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    categories,
    currentCategory,
}: Props) => {
    if (!categories) {
        return <select id={id}></select>;
    }
    const optGroups = Object.entries(categories).map(([groupName, values]) => {
        const categoryOptions = values.map(value => {
            return <option value={value.fileName} key={value.fileName}>{value.displayName}</option>;
        });
        return <optgroup label={groupName} key={groupName}>{categoryOptions}</optgroup>;
    });
    console.log(currentCategory);
    const routeNotes = currentCategory.routeNotesURL ?
        <span id="route-notes"><a href={currentCategory.routeNotesURL} target="_blank" rel="noopener noreferrer">
            Route Notes
        </a></span>
        :
        <span id="route-notes">Route notes unavailable</span>;

    return (
        <div>
            <select
                id={id}
                defaultValue={currentCategory.fileName}
                onChange={onChange}
                className="catsel"
            >
                {optGroups}
            </select>
            {routeNotes}
        </div>
    );
};
export default CategorySelect;
