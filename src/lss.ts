import xml from "xml";
import { parseSplitsDefinitions } from "./splits";

export interface Config {
    splitIds: Array<string>;
    ordered: true;
    endTriggeringAutosplit: true;
    categoryName: string;
    gameName: string;
    variables?: {
        platform?: string;
        patch?: string;
    };
}

function boolRepr(bool: boolean): string {
    return bool ? "True" : "False";
}

function getSegmentNode(name: string): xml.XmlObject {
    return { Segment: [
        { Name: name, },
        { Icon: "", },
        { SplitTimes: [
            { SplitTime: { _attr: { name: "Personal Best", }, }, }
        ], },
        { BestSegmentTime: "", },
        { SegmentHistory: "", }
    ], };
}

function getVariableNode(name: string, value: string): xml.XmlObject {
    return {
        Variable: [
            { _attr: { name, }, },
            value
        ],
    };
}

function getVariablesNode(config: Config): xml.XmlObject {
    const glitchAttrName = `${config.categoryName} Glitch`;
    const glitchVarNode = getVariableNode(glitchAttrName, "No Major Glitches");

    const variablesNode = {
        Variables: [
            glitchVarNode
        ],
    };

    if (config.variables?.patch) {
        variablesNode.Variables.push(
            getVariableNode("Patch", config.variables.patch)
        );
    }

    return variablesNode;
}

function getMetadataNode(config: Config): xml.XmlObject {
    const platformAttr = { _attr: { usesEmulator: boolRepr(false), }, };
    const platformNode = config.variables?.platform ?
        { Platform: [ platformAttr, config.variables.platform ], } :
        { Platform: platformAttr, };


    return { Metadata: [
        { Run: { _attr: { id: "", }, }, },
        platformNode,
        getVariablesNode(config)
    ], };
}

export async function createSplitsXml(config: Config): Promise<string> {
    const {
        splitIds,
        ordered,
        endTriggeringAutosplit,
        categoryName,
        gameName,
    } = config;

    const splitDefinitions = await parseSplitsDefinitions();

    const segments = splitIds.map(splitId => {
        const splitDefinition = splitDefinitions.get(splitId);
        if (!splitDefinition) {
            throw new Error(`Failed to find a definition for split id ${splitId}`);
        }
        return getSegmentNode(splitDefinition.name);
    });
    const autosplits = splitIds.map(Split => ({ Split, }));
    return xml({
        Run: [
            { _attr: { version: "1.7.0", }, },
            { GameIcon: "", },
            { GameName: gameName, },
            { CategoryName: categoryName, },
            getMetadataNode(config),
            { Offset: "00:00:00", },
            { AttemptCount: "0", },
            { AttemptHistory: "", },
            { Segments: segments, },
            { AutoSplitterSettings: [
                { Ordered: boolRepr(ordered), },
                { AutosplitEndRuns: boolRepr(endTriggeringAutosplit), },
                { Splits: autosplits, }
            ], }
        ],
    }, {
        declaration: true,
        indent: "  ",
    });
}
