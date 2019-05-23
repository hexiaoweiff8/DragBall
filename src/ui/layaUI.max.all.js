var CLASS$=Laya.class;
var STATICATTR$=Laya.static;
var View=laya.ui.View;
var Dialog=laya.ui.Dialog;
var BallUI=(function(_super){
		function BallUI(){
			
		    this.sprite=null;

			BallUI.__super.call(this);
		}

		CLASS$(BallUI,'ui.prefab.BallUI',_super);
		var __proto__=BallUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(BallUI.uiView);

		}

		BallUI.uiView={"type":"View","props":{"y":40,"x":40,"width":80,"pivotY":40,"pivotX":40,"height":80},"child":[{"type":"Image","props":{"y":0,"x":0,"width":80,"skin":"comp/ball.png","pivotX":0,"height":80}},{"type":"Sprite","props":{"y":0,"x":0,"width":100,"var":"sprite","name":"sprite","height":100}}]};
		return BallUI;
	})(View);
var GameUI=(function(_super){
		function GameUI(){
			
		    this.startBtn=null;
		    this.stopBtn=null;
		    this.restartBtn=null;
		    this.ballPos=null;

			GameUI.__super.call(this);
		}

		CLASS$(GameUI,'ui.prefab.GameUI',_super);
		var __proto__=GameUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(GameUI.uiView);

		}

		GameUI.uiView={"type":"View","props":{"width":1136,"mouseThrough":true,"height":640},"child":[{"type":"Button","props":{"y":30,"x":30,"width":80,"var":"startBtn","skin":"comp/button.png","name":"startBtn","labelSize":35,"label":"开始","height":80}},{"type":"Button","props":{"y":250,"x":30,"width":80,"var":"stopBtn","skin":"comp/button.png","name":"stopBtn","labelSize":35,"label":"停止","height":80}},{"type":"Button","props":{"y":140,"x":30,"width":80,"var":"restartBtn","skin":"comp/button.png","name":"restartBtn","labelSize":35,"label":"重置","height":80}},{"type":"Sprite","props":{"y":80,"x":150,"var":"ballPos","name":"ballPos"}}]};
		return GameUI;
	})(View);
var MainUI=(function(_super){
		function MainUI(){
			
		    this.startBtn=null;

			MainUI.__super.call(this);
		}

		CLASS$(MainUI,'ui.prefab.MainUI',_super);
		var __proto__=MainUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(MainUI.uiView);

		}

		MainUI.uiView={"type":"View","props":{"width":1136,"height":640},"child":[{"type":"Label","props":{"y":110,"x":325,"width":500,"valign":"middle","text":"Logo Name","styleSkin":"comp/label.png","height":300,"fontSize":100,"color":"#ffffff","align":"center"}},{"type":"Button","props":{"y":440,"x":500,"width":100,"var":"startBtn","skin":"comp/button.png","name":"startBtn","labelSize":50,"label":"GO","height":100}}]};
		return MainUI;
	})(View);