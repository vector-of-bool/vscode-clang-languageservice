'use strict';

import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  SettingMonitor,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient';

import {CompilationDatabase, CompilationInfo} from './compiledb';

export interface GetCompilationInfoParams { uri: string; }

export interface CompilationInfo {
  file: string;
  command: string;
  directory: string;
}

export interface GetCompilationInfoResult {
  compilationInfo: CompilationInfo | null;
}

export function setupClient(cl: LanguageClient) {
  cl.onRequest<GetCompilationInfoParams, GetCompilationInfoResult, null>(
      {method: 'vob/cls/getCompilationInfo'},
      (req: GetCompilationInfoParams): Thenable<GetCompilationInfoResult> => {
        const uri = vscode.Uri.parse(req.uri);
        return CompilationDatabase.fromCMakeTools().then(
            (db): GetCompilationInfoResult => {
              return {
                compilationInfo: !db ? null : db.getCompilationInfoForUri(uri)
              };
            });
      });
}