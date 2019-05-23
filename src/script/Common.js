// -------------------共通方法--------------------------

// 角度转π
const AngleToPi = 0.0174532925199433;

// π转角度
const PiToAngle = 57.2957795130823;

/**
 * 获取显示时间字符串
 * @param {时间, 单位秒} time 
 */
function GetDateStr(time){

			let minute = parseInt(time /60 % 60);
			let hour = parseInt(time / 3600);
			let second = parseInt(time % 60);

            if(hour < 10){
                hour = '0' + hour;
            }
            if(minute < 10){
                minute = '0' + minute;
            }
            if(second < 10){
                second = '0' + second;
            }

			// 剩余时间
			return hour + ':' + minute + ':' + second;
}

/**
 * 从数据表中索引Id对应数据
 * @param {数据表} dataTab 
 * @param {数据Id} id 
 */
function GetDataById(dataTab, id, type = 1){
    let result = undefined;
    dataTab.forEach((row)=>{
        if(type == 1 && parseInt(row['I16$ID']) == id){
            result = row;
        }
        if(type == 2 && parseInt(row['I16$Start']) <= id && parseInt(row['I16$End']) >= id){
            result = row;
        }
    });
    return result;
}

// 链式对象
// 被动调用
function AOP(func){
    this.funcList = [func];
    this.index = 0;
    this.isDone = true;
}
// 向前插入
AOP.prototype.beforeWithCall = function(func){
    this.funcList.splice(this.index, 0, func);
    return this;
};

// 向后插入
AOP.prototype.afterWithCall = function(func){
    this.funcList.splice(++this.index, 0, func);
    return this;
};

// 执行
AOP.prototype.do = function(){
    let call = ()=>{};
    let self = this;
    this.isDone = false;
    call = ()=>{
        if(self.funcList.length > 0){
            let top = self.funcList.shift();
            top ? top(call) : call();
        }else{
            self.isDone = true;
        }
    };
    call();
};


/**
 *  矩形碰撞检测
 * @param {位置1} x1 
 * @param {位置1} y1 
 * @param {宽度1} w1 
 * @param {高度1} h1 
 * @param {位置2} x2 
 * @param {位置2} y2 
 * @param {宽度2} w2 
 * @param {高度2} h2 
 */
function checkCollection(x1, y1, w1, h1, x2, y2, w2, h2){
    return !(x1 > x2 + w2 ||
        x2 > x1 + w1 ||
        y1 > y2 + h2 ||
        y2 > y1 + h1);
}


/**
 * 检测矩形与点是否碰撞
 * 排除边界范围
 * @param {矩形左上角位置} rectX 
 * @param {矩形左上角位置} rectY 
 * @param {矩形宽度} rectW 
 * @param {矩形高度} rectH 
 * @param {点位置} pX 
 * @param {点位置} pY 
 */
function checkRectAndPoint(rectX, rectY, rectW, rectH, pX, pY){
    return !(rectX > pX ||
        rectX + rectW < pX ||
        rectY > pY ||
        rectY + rectH < pY);
}

// 深度拷贝
function deepCopy(source) { 
    var result={};
    for (var key in source) {
        result[key] = typeof source[key]==='object'? deepCoyp(source[key]): source[key];
    } 
    return result; 
}

/**
 * 计算两点距离
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 */
function getPosDistance(x1, y1, x2, y2){
    let xSub = x1 - x2;
    let ySub = y1 - y2;
    return Math.sqrt(xSub * xSub + ySub * ySub);
}


/**
 * 获取水平检测线
 * @param {旋转角度} rotation 
 */
function getHorizonalTestLine(rotation){
    let angle = rotation * AngleToPi;
    return {x: Math.cos(angle), y: Math.sin(angle)};
}

/**
 * 获取垂直检测线
 * @param {旋转角度} rotation 
 */
function getVerticalTestLine(rotation){
    let angle = rotation * AngleToPi;
    return {x: Math.sin(angle), y: Math.cos(angle)};
}

/**
 * 求矩形两个对角线向量
 * @param {旋转角度} rotation 
 * @param {宽度} w 
 * @param {高度} h 
 */
function getRectDiagonal(rotation, w, h){
    let angle = rotation * AngleToPi;
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return {0: {x: w * cos - h * sin, y: w * sin + h * cos},
            1: {x: -w * cos - h * sin, y: -w * sin + h * cos}};
}

/**
 * 向量点乘
 * @param {向量1} vx1 
 * @param {向量1} vy1 
 * @param {向量2} vx2 
 * @param {向量2} vy2 
 */
function dot(vx1, vy1, vx2, vy2){
    return vx1 * vx2 + vy1 * vy2;
}


/**
 * 创建AABB盒子
 * @param {点列表} posList 
 * @param {aabb列表} aabb 
 */
function createAABB(posList, aabb){
    let minX = Number.MAX_VALUE,
        minY = Number.MAX_VALUE,
        maxZ = -minX,
        maxY = -minY;
    for(let i = 0, len = posList.length; i < len; i++){
        let pos = posList[i];
        if(pos[0] < minX){
            minX = pos[0];
        }
        if(pos[0] > maxX){
            maxX = pos[0];
        }
        if(pos[1] < minY){
            minY = pos[1];
        }
        if(pos[1] > maxY){
            maxY = pos[0];
        }
    }
    aabb[0] = minX;
    aabb[1] = minY;
    aabb[2] = maxX;
    aabb[3] = maxY;
    return aabb;
}
// -------------------共通方法-------------------------

// -------------------碰撞检测-------------------------

/**
 * 圆圆碰撞
 * @param {圆1位置x} x1 
 * @param {圆1位置y} y1 
 * @param {圆1半径} r1 
 * @param {圆2位置x} x2 
 * @param {圆2位置y} y2 
 * @param {圆2半径} r2 
 */
function checkCircleAndCircle(x1, y1, r1, x2, y2, r2){
    return getPosDistance(x1, y1, x2, y2) < (r1 + r2);
}

/**
 * 圆矩形碰撞
 * @param {圆1位置x} x1 
 * @param {圆1位置y} y1 
 * @param {圆1半径} r1 
 * @param {矩形位置x} x2 
 * @param {矩形位置y} y2 
 * @param {矩形宽度} w2 
 * @param {矩形高度} h2 
 * @param {矩形角度} rotation2 
 */
function checkCircleAndRect(x1, y1, r1, x2, y2, w2, h2, rotation2){
    // 计算距离
    let posOffsetX = x1 - x2;
    let posOffsetY = y1 - y2;
    // 第一条法线
    // 求矩形横向坐标
    let axis = getHorizonalTestLine(rotation2);
    // 计算投影长度
    let dotVelue = Math.abs(dot(axis.x, axis.y, posOffsetX, posOffsetY));
    // 映射对角线到四轴上进行对比
    // 矩形对角线
    let diagonal = getRectDiagonal(rotation2, w2, h2);
    let projection1 = Math.abs(dot(axis.x, axis.y, diagonal[0].x, diagonal[0].y)) * 0.5;
    let projection2 = Math.abs(dot(axis.x, axis.y, diagonal[1].x, diagonal[1].y)) * 0.5;
    let projection3 = r1;
    
    projection1 = projection1 > projection2 ? projection1 : projection2;

    // 实际距离小于影射距离, 未碰撞
    if(projection1 + projection3 <= dotVelue){
        return false;
    }
    // 第二条法线
    axis = getVerticalTestLine(rotation2);
    // 计算投影长度
    dotVelue = Math.abs(dot(axis.x, axis.y, posOffsetX, posOffsetY));
    // 映射对角线到四轴上进行对比
    projection1 = Math.abs(dot(axis.x, axis.y, diagonal[0].x, diagonal[0].y)) * 0.5;
    projection2 = Math.abs(dot(axis.x, axis.y, diagonal[1].x, diagonal[1].y)) * 0.5;
    
    projection1 = projection1 > projection2 ? projection1 : projection2;

    // 实际距离小于影射距离, 未碰撞
    if(projection1 + projection3 <= dotVelue){
        return false;
    }
    return true;
}

/**
 * 检测矩形碰撞
 * @param {矩形1位置} x1 
 * @param {矩形1位置} y1 
 * @param {矩形1宽度} w1 
 * @param {矩形1高度} h1 
 * @param {矩形1角度} r1 
 * @param {矩形2位置} x2 
 * @param {矩形2位置} y2 
 * @param {矩形2宽度} w2 
 * @param {矩形2高度} h2 
 * @param {矩形2角度} r2 
 */
function checkRectAndRect(x1, y1, w1, h1, r1, x2, y2, w2, h2, r2){
    // 如果转向角度都为0, 则简单检测, 否则投影检测
    if(r1 == 0 && r2 == 0){
        return checkCollection(x1, y1, w1, h1, x2, y2, w2, h2);
    }else{
        // 建立投影, 法线上任意两条投影不重合, 说明不相交
        let axisArray = [
            getHorizonalTestLine(r1),
            getVerticalTestLine(r1),
            getHorizonalTestLine(r2),
            getVerticalTestLine(r2)
        ];
        let diagonal1 = getRectDiagonal(r1, w1, h1);
        let diagonal2 = getRectDiagonal(r2, w2, h2);

        let posOffsetX = x1 - x2;
        let posOffsetY = y1 - y2;
        for(let i = 0, len = axisArray.length; i < len; i++){
            let axis = axisArray[i];
            let dot = Math.abs(dot(axis.x, axis.y, posOffsetX, posOffsetY));
            // 影射对角线到轴上
            let projection1 = Math.abs(dot(axis.x, axis.y, diagonal1[0].x, diagonal1[0].y));
            let projection2 = Math.abs(dot(axis.x, axis.y, diagonal1[1].x, diagonal1[1].y));
            let projection3 = Math.abs(dot(axis.x, axis.y, diagonal2[0].x, diagonal2[0].y));
            let projection4 = Math.abs(dot(axis.x, axis.y, diagonal2[1].x, diagonal2[1].y));

            projection1 = projection1 > projection2 ? projection1 : projection2;
            projection3 = projection3 > projection4 ? projection3 : projection4;

            if(projection1 + projection3 <= dot){
                return false;
            }
        }
        return true;
    }
}

/**
 * 检查圆与线碰撞
 * @param {圆位置} x 
 * @param {圆位置} y 
 * @param {圆半径} r 
 * @param {线点1} lX 
 * @param {线点2} lY 
 */
function checkCircleAndLine(x, y, r, lX1, lY1, lX2, lY2){
    // 线长度
    let subLineX = lX2 - lX1;
    let subLineY = lY2 - lY1;
    let lineLen = Math.sqrt(subLineX * subLineX + subLineY * subLineY);
    let lineToCircleCenterX = x - lX1;
    let lineToCircleCenterY = y - lY1;
    // let lineToCicleCenterLen = Math.sqrt(lineToCircleCenterX * lineToCircleCenterX + lineToCircleCenterY * lineToCircleCenterY);
    let lineDirNormalX = subLineX / lineLen;
    let lineDirNormalY = subLineY / lineLen;
    // 计算圆心到线点1映射到线段方向的长度
    let porjectionToLine = dot(lineToCircleCenterX, lineToCircleCenterY, lineDirNormalX, lineDirNormalY);

    let nearestX = lX1 + lineDirNormalX * porjectionToLine;
    let nearestY = lY1 + lineDirNormalY * porjectionToLine;

    let subNearestX = x - nearestX;
    let subNearestY = y - nearestY;
    
    return [Math.sqrt(subNearestX * subNearestX + subNearestY * subNearestY) <= r, nearestX, nearestY];
}

/**
 * 检测圆与点碰撞
 * @param {圆位置} x 
 * @param {圆位置} y 
 * @param {圆半径} r 
 * @param {点} pX 
 * @param {点} pY 
 */
function checkCircleAndPoint(x, y, r, pX, pY){
    let subX = pX - x;
    let subY = pY - y;
    return Math.sqrt(subX * subX + subY * subY) <= r;
}
// -------------------碰撞检测-------------------------
// -------------------动画播放-------------------------
/**
 * 移动动画
 * @param {被移动物体} obj 
 * @param {起始位置} fromx 
 * @param {起始位置} fromy 
 * @param {目标位置} tox 
 * @param {目标位置} toy 
 * @param {速度} speed 
 * @param {结束事件} callback 
 */
function DoTween(obj, fromx, fromy, tox, toy, speed, callback){
    // 创建AOP
    this.aop = new AOP((call)=>{
        obj.x = fromx;
        obj.y = fromy;
        let self = this;
        let subX = tox - fromx;
        let subY = toy - fromy;
        // 总长
        let allPathLen = Math.sqrt(subX * subX + subY * subY);
        // 总时
        let allTime = allPathLen / speed;
        if(allTime == 0){
            allTime = 1;
        }
        let xSpeed = subX / allTime;
        let ySpeed = subY / allTime;

        let frame = undefined;
        frame = ()=>{
            obj.x += xSpeed;
            obj.y += ySpeed;
            // 判断是否到达
            let nowSubX = tox - obj.x;
            let nowSubY = toy - obj.y;
            let dis = Math.sqrt(nowSubX * nowSubX + nowSubY * nowSubY);
            // 判断距离 判断正负
            if(dis < 1 || subX * nowSubX < 0 || subY * nowSubY < 0){
                // 结束
                Laya.timer.clear(self, frame);
                call();
                if(callback){
                    callback();
                }
            }

        };
        // 逐帧执行
        Laya.timer.loop(ANIMA_DELAY, self, frame);
    });
    return this;
}
 
// 链式执行下一项
DoTween.prototype.next = function(obj, fromx, fromy, tox, toy, speed, callback){
    this.aop.afterWithCall((call)=>{
        obj.x = fromx;
        obj.y = fromy;
        let subX = tox - fromx;
        let subY = toy - fromy;
        // 总长
        let allPathLen = Math.sqrt(subX * subX + subY * subY);
        // 总时
        let allTime = allPathLen / speed;
        let xSpeed = subX / allTime;
        let ySpeed = subY / allTime;

        this.frame = undefined;
        this.frame = ()=>{
            obj.x += xSpeed;
            obj.y += ySpeed;
            // 判断是否到达
            let nowSubX = tox - obj.x;
            let nowSubY = toy - obj.y;
            let dis = Math.sqrt(nowSubX * nowSubX + nowSubY * nowSubY);
            // 判断距离 判断正负
            if(dis < 1 || subX * nowSubX < 0 || subY * nowSubY < 0){
                // 结束
                Laya.timer.clear(this, this.frame);
                call();
                if(callback){
                    callback();
                }
            }

        };
        // 逐帧执行
        Laya.timer.loop(ANIMA_DELAY, this, this.frame);
    });
    return this;
};

// 停止动画
DoTween.prototype.stop = function(){
    if(this.frame){
        Laya.timer.clear(this, this.frame);
    }
};

// 是否执行完毕
DoTween.prototype.isDone = function(){
    return this.aop.isDone;
};

// 执行动画
DoTween.prototype.do = function(){
    this.aop.do();
}
// -------------------动画播放--------------------------
// -------------------数据管理--------------------------

// function UserDataManager(){
//     this.onDataChengeEvents = [];
// }
// let userDataManagerProto = UserDataManager.prototype;

// // 初始化数据
// userDataManagerProto.initData = function(data){
//     this.data = data;
// };

// // 数据变化
// userDataManagerProto.dataChange = function(changeData){
//     RefreshData(this.data, changeData);
//     this.onDataChange(this.data);
// };

// // 数据变化事件
// userDataManagerProto.onDataChange = function(){
//     for(let key in this.onDataChengeEvents){
//         this.onDataChengeEvents[key](this.data);
//     }
// };

// // 添加数据变更事件
// userDataManagerProto.addDataChangeEvent = function(event){
//     if(event){
//         this.onDataChengeEvents.push(event);
//     }
// };

// // 清理数据变更事件
// userDataManagerProto.clearDataChangeEvent = function(){
//     this.onDataChengeEvents = [];
// };

// // 数据管理单例
// var UserDataManagerSingle = new UserDataManager();

// -------------------数据管理--------------------------

// ----------------------UI管理------------------------

function UIManager(){
    this.uiDic = {};
}

let uiManagerProto = UIManager.prototype;

// 注册UI
uiManagerProto.regUI = function(name, ui){
    this.uiDic[name] = ui;
};

// 获取ui
uiManagerProto.getUI = function(name){
    return this.uiDic[name];
};

// 清空UI
uiManagerProto.clear = function(){
    this.uiDic = {};
};

// UI管理器单例
var UIManagerSingle = new UIManager();

// ----------------------UI管理------------------------

// -------------------网络请求--------------------------
// function GameNet(){
    
// }
// var proto = GameNet.prototype;

// // 初始化
// proto.init = function(){
//     this.httpRequest = new Laya.HttpRequest();
// }

// // 设置参数
// proto.setParam = function(url, openId, timeout = 3000, connetType = 'get', dataType = 'text'){
//     this.url = url;
//     this.timeout = timeout;
//     this.connetType = connetType;
//     this.dataType = dataType;
//     this.isSetParam = true;
//     this.openId = openId;
// };

// // 默认参数发送
// proto.send = function(op, data, completeCallback, param){
//     if(this.isSetParam){
//         this.httpRequest.http.timeout = this.timeout;
//         this.httpRequest.once(Laya.Event.COMPLETE, this, (...param)=>{
//             console.log(param);
//             let dataStr = param[param.length - 1];
//             var reg = new RegExp("u'","g");
//             dataStr = dataStr.replace(reg, "'");
// 			let jsonData = JSON.parse( dataStr);
// 			let {isOk, info} = ErrorCodeManagerSingle.check(jsonData.retCode);
// 			if(!isOk){
// 				// msg显示错误
// 				let msg = new Msg();
// 				msg.init(info);
// 				msg.show();
// 			}else{
//                 if(jsonData['change']){
//                     UserDataManagerSingle.dataChange(jsonData['change']);
//                 }
//                 completeCallback(...param, jsonData);
//             }
//         }, param);
//         this.httpRequest.once(Laya.Event.ERROR, this, this.errorCallback, param);
//         let targetUrl = this.url + op + '?data=' + JSON.stringify(data) + '&key=' + KEY + '&ssk=' + this.openId;
//         this.httpRequest.send(targetUrl, null, this.connetType, this.dataType);
//         console.log(targetUrl);
//     }else{
//         console.error('参数未初始化!');
//     }
// };

// // 错误回调
// proto.errorCallback = function(data){
//     console.error('errorCallback' + data);
//     // 重新请求
//     // 请求失败
// };

// // 游戏网络类单例
// var GameNetSingle = new GameNet();

// -------------------网络请求--------------------------

// -------------------微信小程序更新-------------------
// if("undefined" != typeof(wx)){
//     const updateManager = wx.getUpdateManager();
//     updateManager.onCheckForUpdate(function (res) {
//         // 请求完新版本信息的回调
//         console.log(res.hasUpdate)
//     });

//     updateManager.onUpdateReady(function () {
//         wx.showModal({
//             title: '更新提示',
//             content: '新版本已经准备好，是否重启应用？',
//             success(res) {
//                 if (res.confirm) {
//                     // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
//                     updateManager.applyUpdate();
//                 }
//             }
//         });
//     });

//     updateManager.onUpdateFailed(function () {
//         // 新版本下载失败
//     });
// }else{
//     console.log('非微信环境');
// }
// -------------------微信小程序更新-------------------
// -------------------微信头像获取器-------------------
// // 头像缓存
// var headCache = {};
// // 测试头像url
// var testHead = 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKQXyE1d7SU7ibwceruzTENE54C9nIJ9621RFH53X5Ekk7YicNLTzJLwGfpYcwjzj89ianiawvzzaXm2A/132';
// /**
//  * 微信头像获取器
//  * @param {头像Url} headUrl 
//  * @param {显示头像Img} showImg 
//  */
// function getWXHead(headUrl, showImg){
//     if(headUrl == 'testHead'){
//         return;
//     }
//     if(headCache[headUrl] != undefined){
//         showImg.skin = (headCache[headUrl]);
//     }else{
//         // 创建请求
//         let httpRequest = new Laya.HttpRequest();
//         httpRequest.once(Laya.Event.COMPLETE, this, (data)=>{
//             let byte = new Laya.Byte(data);
//             byte.writeArrayBuffer(data, 4);
//             let blob = new Laya.Browser.window.Blob([data], {type:'image/apng'});
//             let url = Laya.Browser.window.URL.createObjectURL(blob);
//             showImg.skin = (url);
//             // 缓存
//             headCache[headUrl] = url;
//         });
//         httpRequest.once(Laya.Event.ERROR, this, (data)=>{
//             // 输出错误
//             console.error(data);
//         });
//         // 发送请求
//         httpRequest.send(headUrl, '', 'get', 'arraybuffer');
//     }
// }
// -------------------微信头像获取器-------------------
