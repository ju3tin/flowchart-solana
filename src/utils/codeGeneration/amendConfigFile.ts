import { fileApi } from "@/api/fileApi";
import { pollTaskStatus2, pollTaskStatus3 } from "@/utils/task/taskUtils";

export const amendConfigFile = async (
  projectId: string,
  fileName: string,
  filePath: string,
): Promise<{ status: string, taskId: string }> => {
  const contentResponse = await fileApi.getFileContent(projectId, filePath);
  const contentResult = await pollTaskStatus2(contentResponse.taskId);

  let updatedToml = contentResult;

  if (fileName === 'Cargo.toml') {
    const lines = contentResult.split('\n');

    const dependenciesStartIndex = lines.findIndex(
      (line: string) => line.trim() === '[dependencies]'
    );

    if (dependenciesStartIndex !== -1) {
      const updatedLines = lines.filter((line: string, idx: number) => {
        if (idx <= dependenciesStartIndex) return true;
        const trimmed = line.trim();
        return (
          !trimmed.startsWith('anchor-lang') &&
          !trimmed.startsWith('anchor-spl')
        );
      });
      updatedLines.splice(
        dependenciesStartIndex + 1,
        0,
        'anchor-spl = "0.30.1"'
      );
      updatedLines.splice(
        dependenciesStartIndex + 1,
        0,
        'anchor-lang = { version = "0.30.1", features = ["init-if-needed"] }'
      );

      updatedToml = updatedLines.join('\n');
    }
  }

  if (fileName === 'Anchor.toml') {
    let lines = contentResult.split('\n');

    lines = lines.map((line: string) => {
      if (line.trim() === '[programs.localnet]') {
        return '[programs.devnet]';
      }
      return line;
    });

    let providerStart = -1;
    let providerEnd = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '[provider]') {
        providerStart = i;
        break;
      }
    }

    if (providerStart !== -1) {
      for (let j = providerStart + 1; j < lines.length; j++) {
        if (/\[.*\]/.test(lines[j].trim())) {
          providerEnd = j;
          break;
        }
      }

      let foundClusterLine = false;

      for (let k = providerStart + 1; k < providerEnd; k++) {
        const trimmed = lines[k].trim();
        if (trimmed.startsWith('cluster =')) {
          lines[k] = `cluster = "Devnet"`;
          foundClusterLine = true;
        }
      }

      if (!foundClusterLine) {
        lines.splice(providerStart + 1, 0, `cluster = "Devnet"`);
        providerEnd++;
      }

    } else {
      lines.push('');
      lines.push('[provider]');
      lines.push(`cluster = "Devnet"`);
      lines.push('');
    }

    updatedToml = lines.join('\n');
  }

  const updateResponse = await fileApi.updateFile(projectId, filePath, updatedToml);
  const result = await pollTaskStatus3(updateResponse.taskId);

  return { status: result.task.status, taskId: updateResponse.taskId };
};
  