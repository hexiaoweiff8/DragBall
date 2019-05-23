/**Created by the LayaAirIDE*/
	var Game=(function(_super){
		function Game(){
			Game.__super.call(this);
		}

		Laya.class(Game,'view.prefab.Game',_super);

		var _proto = Game.prototype;

		// 初始化
		_proto.init = function(data){
			console.log('init');
			this.status = STATUS_PARSE;
			this.data = data;

			// this.initMatter();
			// 初始化物理引擎
			this.world = new World({gravityY:10});
			this.world.init();
			this.worldRunner = new WorldRunner();
			this.worldRunner.init(this.world);
			this.worldRunner.start();
			this.worldRunner.staticTimeStep = 0.19;
			
			
			// 绑定事件
			this.startBtn.offAll(Laya.Event.CLICK);
			this.stopBtn.offAll(Laya.Event.CLICK);
			this.stopBtn.offAll(Laya.Event.CLICK);
			this.startBtn.on(Laya.Event.CLICK, this, this.startGame);
			this.stopBtn.on(Laya.Event.CLICK, this, this.stopGame);
			this.restartBtn.on(Laya.Event.CLICK, this, this.restartGame);
			// this.stopBtn.visible = false;
			this.initBalls(30, 8, 10);
			
			Laya.stage.offAll(Laya.Event.MOUSE_MOVE);
			// 添加鼠标移动标识
			Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
		};

		
		// 显示界面
		_proto.show = function(){
			Laya.stage.addChild(this);
			this.visible = true;
		};

		// 隐藏当前界面
		_proto.hide = function(){
			Laya.stage.removeChild(this);
			this.visible = false;
		};

		// 重置游戏
		_proto.restartGame = function(){
			this.initBalls(20, 8, 10);
		};

		// 开始游戏
		_proto.startGame = function(){
			this.status = STATUS_GAMING;
			this.worldRunner.resume();
		};

		// 停止游戏
		_proto.stopGame = function(){
			this.status = STATUS_GAMING;
			this.worldRunner.pause();
		};

		// 初始化balls
		_proto.initBalls = function(ballsCount, row, col){
			// 清理
			for(let key in this.ballsList){
				let ball = this.ballsList[key];
				Pool.recover('view.prefab.Ball', ball);
				ball.hide();
			}
			this.ballsList = [];
			if(this.world){
				this.world.clear();
			}
			let colWidth = (col * CELL_WIDTH);
			// 创建球体
			for(let i = 0; i < ballsCount; i++){
				let ball = Pool.getItemByClass('view.prefab.Ball', Ball);
				ball.show();
				ball.init(this);
				this.ballsList.push(ball);

				// 随机滚动速度
				let velAng = Math.random() * 5;
				let sign = Math.random() > 0.5? 1 : -1;

				// 创建两个body
				let body = new Body({x:ball.x,
										y:ball.y,
										radius: 40,
										damping: 0.1,
										dampingAng: 0.1,
										velAng: velAng * sign,
										friction: 1,
										dampingAng: 0.01,
										area: 800 * Math.PI,
										shapeType: CollideType.Circle
									});
				body.checkCouldCollide = function(body){
					return body.bodyType == BodyType.Static;
				};
				body.setMass(1);
				body.onSetPos = (x, y)=>{
					ball.x = x;
					ball.y = y;
				};
				body.onSetAngle = (angle)=>{
					ball.rotation = angle;
				};
				// 添加到world
				this.world.addBody(body);
				// 关联body
				ball.body = body;
				// 设置位置
				let pos = i * CELL_WIDTH;
				ball.body.setPos(pos % colWidth + this.ballPos.x + Math.random() * 5, 
				parseInt(pos / colWidth) * CELL_HEIGHT + this.ballPos.y);
			}
			// 创建四周阻拦
			// 创建两个body
			let rect1 = new Body({x: Laya.stage.width / 2,
									y: Laya.stage.height,
									w: Laya.stage.width,
									h: 20,
									friction: 0.5,
									restitution: 0,
									shapeType: CollideType.Rect,
									bodyType: BodyType.Static
								});
			let rect2 = new Body({x: 0,
									y: Laya.stage.height / 2,
									w: 20,
									friction: 0.5,
									restitution: 0,
									h: Laya.stage.height * 10,
									shapeType: CollideType.Rect,
									bodyType: BodyType.Static
								});
			let rect3 = new Body({x: Laya.stage.width,
									y: Laya.stage.height / 2,
									w: 20,
									friction: 0.5,
									restitution: 0,
									h: Laya.stage.height * 10,
									shapeType: CollideType.Rect,
									bodyType: BodyType.Static
								});
			this.world.addBody(rect1);
			this.world.addBody(rect2);
			this.world.addBody(rect3);
		};

		// 鼠标手移动事件
		_proto.onMouseMove = function(e){
			this.mouseX = e.stageX;
			this.mouseY = e.stageY;
			if(this.mouseEvent && this.mouseEvent.length > 0){
				this.mouseEvent.forEach((event)=>{event(e);});
			}
		};

		// 添加事件
		_proto.addEvent = function(event, type){
			switch(type){
				case EVENT_MOUSE_MOVE:
				if(this.mouseEvent == undefined){
					this.mouseEvent = [];
				}
				this.mouseEvent.push(event);
				break;
			}
		};

		// 删除事件
		_proto.removeEvent = function(event, type){
			switch(type){
				case EVENT_MOUSE_MOVE:
				let index = this.mouseEvent.indexOf(event);
				if(index >= 0){
					this.mouseEvent.splice(index, 1);
				}
				break;
			}
		};

		// 清理事件
		_proto.clearEvent = function(type){
			switch(type){
				case EVENT_MOUSE_MOVE:
				this.mouseEvent = [];
				break;
			}
		};


		return Game;
	})(GameUI);