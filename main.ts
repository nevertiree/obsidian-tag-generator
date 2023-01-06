// 导入你所需要的包
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

// 配置你的插件设置面板所用的参数的类型
interface TagGeneratorSettings {
	tagGeneratorSetting: string;
}

// 配置你的插件设置面板所有的参数的基础值
const DEFAULT_SETTINGS: TagGeneratorSettings = {
	tagGeneratorSetting: 'default'
}

export default class TagGenerator extends Plugin {
	// 声明公共字段
	settings: TagGeneratorSettings;

	// 基础方法，插件加载后的方法在这里定义
	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		// 这个是专门应用于编辑器内部的命令，因为 obsidian 采用的 codemirrorJS 如果你不知道怎么获取当前的 editor 的话，会胡乱执行命令的
		// 所以 licat 单独封装了这个回调，避免出现奇奇怪怪的问题。 
		this.addCommand({
			id: 'convert-text-to-hashtag-command',
			name: '把选定的文本变为HashTag标签',

			// 区别点在于这里，上边的直接是 callback ，这里则是 editorCallback 特指 Editor（编辑器）
			// 其中 editor: Editor 以及 view: MarkdownView 则是指回调函数可用的参数
			// 而 editor: Editor 这种形式是指类型限定，需要了解的可以搜索 Typescript 类型限定。
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				const currEditorStr = editor.getSelection();
				if (currEditorStr.startsWith('#')) {
					editor.replaceSelection(editor.getSelection().replace("#", ""));
				} else {
					editor.replaceSelection(' #' + editor.getSelection().trim() + ' ');
				}
			}
		});

	}

	// 基础方法，插件卸载后的方法在这里定义
	onunload() {

	}

	// 可选方法，加载你的插件设置内容
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// 可选方法，保存你的插件设置内容
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TagGeneratorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}