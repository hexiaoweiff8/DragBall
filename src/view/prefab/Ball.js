/**Created by the LayaAirIDE*/
	var Ball=(function(_super){
		function Ball(){
			Ball.__super.call(this);
		}

		Laya.class(Ball,'view.prefab.Ball',_super);
		
		var _proto = Ball.prototype;

		// 初始化
		_proto.init = function(main){
			this.main = main;
			this.sprite.offAll(Laya.Event.MOUSE_DOWN);
			this.sprite.offAll(Laya.Event.MOUSE_MOVE);
			this.sprite.offAll(Laya.Event.MOUSE_UP);
			this.sprite.offAll(Laya.Event.MOUSE_OUT);
			this.sprite.on(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
			this.sprite.on(Laya.Event.MOUSE_MOVE, this, this.onMove);
			this.sprite.on(Laya.Event.MOUSE_UP, this, this.onEndDrag);
			this.sprite.on(Laya.Event.MOUSE_OUT, this, this.onOut);
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
		
		// 拖拽事件
		_proto.onStartDrag = function(e){
			// 初始化拖动
			this.isDrag = true;
			this.showTop();
		};
		
		// 拖拽事件
		_proto.onMove = function(e){
			// 初始化拖动
			if(this.isDrag){
				if(this.body){
					this.forceX = (e.stageX - this.x) * 5;
					this.forceY = (e.stageY - this.y) * 5;
					this.body.sleeping = true;
					this.body.setPos(e.stageX, e.stageY);
				}
			}
		};
		
		// 拖拽事件
		_proto.onOut = function(e){
			// 初始化拖动
			if(this.isDrag){
				if(this.isUpEvent != true){
					// 添加拖拽事件到Main的鼠标监控中
					this.main.addEvent((e)=>this.onMove(e), EVENT_MOUSE_MOVE);
					this.isUpEvent = true;
				}
			}
		};
		

		// 拖拽事件
		_proto.onEndDrag = function(e){
			// 初始化拖动
			if(this.isDrag){
				this.isDrag = false;
				this.showBottom();
				if(this.body){
					this.body.sleeping = false;
					// 更新冲量
					this.body.setForce(this.forceX, this.forceY);
					this.body.clearVel();
					this.body.velAng = Math.random() * 10;
					this.forceX = 0;
					this.forceY = 0;
				}
				this.main.clearEvent(EVENT_MOUSE_MOVE);
				this.isUpEvent = false;
			}
		};

		
		// 置顶
		_proto.showTop = function(){
			this.zOrder = SHOW_TOP_ORDER
		};

		// 置底
		_proto.showBottom = function(){
			this.zOrder = SHOW_BOTTOM_ORDER
		};

		return Ball;
	})(BallUI)