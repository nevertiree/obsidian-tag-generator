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

		// 这里会在左边的 Ribbon 栏创建一个新的按钮. This creates an icon in the left ribbon.
		// 第一个是图标名，官方内置的图标集：[Lucide](https://lucide.dev/) 或者社区分享的列表： [Discord](https://discord.com/channels/686053708261228577/840286264964022302/968248588641665075)
		// 第二个是当你鼠标悬浮在图标上的时候显示的名称，这里是 Sample Plugin 
		// 第三个则是调用的函数，一般来说，你也可以考虑直接在里面更改这个 new Notice(...) 为其它的函数 
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// 这里是在状态栏上添加内容和设置对应的文本。
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		// 这个会创建一个在 Obsidian 中任意地方都可以触发的命令
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new TagGeneratorModal(this.app).open();
			}
		});

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

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// 用来限定某一个命令是否能在当前环境中启动，例如上述的编辑器命令，如果当前采用的不是编辑模式的话，可以让它返回不可启动等。
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				// 判断条件，获取当前 this.app (注意，在 0.14.6 版本后，你可以不加上 this 也能获取到我们的 app)，
				// 也即可以直接采用 app.workspace 来获取当前的 Workspace 
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new TagGeneratorModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TagGeneratorSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// 用来注册 DOM 监控事件
		// 如果你用这个方案，当插件被关闭的时候可以自动去除这个事件监控。
		// document 指的是监控对象，就是 Obsidian 本体的视图层
		// click 指的是点击行为，其它可以监控的方法包括：[EventTarget.addEventListener() - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
		// 后续又是一个熟悉的调用函数、执行方法
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// 下方则是注册一个定时器，用来定时执行某些函数，当关闭插件的时候也会自动注销掉。
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class TagGeneratorSettingTab extends PluginSettingTab {
	plugin: TagGenerator;

	constructor(app: App, plugin: TagGenerator) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.tagGeneratorSetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.tagGeneratorSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
