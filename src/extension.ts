'use strict';

import * as path from 'path';
import * as fs from 'fs';

import * as vscode from 'vscode';
import {LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind} from 'vscode-languageclient';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const server = path.resolve(path.normalize('../clang-languageservice/build/clang-languageservice'));
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
    outputChannelName: 'Clang LanguageService',
    // synchronize: {
    //   configurationSection: 'clang.server',
    // },
  };

  const client = new LanguageClient(
      'clang-languageserver', 'Clang Language Server Client', serverOptions,
      clientOptions);
  const stopper = client.start();
  console.log('Started up the clang language service');
  context.subscriptions.push(stopper);
}

// this method is called when your extension is deactivated
export function deactivate() {}