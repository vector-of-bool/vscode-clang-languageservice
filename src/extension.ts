'use strict';

import * as path from 'path';
import * as fs from 'fs';

import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  SettingMonitor,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient';

import * as cls from './cls';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const here = context.extensionPath;
  const server = path.join(
      here,
      path.normalize('../clang-languageservice/build/clang-languageservice'));
  // context.asAbsolutePath(path.join('server', 'clang-languageservice'));
  const debugOptions = ['--debug'];
  const serverOptions: ServerOptions = {
    run: {
      command: server,
      args: [],
      options: {
        cwd: context.extensionPath,
        stdio: 'pipe',
      },
    },
    debug: {
      command: server,
      args: debugOptions,
      options: {
        cwd: context.extensionPath,
        stdio: 'pipe',
      },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: ['cpp', 'c'],
    // outputChannelName: 'Clang LanguageService',
    // synchronize: {
    //   configurationSection: 'clang.server',
    // },
  };

  const client = new LanguageClient(
      'clang-languageserver', 'Clang Language Server Client', serverOptions,
      clientOptions);
  const stopper = client.start();

  cls.setupClient(client);

  interface GetCompilationInfoRequest {
    uri: string
  };
  // client.onRequest<
  //       cls.GetCompilationInfoParams,
  //       cls.GetCompilationInfoResult,
  //       null>(
  //     {method: 'vob/cls/getCompilationInfo'},
      // (req: cls.GetCompilationInfoParams): Thenable<cls.GetCompilationInfoResult> => {
      //   // const uri = vscode.Uri.parse(req.uri);
      //   // return CompilationDatabase.fromCMakeTools().then(db => {
      //   //   return {info: !db ? db : db.getCompilationInfoForUri(uri)};
      //   // });
      // }
      // );
  console.log('Started up the clang language service');
  context.subscriptions.push(stopper);
}

// this method is called when your extension is deactivated
export function deactivate() {}