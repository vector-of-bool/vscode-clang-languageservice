'use strict';

import * as path from 'path';

import * as vscode from 'vscode';
import {LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind} from 'vscode-languageclient';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const server = path.normalize(
      '/dev/clang-languageservice/build/clang-languageservice.exe');
  // context.asAbsolutePath(path.join('server', 'clang-languageservice'));
  const debugOptions = ['--debug'];
  const serverOptions: ServerOptions = {
    run: {
      command: server,
      args: [],
      options: {
        cwd: 'C:/dev/vscode-clang-languageservice'
      },
    },
    debug: {
      command: server,
      args: debugOptions,
      options: {
        cwd: 'C:/dev/vscode-clang-languageservice'
      },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: ['cpp', 'c'],
    // synchronize: {
    //   configurationSection: 'clang.server',
    // },
  };

  const client = new LanguageClient(
      'clang-languageclient', 'Clang Language Server Client', serverOptions,
      clientOptions);
  const stopper = client.start();
  console.log('Started up the clang language service');
  context.subscriptions.push(stopper);
}

// this method is called when your extension is deactivated
export function deactivate() {}