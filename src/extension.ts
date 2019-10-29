// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SSL_OP_ALL } from 'constants';
import { URL } from 'url';

var template = require("art-template");


const header_max_line:number = 10;


function get_suffix(obj: any):string{
	return obj.fileName.substr(obj.fileName.lastIndexOf("."));
}


function dateFormat(date:any, fmt:string):string{
	let ret:any;

    let opt:any = {
		"y+": date.getYear(),                       // 年
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
        }
	}

    return fmt;
}


// 获取行号
function get_line(editor:any, str:string):number{
	// "Last Modified time"
	let document = editor.document;
	let i:number = 0;

	for(i = 0; i <= 10; i++){
		if (document.lineAt(i).text.indexOf(str) !== -1){
			return i;
		}
	}

	return -1;
}


// 判断头部是否存在
function is_header(editor:any):boolean{
	let text:string = editor.document.getText(0, 0, header_max_line + 1, 0);

	if(text.indexOf("@Author:") !== -1 && text.indexOf("@Last Modified by:") !== -1){
		return true;
	}
	return false;
}


// 插入头部
function write_header(editor:any, config:any, path:string):void{
	let tmpl:any = vscode.Uri.file(path);

	vscode.workspace.fs.readFile(tmpl).then(s => {

		let date:string = dateFormat(new Date(), config.dateformat);
					
		let ret:string = template.render(s.toString(), {
			author: config.author,
			create_time: date,
			last_modified_by: config.author,
			last_modified_time: date,
		});
		
		editor.edit(function(editobj:any){
			editobj.insert(new vscode.Position(0, 0), ret);

		});
	});
}


// 更新头部
function update_header(editor:any, config:any):void{
	editor.edit(function(editobj:any){

		let date:string = dateFormat(new Date(), config.dateformat);
		let line:number = get_line(editor, "@Last Modified time:");
		let start:number = editor.document.lineAt(line).text.indexOf(":") + 1;

		editobj.replace(new vscode.Range(line, start, line, 100), " " + date);

		line = get_line(editor, "@Last Modified by:");
		start = editor.document.lineAt(line).text.indexOf(":") + 1;
	
		editobj.replace(new vscode.Range(line, start, line, 100), "   " + config.author);
	});

	editor.document.save();	
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

		// Display a message box to the user
	
		vscode.window.showInformationMessage('Hello World!', "a,b,c", "zz");
		vscode.window.showErrorMessage("Error", "Button1", "Button2");
		// var ss = vscode.window.activeTextEditor.document.fileName;
		// vscode.window.showInformationMessage(ss);
	});

	context.subscriptions.push(disposable);

	vscode.workspace.onWillSaveTextDocument(e => {
		// 读取配置文件
		let config:any = vscode.workspace.getConfiguration("fileheader");

		// 获取激活窗口
		let editor:any = vscode.window.activeTextEditor;
		// let line:number = editor.selection.active.line;

		let document:any = editor.document;
		// let lineCount:number = document.lineCount;

		if(is_header(editor)){
			update_header(editor, config);
		}else{
			let path:string = "home/jankincai/source/vscodefileheader/src/template/header/Python.tmpl";
			write_header(editor, config, path);	
		}

		editor.document.save();
		// console.log(process.cwd());
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}