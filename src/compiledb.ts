import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

export interface CompilationInfo {
  file: string;
  directory: string;
  command: string;
}

export interface GetCompilationDatabasePathResult {
  filepath: string | null;
  directory: string | null;
}

export class CompilationDatabase {
  private _info_by_filepath: Map<string, CompilationInfo>;
  constructor(infos: CompilationInfo[]) {
    this._info_by_filepath = infos.reduce((acc, cur) => {
      acc.set(cur.file, cur);
      return acc;
    }, new Map<string, CompilationInfo>());
  }

  private _escapeStringForRegex(str: string): string {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  private _replaceAll(str: string, needle: string, what: string) {
    return str.replace(new RegExp(this._escapeStringForRegex(needle)), what);
  }

  private _removeAllPatterns(str: string, patterns: string[]): string {
    return patterns.reduce(
        (acc, [needle]) => { return this._replaceAll(acc, needle, ''); }, str);
  }

  private _normalizeFilePath(fspath: string): string {
    return this._removeAllPatterns(fspath, [
      'source/', 'src/', 'include/', 'inc/', '.cpp', '.hpp', '.c', 'h', '.cc',
      '.hh', '.cxx', '.hxx', '.c++', '.h++', 'build/', '.m'
    ]);
  }

  public getCompilationInfoForUri(uri: vscode.Uri): CompilationInfo | null {
    const fspath = uri.fsPath;
    const plain = this._info_by_filepath.get(fspath);
    if (plain) {
      return plain;
    }
    const fsnorm = this._normalizeFilePath(fspath);
    const matching_key =
        Array.from(this._info_by_filepath.keys())
            .find(key => this._normalizeFilePath(key) == fsnorm);
    return !matching_key ? null : this._info_by_filepath.get(matching_key) !;
  }

  public static findPathFromCMakeTools(): string | null {
    const cmcon = vscode.workspace.getConfiguration('cmake');
    if (cmcon.has('buildDirectory')) {
      return path
          .join(cmcon.get<string>('buildDirectory'), 'compile_commands.json')
          .replace("${workspaceRoot}", vscode.workspace.rootPath);
    }
    return null;
  }

  public static fromCMakeTools(): Promise<CompilationDatabase | null> {
    return new Promise<CompilationDatabase | null>(resolve => {
      const cmcon = vscode.workspace.getConfiguration('cmake');
      if (cmcon.has('buildDirectory')) {
        const cmdb_json =
            path.join(
                    cmcon.get<string>('buildDirectory'),
                    'compile_commands.json')
                .replace("${workspaceRoot}", vscode.workspace.rootPath);
        fs.exists(cmdb_json, exists => {
          if (!exists) {
            resolve(null);
          } else {
            fs.readFile(cmdb_json, (err, data) => {
              if (err) {
                console.warn(
                    `Error reading file "${cmdb_json}", ${err.message}`);
                resolve(null);
              } else {
                try {
                  const content = JSON.parse(data.toString());
                  resolve(
                      new CompilationDatabase(content as CompilationInfo[]));
                } catch (e) {
                  console.warn(
                      `Error parsing compilation database "${cmdb_json}": ${e}`);
                  resolve(null);
                }
              }
            })
          }
        })
      }
    });
  }
}