import type { ReactNode } from "react";
import React, { Component } from "react";
import { saveAs } from "file-saver";
import { getCategory, getCategoryDirectory } from "../lib/categories";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import type { Config } from "../lib/lss";
import { createSplitsXml } from "../lib/lss";
import ArrowButton from "./ArrowButton";
import CategorySelect from "./CategorySelect";
import SplitConfigEditor from "./SplitConfigEditor";
import SplitOutputEditor from "./SplitOutputEditor";
import Header from "./Header";
import Instructions from "./Instructions";
import AlertBanner from "./AlertBanner";

type AppProps = Record<string, never>;
interface AppState {
    configInput: string;
    splitOutput: string;
    categories?: Record<string, Array<CategoryDefinition>>;
    initialCategory: CategoryDefinition;
    requestedCategoryViaURL: boolean;
}
export default class App extends Component<AppProps, AppState> {

    private inputEditor: React.MutableRefObject<SplitConfigEditor|null>;

    private categoryHasChanged = false;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            configInput: "",
            splitOutput: "",
            initialCategory: {
                "fileName": "4ms",
                "displayName": "4 Mask Shards",
            },
            requestedCategoryViaURL: false,
        };
        this.inputEditor = React.createRef();
    }
    public async componentDidMount(): Promise<void> {
        const newState = {
            categories: await getCategoryDirectory(),
            initialCategory: this.state.initialCategory,
            requestedCategoryViaURL: false,
        };
        const hash = window.location.hash.substring(1);
        if (newState.categories) {
            const initialCategory = Object.values(newState.categories).flat().find(category => {
                return category.fileName.toLowerCase() === hash.toLowerCase();
            });
            if (initialCategory) {
                newState.initialCategory = initialCategory;
                newState.requestedCategoryViaURL = true;
            }
            await this.updateCategory(newState.initialCategory);
        }
        this.setState(newState);
    }
    public render(): ReactNode {
        return (
            <div id="app">
                <AlertBanner />
                <Header />
                <Instructions />
                <div id="input-output">
                    <div id="editor-section" className="side">
                        <h2>Input config JSON</h2>
                        <div className="output-container">
                            <div className="row">
                                {/* Hacky, but useful: Only render the drop down once we have data.
                                    Otherwise, the initial defaultValue will be empty, and never updated,
                                    so the inital value will always be the first in the list, not Aluba.
                                    Setting value instead of defaultValue leads to the change event
                                    not triggering when the initial value is re-selected. */}
                                {this.state.categories && this.state.initialCategory && <CategorySelect
                                    id="categories"
                                    onChange={this.onCategorySelect.bind(this)}
                                    data={this.state.categories}
                                    defaultValue={
                                        this.state.requestedCategoryViaURL ? this.state.initialCategory : null
                                    }
                                />}
                                <ArrowButton
                                    text="Generate"
                                    id="submit-button"
                                    onClick={this.onSubmit.bind(this)}
                                />
                            </div>
                            <SplitConfigEditor
                                defaultValue={this.state.configInput}
                                onChange={this.onConfigInputChange.bind(this)}
                                ref={this.inputEditor}
                            />
                        </div>
                    </div>
                    <div id="output-section" className="side">
                        <h2>Output Splits File</h2>
                        <div className="output-container">
                            <div className="row">
                                <ArrowButton
                                    id="download-button"
                                    text="Download"
                                    onClick={this.onDownload.bind(this)}
                                    disabled={this.state.splitOutput.length === 0}
                                />
                            </div>
                            <SplitOutputEditor
                                defaultValue={this.state.splitOutput}
                                onChange={this.onSplitOutputChange.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onConfigInputChange(value: string|undefined) {
        this.setState({
            configInput: value ?? "",
        });
    }

    private onSplitOutputChange(value: string|undefined) {
        this.setState({
            splitOutput: value ?? "",
        });
    }

    private async updateCategory(category: CategoryDefinition) {
        if (category.fileName && this.inputEditor.current) {
            const editorContent = await getCategory(category.fileName);
            this.inputEditor.current.setContent(editorContent);
            this.onConfigInputChange(editorContent);
            if (this.categoryHasChanged) {
                window.location.hash = category.fileName;
            }
            this.categoryHasChanged = true;
        }
    }
    private async onCategorySelect(newValue: CategoryDefinition|null) {
        if (newValue) {
            await this.updateCategory(newValue);
        }
    }

    private parseConfigInput() {
        return JSON.parse(this.state.configInput) as Config;
    }

    private async onSubmit(): Promise<void> {
        let configObject;
        try {
            configObject = this.parseConfigInput();
        }
        catch (e) {
            console.log(e);
            alert("Failed to parse config as JSON");
            return;
        }
        let output = "";

        const submitButton = document.getElementById("submit-button") as HTMLInputElement;
        submitButton.disabled = true;

        try {
            // todo: runtime schema validation
            output = await createSplitsXml(configObject);
        }
        catch (e) {
            console.error(e);
            alert("Failed to create splits. The error has been logged to console.error");
            return;
        }
        finally {
            submitButton.disabled = false;
        }

        this.setState({
            splitOutput: output,
        });
    }

    private buildSplitsFileName(splitsConfig: Config) {
        const filename = (splitsConfig?.categoryName || "splits")
            .toLowerCase() // Make file name compatible:
            .replace(/['"]/g, "") // remove ' and "
            .replace(/[^a-z0-9]/gi, "_")  // replace non-alphanum with _
            .replace(/^_+|_+$/g, "")  // remove outer _
            .replace(/^_+|_+$/g, "")  // remove outer _
            .replace(/_{2,}/g, "_");  // join multiple _
        let suffix = "";
        if (splitsConfig.variables?.glitch) {
            const glitch = splitsConfig.variables?.glitch;
            switch (glitch) {
                case "No Main Menu Storage": suffix = "-nmms"; break;
                case "All Glitches":         suffix = "-ag"; break;
                default: break; // nmg categories don't need suffix
            }
        }
        return `${filename}${suffix}`;
    }

    private onDownload(): void {
        const output = this.state.splitOutput;
        const outBlob = new Blob([output]);

        // Guess a good file name.
        // Can be inaccurate if a new config has been entered but not processed yet.
        let splitName = "";
        try {
            const splitsConfig = this.parseConfigInput();
            splitName = this.buildSplitsFileName(splitsConfig);
        }
        catch {
            splitName = "splits";
        }
        saveAs(outBlob, `${splitName}.lss`);
    }
}
