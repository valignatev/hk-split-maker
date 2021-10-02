import React from "react";
import type { StylesConfig } from "react-select";
import Select from "react-select";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import "./CategorySelect.css";

interface Props {
    id: string;
    onChange: (newValue: CategoryDefinition|null) => void;
    data?: Record<string, Array<CategoryDefinition>>;
    defaultValue: CategoryDefinition;
}

interface CategoryOption {
 value: string; label: string;
}

const customStyles: StylesConfig<CategoryOption> = {
    // option: (provided, state) => ({
    //     ...provided,
    //     color: !state.isFocused ? "white" : "maroon",
    // }),
    // singleValue: (provided) => {
    //     return { ...provided, color: "white", };
    // },
    // placeholder: (provided) => {
    //     return { ...provided, color: "white", };
    // },
    menu: (provided) => ({
        ...provided,
        // width: state.selectProps.width,
        // borderBottom: "1px dotted pink",
        // // color: state.selectProps.menuColor,
        // padding: 20,
        // "background-color": "#2f3136",
        "font-size": "14px",
        "font-family": "serif",
    }),
    control: (provided) => {
        return {
            ...provided,
            display: "flex",
            // color: "white",
            // "background-color": "#2f3136",
            "border": "1px solid white",
            "border-radius": "3px",
            // "font-size": "14px",
            // "font-family": "serif",
            "margin": "8px 8px 8px 0",
            // "padding-left": "8px",
            // "padding-right": "40px",
            // "position": "relative",
            // "background-repeat": "no-repeat, repeat",
            // "background-position": "right 0.7em top 50%, 0 0",
            // "background-size": "20px auto, 100%",
            // "appearance": "none",
            // "max-width": "100%",
        };
    },
    container: (provided) => {
        return {
            ...provided,
            flex: "1 1 0%",
        };
    },
};

function defToOption({ fileName, displayName, }: CategoryDefinition): CategoryOption {
    return {
        value: fileName, label: displayName,
    };
}

function optionToDef({ value, label, }: CategoryOption): CategoryDefinition {
    return {
        fileName: value, displayName: label,
    };
}

const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    data,
    defaultValue: initial,
}: Props) => {
    if (!data) {
        return <Select id={id}></Select>;
    }
    const optGroups = Object.entries(data).map(([groupName, groupEntries]) => {
        const options = groupEntries.map(defToOption);
        return {
            label: groupName,
            options: options,
        };
    });
    return (
        <Select<CategoryOption>
            id={id}
            options={optGroups}
            styles={customStyles}
            onChange={newValue => onChange(newValue ? optionToDef(newValue) : null)}
            defaultValue={defToOption(initial)}
            theme={theme => ({
                ...theme,
                spacing: {
                    ...theme.spacing,
                },
                colors: {
                    ...theme.colors,
                    neutral0: theme.colors.neutral90,
                    neutral5: theme.colors.neutral80,
                    neutral10: theme.colors.neutral70,
                    neutral20: theme.colors.neutral60,
                    neutral30: theme.colors.neutral50,
                    neutral40: theme.colors.neutral40,
                    neutral50: theme.colors.neutral30,
                    neutral60: theme.colors.neutral20,
                    neutral70: theme.colors.neutral10,
                    neutral80: theme.colors.neutral5,
                    neutral90: theme.colors.neutral0,
                },
            })}
        />
    );
};
export default CategorySelect;
