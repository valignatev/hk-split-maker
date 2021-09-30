export interface CategoryDefinition {
    fileName: string;
    displayName: string;
    routeNotesURL?: string;
}
declare const splits: Record<string, Array<CategoryDefinition>>;
export default splits;
