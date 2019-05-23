// 逻辑物理引擎, 不包含显示
var BodyType = {
    Dynamic : 1,
    Static : 2
}
// body
var Body = function(config){
    this.config = config
    this.init();
}

var bodyProto = Body.prototype;
// body的属性方法
// 初始化
bodyProto.init = function(){
    // 初始化
    // body类型
    this.bodyType =  BodyType.Dynamic;
    // 是否有效
    this.disable = false;
    // 是否暂停
    this.sleeping = false;
    this.sleepTime = 0;
    // 位置
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    // 动量, x, y, 旋转
    this.velX = 0;
    this.velY = 0;
    this.velAng = 0;
    // 加速度
    this.forceX = 0;
    this.forceY = 0;
    this.forceAng = 0;
    // 损失值
    this.damping = 0;
    this.dampingAng = 0;
    // 质量
    this.mass = 1;
    // 质量倒数
    this.invMass = 1;
    // 惯性
    this.inertia = 0;
    // 惯性倒数
    this.invInertia = 0;
    // 是否固定旋转
    this.fixedRotation = false;
    // 是否忽略重力
    this.ignoreG = false;
    // 重力方向
    this.gravityX = 0;
    this.gravityY = 0;
    // 摩擦
    this.friction = 1;
    // 弹性
    this.restitution = 0.5;
    // 物体密度
    this.density = 1;
    this.torque = 0;

    // 上次执行数值
    this.last = {};
    // // aabb范围
    // this.aabb = [0,0,0,0];

    for(let key in this.config){
        this[key] = this.config[key];
    }

    if(this.bodyType == BodyType.Static){
         this.setMass(Infinity);
    }
};

// 保存当前状态
bodyProto.saveStatus = function(){
    this.last.velX = this.velX;
    this.last.velY = this.velY;
    this.last.x = this.x;
    this.last.y = this.y;
};

// 设置质量
bodyProto.setMass = function(mass){
    // 验证
    if(!mass && mass !== 0){
        mass = this.density * this.area;
    }
    var invMass = 0;
    // 过滤
    if(mass <= 0 || mass == Infinity){
        mass = Infinity;
        invMass = 0;
        this.inertia = Infinity;
        this.invInertia = 0;
    }else{
        invMass = 1 / mass;
        this.inertia = this.mass * this.area * this.density;
        this.invInertia = 1 / this.inertia;
    }
    this.mass = mass;
    this.invMass = invMass;
};

// 设置惯性
bodyProto.setInertia = function(inertia){
    var invInertia = 0;
    if(!inertia && inertia !== 0){
        this.inertiaFactor = this.inertiaFactor || (this.mass * 2) * this.area;
        inertia = this.density * this.inertiaFactor / 12;
    }
    if(inertia <= 0 || inertia == Infinity || this.mass <= 0 | this.mass == Infinity){
        inertia = Infinity;
        invInertia = 0;
    }else{
        invInertia = 1 / inertia;
    }
    this.inertia = inertia;
    this.invInertia = invInertia;
};

// 设置位置
bodyProto.setPos = function(x, y){
    this.x = x;
    this.y = y;
    if(this.onSetPos){
        this.onSetPos(x, y);
    }
};

// 设置角度
bodyProto.setAngle = function(angle){
    this.angle = angle;
    if(this.onSetAngle){
        this.onSetAngle(angle);
    }
};

// 设置加速度
bodyProto.setForce = function(x, y){
    this.forceX = x;
    this.forceY = y;
};

// 清空当期速度
bodyProto.clearVel = function(){
    this.velX = 0;
    this.velY = 0;
};

// 设置位置事件
bodyProto.onSetPos = function(x, y){

};

// 设置角度事件
bodyProto.onSetPos = function(angle){

};

// 计算速度平方和
bodyProto.getVelSq = function(){
    return this.velX * this.velX + this.velY * this.velY;
};

// 设置冲击量
bodyProto.applyImpulse = function(x, y, point){
    if(this.bodyType != BodyType.Dynamic){
        return;
    }
    this.awake();
    // 方向速度
    this.velX += this.invMass * x;
    this.velY += this.invMass * y;
    if(point){
        // 旋转速度
        this.velAng += ((point[0] - this.x) * y - (point[1] - this.y) * x) * this.invInertia;
    }
};

// 加速度
bodyProto.applyForce = function(x, y, point){
    if(this.bodyType != BodyType.Dynamic){
        return;
    }
    this.awake();
    this.forceX += x;
    this.forceY += y;
    if(point){
        let torque = ((point[0] - this.x) * y - (point[1] - this.y) * x);
        this.torque += torque;
    }
};

// 转向加速度
bodyProto.applyTorque = function(torque){
    if(this.bodyType != BodyType.Dynamic){
        return;
    }
    this.awake();
    this.torque += torque;
};

// 速度减速
bodyProto.applyDamping = function(timeStep){
    let d = 1 - timeStep * this.damping;
    (d < 0) && (d = 0);
    (d > 1) && (d = 1);
    this.velX *= d;
    this.velY *= d;
};

// 转向减速
bodyProto.applyDampingAng = function(timeStep){
    let d = 1 - timeStep * this.damping;
    (d < 0) && (d = 0);
    (d > 1) && (d = 1);
    this.velAng *= d;
};

// 激活
bodyProto.awake = function(){
    this.sleeping = false;
    this.sleepTime = 0;
};

// 获取睡眠单位信息
bodyProto.getSleepInfo = function(){
    return {
        valAngAbs : Math.abs(this.velAng),
        velX : this.velX,
        velY : this.velY,
        vel : this.velX * this.velX + this.velY * this.velY,
        sleeping : this.sleeping,
        sleepTime : this.sleepTime
    };
};

// 单帧更新
bodyProto.update = function(){

};

// 合并计算(加速度)
bodyProto.integrate = function(timeStep){
    // 更新速度
    this.velX += (this.forceX * this.invMass) * timeStep;
    this.velY += (this.forceY * this.invMass) * timeStep;
    // 更新转向
    this.integrateAngle(timeStep);
    // 更新位置
    this.integratePos(timeStep);
};

// 计算速度
bodyProto.integrateVel = function(timeStep){
    this.velX += (this.gravityX + this.forceX * this.invMass) * timeStep;
    this.velY += (this.gravityY + this.forceY * this.invMass) * timeStep;
    if(Math.abs(this.velX) < 0.5){
        this.velX = 0;
    }
    if(Math.abs(this.velY) < 0.5){
        this.velY = 0;
    }
    if(this.damping !== 0){
        let d = Math.min(1, Math.max(0, 1 - this.damping * timeStep));
        this.velX *= d;
        this.velY *= d;
    }
};

// 计算转向速度
bodyProto.integrateVelAngle = function(timeStep){
    this.velAng += (this.torque * this.invMass) * timeStep;
    if(this.damping !== 0){
        this.velAng *= Math.min(1, Math.max(0, 1 -  this.dampingAng * timeStep));
    }
};

// 计算转向
bodyProto.integrateAngle = function(timeStep){
    this.setAngle(this.angle + this.velAng * timeStep);
};

// 计算位置
bodyProto.integratePos = function(timeStep){
    let vx = this.velX * timeStep;
    let vy = this.velY * timeStep;
    if(Math.abs(vx) < 0.5){
        vx = 0;
    }
    if(Math.abs(vy) < 0.5){
        vy = 0;
    }
    this.setPos(this.x + vx, this.y + vy);
};

// 检查是否可碰撞
bodyProto.checkCouldCollide = function(body){
    return true;
}


// ---------------------------world--------------------------------

// 碰撞力度分量
var solveIterations = 10;
var World = function(cfg){
    this.config = cfg;
    this.init();
}

var worldProto = World.prototype;

// 初始化
worldProto.init = function(){
    // 单位列表
    this.bodies = [];
    // 重力方向
    this.gravityX = 0;
    this.gravityY = 0;
    // 加速度方向
    this.forceX = 0;
    this.forceY = 0;
    // 是否允许休眠状态
    this.allowSleep = true;
    // 休眠状态时间阈值
    this.timeToSleep = 0.5;
    // 休眠速度上限
    this.minSleepVelSq = 0.01;
    this.minSleepVelAng = 0.2;
    // 单位Id生成器
    this.BODY_SN_SEED = 1;

    // 初始化碰撞管理
    this.initCollideManager();
    // 初始化事件
    this.onInit();
    // 设置初始值
    for(let key in this.config){
        this[key] = this.config[key];
    }
};

// 初始化事件
worldProto.onInit = function(){

};

// 初始化碰撞管理器
worldProto.initCollideManager = function(){
    let cm = this.collideManager = this.collideManager || new CollideManager();
    cm.onCollided = this.onCollided || cm.onCollided;
    cm.onSeparated = this.onSeparated || cm.onSeparated;
    // cm.onCollideSolve = this.onCollideSolve || cm.onCollideSolve;
    cm.init(this);
};

// 添加单位
worldProto.addBody = function(body){
    body._sn = this.BODY_SN_SEED++;
    body.id = body.id || body._sn;

    if(body.bodyType !== BodyType.Static && !body.ignoreG){
        body.gravityX = this.gravityX;
        body.gravityY = this.gravityY;
    }
    this.bodies.push(body);
    return body;
};

// 删除单位
worldProto.removeBody = function(body){
    body._to_remove_ = true;
};

// 清空所有单位
worldProto.clear = function(){
    for(let key in this.bodies){
        this.removeBody(this.bodies[key]);
    }
}

// 检查是否休眠状态
worldProto.checkSleep = function(body, timeStep){
    if(Math.abs(bodyProto.velAng) < this.minSleepVelAng && body.getVelSq() <= this.minSleepVelSq){
        body.sleeptime += timeStep;
        if(body.sleepTime >= this.timeToSleep){
            body.sleeping = true;
            return true;
        }
    }else{
        body.awake();
    }
    return false;
};

// 预处理碰撞
worldProto.preSolve = function(timeStep){
    // this.collideManager.preSolve(timeStep);
};

// 处理碰撞
worldProto.solve = function(timeStep){
    // let iterations = this.solveIterations;
    // let collideManager = this.collideManager;
    // for(let i = 0; i < iterations; i++){
    //     collideManager.solve(timeStep, iterations, i);
    // }
};

// 执行下一步
worldProto.step = function(timeStep){
    let bodies = this.bodies;
    let i = 0;
    let len = bodies.length;
    while(i < len){
        let body = bodies[i];
        if(body.body){
            i++;
            continue;
        }
        if(body._to_remove_){
            len--;
            bodies.splice(i, 1);
            continue;
        }
        // 保存状态
        body.saveStatus();

        if(!body.sleeping){
            // 处理旋转速度
            body.integrateVelAngle(timeStep);
            // 处理移动速度
            body.integrateVel(timeStep);
        }
        i++;
    }


    i = 0;
    while(i < len){
        let body = bodies[i];
        if(body.body){
            i++;
            continue;
        }
        if(!body.sleeping){
            // 单位未休眠, 执行下一步
            body.integrate(timeStep);
            body.update(timeStep);
        }

        // 检查单位是否自动休眠
        if(this.allowSleep && body.autoSleep){
            this.checkSleep(body, timeStep);
        }

        // 清理加速度
        body.setForce(0, 0);
        body.torque = 0;
        i++;
    }
    // 更新碰撞管理器
    this.collideManager.update(timeStep);
    // 处理碰撞
    this.solve(timeStep);
};

// -------------------------worldRunner-------------------------

/**
 * 运行器
 * @param {运行配置} cfg 
 */
var WorldRunner = function(cfg){
    this.config = cfg;
};


var worldRunnerProto = WorldRunner.prototype;

// 初始化
worldRunnerProto.init = function(world){
    // 设置初始值
    this.world = null;
    // 显示范围
    this.width = 800;
    this.height = 600;
    // 帧总数
    this.frameCount = 0;
    this.staticTimeStep = null;
    // 运行帧数
    this.FPS = 30;

    for(let key in this.config){
        this[key] = this.config[key];
    }
    this.world = world;
    this.timeout = 1000 / this.FPS;

    this._callRun = ()=>{
        this.run();
    }
};

// 开始运行
worldRunnerProto.start = function(){
    this.lastNow = Date.now();
    // 初始化状态
    this.paused = false;
    this.stopped = false;
    this.frameCount = 0;
    // 开始运行
    this.run();
};

// 运行
worldRunnerProto.run = function(){
    if(this.stopped){
        clearTimeout(this.loopId);
        return;
    }
    this.loopId = setTimeout(this._callRun, this.timeout);
    let now = Date.now();
    let timeStep = (now - this.lastNow) / 100;
    this.lastNow = now;
    if(!this.paused){
        this.frameCount++;
        // 如果是固定时间间隔
        if(this.staticTimeStep){
            timeStep = this.staticTimeStep;
        }
        // 开始帧事件
        this.enterFrame(timeStep, now);

        // 清理显示
        this.clear(timeStep, now);
        this.update(timeStep, now);
        this.render(timeStep, now);

        // 退出帧事件
        this.exitFrame(timeStep, now);
    }
};

// 开始帧事件
worldRunnerProto.enterFrame = function(timeStep){

};

// 结束帧事件
worldRunnerProto.exitFrame = function(timeStep){

};

// 执行
worldRunnerProto.update = function(timeStep){
    this.world.step(timeStep);
};

// 绘制
worldRunnerProto.render = function(timeStep){

};

// 清除
worldRunnerProto.clear = function(timeStep){

};

// 暂停
worldRunnerProto.pause = function(){
    this.paused = true;
};

// 继续
worldRunnerProto.resume = function(){
    this.paused = false;
};

// 停止
worldRunnerProto.stop = function(){
    this.stopped = true;
};


// ----------------------CollideManager-----------------------

// 碰撞图形类型
var CollideType = {
    Rect: 1,    // 矩形
    Circle: 2,  // 圆形
    Poly: 3,    // 多边形
};
// 碰撞检测
var CollideManager = function(cfg){
    this.config = cfg;
};


var collideManagerProto = CollideManager.prototype;

// 初始化
collideManagerProto.init = function(world){
    for(let key in this.config){
        this[key] = this.config[key];
    }
    this.world = world;
    // 穿透列表
    this.penetrated = {};
    this.argsList = {};
    this.argsCount = 0;
};


// 检查所有单位碰撞
collideManagerProto.collideSimple = function(timeStep){
    let result = 0;
    let bodies = this.world.bodies;
    this.contact = {};
    for(let i = 0, len = bodies.length; i < len - 1; i++){
        let bodyA = bodies[i];
        if(bodyA.disabled){
            continue;
        }
        for(let j = i + 1; j < len; j++){
            let bodyB = bodies[j];
            if(bodyB.disabled){
                continue;
            }
            this.collideTwoBodies(bodyA, bodyB, timeStep);
            result++;
        }
    }

    // 计算碰撞影响
    for(let i = 0, len = bodies.length; i < len; i ++){
        this.solve(bodies[i], timeStep);
    }

    return result;
};

// 检测两个单位碰撞
collideManagerProto.collideTwoBodies = function(bodyA, bodyB, timeStep){
    if(bodyA.sleeping && bodyB.sleeping){
        return null;
    }
    if(bodyA.invMass == 0 && bodyB.invMass == 0){
        return null;
    }

    let contactKey = bodyA.id + '&' + bodyB.id;
    // 开始检测具体碰撞
    if(this.collide(bodyA, bodyB) 
        && bodyA.checkCouldCollide(bodyB) 
        && bodyB.checkCouldCollide(bodyA)){
        // 碰撞
        this.onCollided(bodyA, bodyB, timeStep);
        this.penetrated[contactKey] = 1;
        // 保存碰撞数据
        if(!this.contact[bodyA.id]){
            this.contact[bodyA.id] = [];
        }
        if(!this.contact[bodyB.id]){
            this.contact[bodyB.id] = [];
        }
        // 保存碰撞关系
        this.contact[bodyA.id].push(bodyB);
        this.contact[bodyB.id].push(bodyA);
    }else{
        // 未碰撞
        if(this.penetrated[contactKey]){
            this.onSeparated(bodyA, bodyB, timeStep);
            this.penetrated[contactKey] = 0;
            let aContactList = this.contact[bodyA.id];
            let bContactList = this.contact[bodyB.id]
            if(aContactList){
                let index = aContactList.indexOf(bodyB);
                if(index >=0){
                    aContactList.splice(index, 1);
                }
            }
            if(bContactList){
                let index = bContactList.indexOf(bodyA);
                if(index >=0){
                    bContactList.splice(index, 1);
                }
            }
        }
    }
};

// 处理碰撞的相互影响
collideManagerProto.solve = function(body, timeStep){
    let contects = this.contact[body.id];
    this.argsList = {};
    if(contects){
        for(let key in contects){
            let bodyTmp = contects[key];
            let strKey = body.id + '$' + bodyTmp.id;
            if(this.argsList[strKey] == undefined){
                let data = this.solveOne(body, bodyTmp);
                if(data){
                    this.argsList[strKey] = this.solveOne(body, bodyTmp);
                    this.argsCount++
                }else{
                    console.error('errorData:' + strKey);
                }
            }
        }
        let argsLen = this.argsCount;
        // 二阶段计算
        for(let key in this.argsList){
            let args = this.argsList[key];
            let bodyA = args.bodyA;
            let bodyB = args.bodyB;
            // 计算碰撞力
            let armA = args.armA;
            let armB = args.armB;
            // 碰撞中心连线
            let normal = args.normal;
            // 碰撞位置法线
            let tangent = args.tangent;
            // 弹性
            let restitution = args.restitution;
            // 摩擦力
            let friction = args.friction;
            // 碰撞位置A
            let contactOnA = args.contactOnA;
            let contactOnB = args.contactOnB;
            // 碰撞插入深度
            let depth = args.depth;
            // 碰撞相对于连线质量
            let normalMass = args.normalMass;
            // 碰撞相对于法线质量
            let tangentMass = args.tangentMass;

            // 相互作用力
            let relativeVel = [(bodyA.velX - bodyA.velAng * armA[1]) - (bodyB.velX - bodyB.velAng * armB[1]),
                              (bodyA.velY + bodyA.velAng * armA[0]) - (bodyB.velY + bodyB.velAng * armB[0])];
            // 相互作用力在中点连线上的投影
            let normalRelativeVel = relativeVel[0] * normal[0] + relativeVel[1] * normal[1];


            if(args.velocityBias == undefined){
                // 速度斜率
                args.velocityBias = -restitution * normalRelativeVel / solveIterations / argsLen;
            }
            // 碰撞插入深度
            if(depth > 0){
                normalRelativeVel += depth / timeStep;
                // TODO 处理衰减
                args.depth -= depth / solveIterations;
            }

            // 计算中心点连线上的分力
            let impN = normalMass * -(normalRelativeVel + args.velocityBias);
            let normalImpulse = args.normalImpulse;
            args.normalImpulse = Math.min(impN + args.normalImpulse, 0);
            impN = args.normalImpulse - normalImpulse;

            // 相互作用力在法线上的投影
            let tangentRelativeVel = relativeVel[0] * tangent[0] + relativeVel[1] * tangent[1];

            // 计算法线上的分力
            let impT = tangentMass * -tangentRelativeVel;
            let frictionImp = Math.abs(args.normalImpulse * friction);
            let tangentImpulse = args.tangentImpulse;
            args.tangentImpulse = Math.max(-frictionImp, Math.min(impT + tangentImpulse, frictionImp));
            impT = args.tangentImpulse - tangentImpulse;

            // 速度分量
            let impX = normal[0] * impN - normal[1] * impT;
            let impY = normal[0] * impT + normal[1] * impN;

            // 结算速度
            bodyA.velX += impX * bodyA.invMass;
            bodyA.velY += impY * bodyA.invMass;
            bodyA.velAng += (armA[0] * impY - armA[1] * impX) * bodyA.invInertia;
            bodyB.velX -= impX * bodyB.invMass;
            bodyB.velY -= impY * bodyB.invMass;
            bodyB.velAng -= (armB[0] * impY - armB[1] * impX) * bodyB.invInertia;
        }
    }
};

// 单个碰撞处理
collideManagerProto.solveOne = function(bodyA, bodyB){
    let args = {};
    let dx = bodyB.x - bodyA.x;
    let dy = bodyB.y - bodyA.y;
    let dis = getPosDistance(bodyB.x, bodyB.y, bodyA.x, bodyA.y);
    switch(bodyA.shapeType){
        case CollideType.Circle:
        switch(bodyB.shapeType){
            case CollideType.Circle:
            // 圆和圆
            // 计算碰撞受力方向
            {
                // 碰撞方向
                let normal = [dx/dis, dy/dis];
                let tangent = [-normal[1], normal[0]];
                // 相关系数
                // 弹性
                let restitution = Math.max(bodyA.restitution, bodyB.restitution);
                // 摩擦力
                let friction = Math.sqrt(bodyA.friction * bodyB.friction);
                // 碰撞点
                let contactOnA = [
                    bodyA.x + (bodyB.x - bodyA.x) * (bodyA.radius / dis),
                    bodyA.y + (bodyB.y - bodyA.y) * (bodyA.radius / dis),
                ];
                let contactOnB = [
                    bodyB.x + (bodyA.x - bodyB.x) * (bodyB.radius / dis),
                    bodyB.y + (bodyA.y - bodyB.y) * (bodyB.radius / dis),
                ];
                // 碰撞向量
                let armA = [contactOnA[0] - bodyA.x, contactOnA[1] - bodyA.y];
                let armB = [contactOnB[0] - bodyB.x, contactOnB[1] - bodyB.y];

                // 求arm在中心连线与法线上的投影
                // 连线
                let armACrossN = armA[0] * normal[1] - armA[1] * normal[0];
                let armBCrossN = armB[0] * normal[1] - armB[1] * normal[0];
                // 法线
                let armACrossT = armA[0] * tangent[1] - armA[1] * tangent[0];
                let armBCrossT = armB[0] * tangent[1] - armB[1] * tangent[0];
                // TODO 计算质量相关参数
                let denom = bodyA.invMass + bodyB.invMass + (armACrossN * bodyA.invInertia) + (armBCrossN * bodyB.invInertia);
                let normalMass = !denom ? 0 : 1 / denom;
                denom = bodyA.invMass + bodyB.invMass + (armACrossT * bodyA.invInertia) + (armBCrossT * bodyB.invInertia);
                let tangentMass = !denom ? 0 : 1 / denom;

                return {bodyA: bodyA,
                    bodyB: bodyB,
                    contactOnA: contactOnA,
                    contactOnB: contactOnB,
                    armA: armA,
                    armB: armB,
                    normal: normal,
                    tangent: tangent,
                    normalMass: normalMass,
                    tangentMass: tangentMass,
                    normalImpulse: 0,
                    tangentImpulse: 0,
                    depth: (bodyA.radius + bodyB.radius) - dis,
                    restitution: restitution,
                    friction, friction};
            }
            case CollideType.Rect:
                // 圆和方
                return this.getCircleAndRectParam(bodyA, bodyB);
        }
        break;
        case CollideType.Rect:
        switch(bodyB.shapeType){
            case CollideType.Circle:
                // 圆和方
                return this.getCircleAndRectParam(bodyB, bodyA);
            case CollideType.Rect:
                // 方和方
        }
        break;
    }
};

collideManagerProto.getCircleAndRectParam = function(circle, rect){
    // 圆和方
    // 碰撞方向与
    let dx = 0;
    let dy = 0;
    // 相关系数
    // 弹性
    let restitution = Math.max(rect.restitution, circle.restitution);
    // 摩擦力
    let friction = Math.sqrt(rect.friction * circle.friction);
    // A边角点
    let halfW = rect.w / 2;
    let halfH = rect.h / 2;
    let pointList = [[rect.x - halfW, rect.y - halfH],
                    [rect.x + halfW, rect.y - halfH],
                    [rect.x + halfW, rect.y + halfH],
                    [rect.x - halfW, rect.y + halfH]];
    // 点-圆碰撞
    // 检查所有矩形点
    let hasCollided = false;
    let contactX = 0;
    let contactY = 0;
    for(let i = 0; i < 4; i++){
        let point = pointList[i];
        if(checkCircleAndPoint(circle.x, circle.y, circle.radius, point[0], point[1])){
            hasCollided = true;
            contactX = point[0];
            contactY = point[1];
            dx = circle.x - contactX;
            dy = circle.y - contactY;
            break;
        }
    }
    // 线-圆碰撞
    // 检查所有矩形线
    if(!hasCollided){
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        // 构建线列表
        for(let i = 0; i < 4; i++){
            if(i == 3){
                endX = pointList[0][0];
                endY = pointList[0][1];
            }else{
                endX = pointList[i + 1][0];
                endY = pointList[i + 1][1];
            }
            startX = pointList[i][0];
            startY = pointList[i][1];
            // 检查线圆碰撞
            let [isCollision, nearestX, nearestY] = checkCircleAndLine(circle.x, circle.y, circle.radius, startX, startY, endX, endY);
            if(isCollision){
                hasCollided = true;
                contactX = nearestX;
                contactY = nearestY;
                dx = circle.x - contactX;
                dy = circle.y - contactY;
                break;
            }
        }
    }
    if(!hasCollided){
        return;
    }
    
    let dis = getPosDistance(circle.x, circle.y, contactX, contactY);
    // 碰撞方向
    let normal = [dx/dis, dy/dis];
    // 法线
    let tangent = [-normal[1], normal[0]];
    let contactOnA = [contactX, contactY];
    let contactOnB = [contactX, contactY];
    // 碰撞向量
    let armA = [contactOnA[0] - rect.x, contactOnA[1] - rect.y];
    let armB = [contactOnB[0] - circle.x, contactOnB[1] - circle.y];
    // 求arm在中心连线与法线上的投影
    // 连线
    let armACrossN = armA[0] * normal[1] - armA[1] * normal[0];
    let armBCrossN = armB[0] * normal[1] - armB[1] * normal[0];
    // 法线
    let armACrossT = armA[0] * tangent[1] - armA[1] * tangent[0];
    let armBCrossT = armB[0] * tangent[1] - armB[1] * tangent[0];
    // TODO 计算质量相关参数
    let denom = rect.invMass + circle.invMass + (armACrossN * rect.invInertia) + (armBCrossN * circle.invInertia);
    let normalMass = !denom ? 0 : 1 / denom;
    denom = rect.invMass + circle.invMass + (armACrossT * rect.invInertia) + (armBCrossT * circle.invInertia);
    let tangentMass = !denom ? 0 : 1 / denom;
    return {bodyA: rect,
        bodyB: circle,
        contactOnA: contactOnA,
        contactOnB: contactOnB,
        armA: armA,
        armB: armB,
        normal: normal,
        tangent: tangent,
        normalMass: normalMass,
        tangentMass: tangentMass,
        normalImpulse: 0,
        tangentImpulse: 0,
        depth: circle.radius - Math.sqrt(armB[0] * armB[0] + armB[1] * armB[1]),
        restitution: restitution,
        friction, friction};
}


// 碰撞检测分类
collideManagerProto.collide = function(bodyA, bodyB){
    switch(bodyA.shapeType){
        case CollideType.Circle:
        switch(bodyB.shapeType){
            case CollideType.Circle:
            return checkCircleAndCircle(bodyB.x, bodyB.y, bodyB.radius,
                    bodyA.x, bodyA.y, bodyA.radius);
            case CollideType.Rect:
            return checkCircleAndRect(bodyA.x, bodyA.y, bodyA.radius,
                    bodyB.x, bodyB.y, bodyB.w, bodyB.h, bodyB.angle);
        }
        break;
        case CollideType.Rect:
        switch(bodyB.shapeType){
            case CollideType.Circle:
            return checkCircleAndRect(bodyB.x, bodyB.y, bodyB.radius,
                    bodyA.x, bodyA.y, bodyA.w, bodyA.h, bodyA.angle);
            case CollideType.Rect:
            return checkRectAndRect(bodyB.x, bodyB.y, bodyB.w, bodyB.h, bodyB.angle,
                    bodyA.x, bodyA.y, bodyA.w, bodyA.h, bodyA.angle);
        }
        break;
    }
};

// 是否在碰撞
collideManagerProto.hasCollided = function(bodyA, bodyB){
    let contactKey = bodyA.id + '&' + bodyB.id;
    return this.penetrated[contactKey];
};

// 前进
collideManagerProto.update = function(timeStep){
    let count = this.collideSimple(timeStep);
};


// 已碰撞
collideManagerProto.onCollided = function(bodyA, bodyB, timeStep){

};

// 已分离
collideManagerProto.onSeparated = function(bodyA, bodyB, timeStep){

};