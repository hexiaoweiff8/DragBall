var Loader = laya.net.Loader;
var Handler = laya.utils.Handler;
var WebGL = laya.webgl.WebGL;
var Pool = laya.utils.Pool;
var Matter = window.Matter;
var Stage = Laya.Stage;
var Render = Laya.Render;


// Laya初始化
Laya.init(BG_WIDTH, BG_HEIGHT);
// 设置适配模式
// Laya.stage.scaleMode = 'exactfit';
// 设置居中对齐
Laya.stage.alignH = 'center';
// 设置横屏
Laya.stage.screenMode = 'none';
// 设置分辨率
// Laya.stage.scaleMode = 'showall';

// 加载资源列表
var asset = [];
asset.push(
    {
        url:["res/atlas/comp.atlas"],
        type: Laya.Loader.ATLAS
    }
);

//激活资源版本控制
Laya.ResourceVersion.enable("version.json", Handler.create(null, beginLoad), Laya.ResourceVersion.FILENAME_VERSION);

/**
 * 开始加载
 */
function beginLoad(){
    
    // 加载图集
	Laya.loader.load(asset, Handler.create(null, onLoaded), Handler.create(this, onLoading, null, false));
}

/**
 * 加载完毕
 */
function onLoaded()
{
    console.log('onLoaded ');
	let game = new Game();
	game.init();
	game.show();
}

/**
 *  加载中
 * @param {加载进度} progress 
 */
function onLoading(progress){
    console.log(progress);
}
