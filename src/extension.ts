/**
 * @Author: JanKinCai
 * @Date:   2020-01-03 22:02:02
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2020-01-03 22:33:20
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { SSL_OP_ALL } from 'constants';
// import { URL } from 'url';
import * as fs from 'fs';
import * as moment from 'moment';
// import { print } from 'util';


var template = require("art-template");
var path = require("path");


const header_max_line: number = 10;


// Suffix ---> Template name
const file_suffix_mapping: any = {
    ".as": "ActionScript",
    ".scpt": "AppleScript",
    ".asp": "ASP",
    ".aspx": "ASP",
    ".bat": "Batch File",
    ".cmd": "Batch File",
    ".c": "C",
    ".cs": "C#",
    ".cpp": "C++",
    ".clj": "Clojure",
    ".css": "CSS",
    ".D": "D",
    ".erl": "Erlang",
    ".go": "Go",
    ".groovy": "Groovy",
    ".hs": "Haskell",
    ".htm": "HTML",
    ".html": "HTML",
    ".java": "Java",
    ".js": "JavaScript",
    ".tex": "LaTeX",
    ".lsp": "Lisp",
    ".lua": "Lua",
    ".md": "Markdown",
    ".mat": "Matlab",
    ".m": "Objective-C",
    ".ml": "OCaml",
    ".p": "Pascal",
    ".pl": "Perl",
    ".php": "PHP",
    ".py": "Python",
	".r": "R",
	".rs": "Rust",
    ".rst": "RestructuredText",
    ".rb": "Ruby",
    ".scala": "Scala",
    ".scss": "SCSS",
    ".sh": "ShellScript",
    ".sql": "SQL",
    ".tcl": "TCL",
	".txt": "Text",
	".ts": "TypeScript",
	".vue": "Vue",
	".xml": "XML",
	".yml": "YAML",
	".yaml": "YAML"
};


/**
 * getConfig
 *
 * @return any
 */
function getConfig(): any {
	return vscode.workspace.getConfiguration("fileheader");
}


/**
 * getPathObject
 *
 * @param editor(any): editText object.
 * 
 * @return any
 */
function getPathObject(editor: any): any {
	/*
	 * root
	 * dir
	 * base
	 * ext
	 * name
	 */
	return path.parse(editor.document.fileName);
}


/**
 * isSuffix
 *
 * @param editor(any): editText object.
 * @param suffix(string): File suffix name, eg: `.php`,
 * 
 * @return boolean
 */
function isSuffix(editor: any, suffix: string): boolean {
	return getPathObject(editor).ext.lastIndexOf(suffix) !== -1;
}


/**
 * isSuffixList
 *
 * @param editor(any): editText object.
 * @param suffixs(any): File suffix name list, eg: [`.php`],
 * 
 * @return boolean
 */
function isSuffixList(editor: any, suffixs: any): boolean {
	return suffixs.indexOf(getPathObject(editor).ext) !== -1;
}


/**
 * getActivePath
 *
 * @param editor(any): editText object.
 * 
 * @return string
 */
function getActivePath(editor: any): string {
	return getPathObject(editor).dir;
}


/**
 * getSuffix
 *
 * @param editor(any): editText object.
 * 
 * @return string
 */
function getSuffix(editor: any): string {
	let pathobj:any = path.parse(editor.document.fileName);

	return pathobj.ext.toLowerCase() || pathobj.name.toLowerCase();
}


/**
 * getFileName
 *
 * @param editor(any): editText object.
 * 
 * @return string
 */
function getFileName(editor: any): string {
	return path.parse(editor.document.fileName).name.toLowerCase();
}


/**
 * Match line
 *
 * @param editor(any): editText object.
 * @param value(string): Match value.
 * @param max_line(number): Match max line.
 * 
 * @return number: Not match line return -1
 */
function matchLine(editor: any, value: string, max_line: number=header_max_line): number {
	let document: any = editor.document;
	let lineCount: number = document.lineCount;
	let i: number = 0;

	if(lineCount > max_line){
		lineCount = max_line;
	}

	for(i = 0; i <= lineCount - 1; i++){
		if (document.lineAt(i).text.indexOf(value) !== -1){
			return i;
		}
	}

	return -1;
}


/**
 * Delete edittext comment
 *
 * @param editor(any): editText object.
 * @param value(string): Match value.
 * @param max_line(number): Match max line.
 * 
 * @return void
 */
function deleteEditorComment(editor: any, value: string, max_line: number=header_max_line): void {
	let line: number = matchLine(editor, value, max_line);

	if(line !== -1){
		editor.edit((editobj: any) => {
			editobj.delete(new vscode.Range(line, 0, line, value.length));
		});
	}
}


/**
 * deleteEditorComments
 *
 * @param editor(any): editText object.
 * 
 * @return void
 */
function deleteEditorComments(editor: any): void {
	if(isSuffix(editor, ".php")){
		deleteEditorComment(editor, "<?php", 2);
	}else if(isSuffixList(editor, [".py", ".pxd", ".pyx"])){
		deleteEditorComment(editor, "# -*- coding: utf-8 -*-", 1);
	}
}


/**
 * Insert End Comment
 *
 * @param editor(any): editText object.
 * @param value(string): Insert value.
 * @param line(number): End line.
 * 
 * @return void
 */
function insertEndComment(editor: any, value: string, line: number): void {
	editor.edit((editobj: any) => {
		editobj.delete(new vscode.Range(line, 0, line, value.length));
	});
}


/**
 * Insert End Comments
 * 
 * @param editor(any): editText object.
 * @param config(any): VScode config.
 * 
 * @return void
 */
function insertEndComments(editor: any, config: any): void {
	let lineCount: number = editor.document.lineCount;

	if(config.body && lineCount <= 1){
		if(isSuffix(editor, ".php")){
			insertEndComment(editor, "?>", lineCount + 1);
		}
	}
}


/**
 * deleteEditorComments
 *
 * @param editor(any): editText object.
 * @param ignore(string[]): Filter rules.
 * 
 * @return boolean
 */
function isIgnore(editor: any, ignore: string[]): boolean {
	let pathobj: any = getPathObject(editor);

	for(let ige of ignore){
		let reg: any = new RegExp(ige.replace("*", ".*"));

		if(reg.test(pathobj.base) || reg.test(path.join(pathobj.dir, pathobj.base))){
			return false;
		}

	}

	return true;
}


/**
 * getDateTime
 *
 * @param fmt(string): DateTime format, default ``YYYY-MM-DD HH:mm:ss``.
 * 
 * @return string
 */
function getDateTime(fmt: string="YYYY-MM-DD HH:mm:ss"): string {
	return moment().format(fmt);
}


/**
 * getDefaultTemplate
 * 
 * @return string
 */
function getDefaultTemplate(): string {
	return path.join(path.dirname(__dirname), "template");
}


/**
 * Judge if the head exists
 * 
 * @param editor(any): editText object.
 * 
 * @return boolean: Judge if the head exists.
 */
function isHeaderExists(editor: any): boolean {
	if(matchLine(editor, "Author:") !== -1 && matchLine(editor, "Last Modified by:") !== -1){
		return true;
	}

	return false;
}


/**
 * Get template
 * 
 * @param editor(any): editText object.
 * @param config(any): VScode config.
 * @param tmplpath(string): Template path, default ``""``.
 * @param type(string): body or header, default ``header``
 * 
 * @return boolean: Template path.
 */
function getTemplatePath(editor: any, config: any, tmplpath: string="", type: string="header"): string {
	let suffix: string = getSuffix(editor);
	let name: string = getFileName(editor);
	let tmpl: string = (config.file_suffix_mapping[name + suffix] || config.file_suffix_mapping[suffix] || file_suffix_mapping[suffix]) + ".tmpl";

	return path.join(tmplpath || config.custom_template_path , type, tmpl);
}


/**
 * openTemplate
 * 
 * @param editor(any): editText object.
 * @param config(any): VScode config.
 * @param type(string): body or header, default ``header``
 * @param callback(any): Callback.
 * 
 * @return void
 */
function openTemplate(editor: any, config: any, type: string="header", callback: any): void {
	let tmpl_path: string = getTemplatePath(editor, config, "", type);

	fs.exists(tmpl_path, (exists) => {
		if(exists){
			// Custom template
			vscode.workspace.fs.readFile(vscode.Uri.file(tmpl_path)).then(s => {
				callback(s);
			});
		}else{
			// Default template
			tmpl_path = getTemplatePath(editor, config, getDefaultTemplate(), type);
			fs.exists(tmpl_path, (exists) => {
				if(exists){
					vscode.workspace.fs.readFile(vscode.Uri.file(tmpl_path)).then(s => {
						callback(s);
					});	
				}else{
					// callback("");
					console.log("Not found fileheader template: " + tmpl_path);
				}
			});		
		}
	});
}


/**
 * updateHeader
 * 
 * @param editor(any): editText object.
 * @param config(any): VScode config.
 * 
 * @return void
 */
function updateHeader(editor: any, config: any): void {
	editor.edit((editobj: any) => {
		let line: number = matchLine(editor, "Last Modified time:", 8);
		let start: number = editor.document.lineAt(line).text.indexOf(":") + 1;
		editobj.replace(new vscode.Range(line, start, line, 100), " " + getDateTime());

		line = matchLine(editor, "@Last Modified by:", 8);
		start = editor.document.lineAt(line).text.indexOf(":") + 1;
		editobj.replace(new vscode.Range(line, start, line, 100), "   " + config.author);
	});

	if (vscode.version < "1.43.0") {
		editor.document.save();	
	}
}


/**
 * insertHeaderBody
 * 
 * @param editor(any): editText object.
 * @param config(any): VScode config.
 * 
 * @return void
 */
function insertHeaderBody(editor: any, config: any): void {
	let lineCount: number = editor.document.lineCount;

	// Delete comment
	deleteEditorComments(editor);

	openTemplate(editor, config, "header", (s:any) => {
		let date: string = getDateTime();
		let ret: any = template.render(s.toString(), Object.assign(
			{
				author: config.author,
				create_time: date,
				last_modified_by: config.author,
				last_modified_time: date,
			},
			config.other_config
		));

		if(lineCount <= 1){
			openTemplate(editor, config, "body", (s:any) => {
				ret += s.toString() + "\r\n";

				editor.edit((editobj:any) => {
					editobj.insert(new vscode.Position(0, 0), ret);
				});

				editor.document.save();
			});
		}else{
			editor.edit((editobj:any) => {
				editobj.insert(new vscode.Position(0, 0), ret);
			});

			editor.document.save();					
		}
	});

	// Insert End Comment
	insertEndComments(editor, config);
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscodefileheader" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.fileheader', () => {
		// The code you place here will be executed every time your command is executed
		let config: any = getConfig();
		let editor: any = vscode.window.activeTextEditor;

		if(!isHeaderExists(editor)){
			insertHeaderBody(editor, config);
		}
	});

	context.subscriptions.push(disposable);


	// Save
	vscode.workspace.onWillSaveTextDocument(() =>{
		let config: any = getConfig();
		let editor: any = vscode.window.activeTextEditor;

		// Update Header
		if(isHeaderExists(editor)){
			updateHeader(editor, config);
		}else if(config.save && isIgnore(editor, config.ignore)){
			insertHeaderBody(editor, config);
		}
	});


	// Open
	vscode.workspace.onDidOpenTextDocument(() => {
		let config: any = getConfig();
		let editor: any = vscode.window.activeTextEditor;

		if(config.open && !isHeaderExists(editor) && isIgnore(editor, config.ignore)){
			insertHeaderBody(editor, config);
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
