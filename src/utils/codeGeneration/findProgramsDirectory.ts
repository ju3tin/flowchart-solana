import { FileTreeItemType } from "@/interfaces/FileTreeItemType";

export function findProgramsSubdirectory(tree: FileTreeItemType[]): string | null {
    const queue: FileTreeItemType[] = [...tree];
  
    while (queue.length) {
      const current = queue.shift()!;
      if (current.type === 'directory') {
        if (current.name === 'programs' && current.children) {
          const subDir = current.children.find((child: FileTreeItemType) => child.type === 'directory');
          if (subDir) {
            return subDir.path || null;
          }
          return null;
        }
        if (current.children) {
          queue.push(...current.children);
        }
      }
    }
  
    return null;
}
