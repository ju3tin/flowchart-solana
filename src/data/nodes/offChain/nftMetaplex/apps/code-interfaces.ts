export interface CodeFile {
    path: string;
    content: string;
}
  
export interface DependencyMap {
    [key: string]: string;
}
  
export interface ComponentRegistry {
    files: CodeFile[];
    dependencies: DependencyMap;
}