var musicFallPlay;
var musicSuccessPlay;
var Game = function() {
	// 基本参数
	this.config = {
		isMobile: false,
		background: 0xffffff, // 背景颜色
		ground: -1, // 地面y坐标
		fallingSpeed: 0.2, // 游戏失败掉落速度
		cubeColor: 0xeeeeee,
		jumperColor: 0x222222,
		jumperWidth: 0.2, // jumper宽度   //fix
		jumperHeight: 3.5, // jumper高度
		jumperDeep: 1.2, // jumper深度     
	}
	// 游戏状态
	this.score = 0
	this.cubeStyle = [];

	this.size = {
		width: window.innerWidth,
		height: window.innerHeight
	}
	this.scene = new THREE.Scene()
	this.cameraPos = {
		current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
		next: new THREE.Vector3() // 摄像机即将要移到的位置
	}
	this.camera = new THREE.OrthographicCamera(this.size.width / -50, this.size.width / 50, this.size.height / 50, this.size.height / -50, 0, 5000)
	this.renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	})
	// this.renderer.shadowMapEnabled = true;

	this.cubes = [] // 方块数组
	this.cubeStat = {
		currentDir: '',
		nextDir: '' // 下一个方块相对于当前方块的方向: 'left' 或 'right'
	}
	this.boxNum = 2;
	this.x = 1;
	// 0:蓝色大箱子 
	// 1：白色honor大箱子
	// 2：白色篮圈大箱子
	// 3: 白色蓝条honor小箱子
	// 4：蓝色 浅蓝色条纹 小箱子
	// 5：蓝色 白圈 小箱子
	// 6： 房子
	// 7：honor 炫彩
	this.addScore = [5, 5, 5, 5, 5, 5, 5,5,6, 6,6,6,6,6,6],
		this.add = 5;
	this.jumperStat = {
		ready: false, // 鼠标按完没有
		xSpeed: 0, // xSpeed根据鼠标按的时间进行赋值   //fix
		ySpeed: 0 // ySpeed根据鼠标按的时间进行赋值   //fix
	}
	this.falledStat = {
		location: -1, // jumper所在的位置
		distance: 0 // jumper和最近方块的距离
	}
	this.fallingStat = {
		speed: 0.2, // 游戏失败后垂直方向上的掉落速度
		end: false // 掉到地面没有
	}
	this.localMesh = undefined;
	this.difficult = 5;
	this.music = {}

}
Game.prototype = {
	init: function() {
		this.getAudio(); //动态添加音乐
		this._checkUserAgent() // 检测是否移动端
		this._setCamera() // 设置摄像机位置
		this._setRenderer() // 设置渲染器参数
		this._setLight() // 设置光照
		this._createCube0() // 加一个方块
		this._createCube1() // 再加一个方块
		this._createJumper() // 加入游戏者jumper
		 
		//fix
		if(this.cubeStat.nextDir === 'left') {
			this.jumper.rotation.y = 0;
		} else {
			this.jumper.rotation.y = 4.7;
		}
		this._updateCamera() // 更新相机坐标
		var self = this
		var mouseEvents = (self.config.isMobile) ? {
			down: 'touchstart',
			up: 'touchend',
		} : {
			down: 'mousedown',
			up: 'mouseup',
		}
		// 事件绑定到canvas中
		var canvas = document.querySelector('canvas')
		canvas.addEventListener(mouseEvents.down, function(e) {
			e.preventDefault();
			self._handleMousedown();
			self._musicPower();
		})
		// 监听鼠标松开的事件
		canvas.addEventListener(mouseEvents.up, function(evt) {
			self._handleMouseup()
		})
		// 监听窗口变化的事件
		window.addEventListener('resize', function() {
			self._handleWindowResize()
		})
 
		$(".music").on("click",function(){
			 if(ifMusicPlay==true){
			 	self.music.fall_failed[0].play(); 
			 }
			 else{ return false;}
			
			 // self.playMuicFall();
		});
		$(".music2").on("click",function(){
			 if(ifMusicPlay==true){
			 	self.music.fall_success_normal[0].play(); 
			 }
	             else{ return false;}
		    // self.playMuicSuccess();
		})

	},

	randomCubeFunc: function(cubeAll) {
		return cubeAll[Math.floor(Math.random() * this.cubeStyle.length)]
	},
	// 游戏失败重新开始的初始化配置
	restart: function() {
		$(".mask2").hide();
		this.score = 0;
		this.difficult = 5;
		this.cameraPos = {
			current: new THREE.Vector3(0, 0, 0),
			next: new THREE.Vector3()
		}
		this.fallingStat = {
			speed: 0.2,
			end: false
		}
		// 删除所有方块
		var length = this.cubes.length
		for(var i = 0; i < length; i++) {
			this.scene.remove(this.cubes.pop())
		}
		// 删除jumper
		this.scene.remove(this.jumper)
		// 显示的分数设为 0
		this.successCallback(this.score)
		this._createCube0()
		this._createCube1()
		this._createJumper()
	  
		this.x = 1;
		this.add = 5;
		this.boxNum = 2;
		// clearTimeout(xx);

		//fix
		if(this.cubeStat.nextDir === 'left') {
			this.jumper.rotation.y = 0;
		} else {
			this.jumper.rotation.y = 4.7;
		}
		if(this.localMesh) {
			this.localMesh.visible = false;
		}
		this._updateCamera()
		this._reInfo();
	},
	// 游戏成功的执行函数, 外部传入
	addSuccessFn: function(fn) {
		this.successCallback = fn
	},
	// 游戏失败的执行函数, 外部传入
	addFailedFn: function(fn) {
		this.failedCallback = fn
	},
	// 检测是否手机端
	_checkUserAgent: function() {
		var n = navigator.userAgent;
		if(n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i)) {
			this.config.isMobile = true
		}
	},
	// THREE.js辅助工具
	_createHelpers: function() {
		var axesHelper = new THREE.AxesHelper(10)
		this.scene.add(axesHelper)
	},
	// 窗口缩放绑定的函数
	_handleWindowResize: function() {
		this._setSize()
		this.camera.left = this.size.width / -60
		this.camera.right = this.size.width / 60
		this.camera.top = this.size.height / 60
		this.camera.bottom = this.size.height / -60
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(this.size.width, this.size.height)
		this._render()
	},
	/**
	 *鼠标按下或触摸开始绑定的函数
	 *根据鼠标按下的时间来给 xSpeed 和 ySpeed 赋值
	 *@return {Number} this.jumperStat.xSpeed 水平方向上的速度
	 *@return {Number} this.jumperStat.ySpeed 垂直方向上的速度
	 **/
	_handleMousedown: function() {

		var self = this
		if(!self.jumperStat.ready && self.jumper.scale.y > 0.02) {
			self.jumper.scale.y -= 0.008
			//fix
			self.jumperStat.xSpeed += 0.01
			self.jumperStat.ySpeed += 0.014

			self._render(self.scene, self.camera)
			requestAnimationFrame(function() {
				self._handleMousedown()
			})
		}
	},
	// 鼠标松开或触摸结束绑定的函数
	_handleMouseup: function() {
		var self = this
		// 标记鼠标已经松开
		self.music.power_increase[0].pause();
		self.music.power_increase[1].pause();
		self.jumperStat.ready = true;
		// 判断jumper是在方块水平面之上，是的话说明需要继续运动
		if(self.jumper.position.y >= 1) {
			// jumper根据下一个方块的位置来确定水平运动方向
			if(self.cubeStat.nextDir === 'left') {
				var time = Math.abs((self.cubes[self.cubes.length - 1].position.x - self.cubes[self.cubes.length - 2].position.x) / (self.jumperStat.xSpeed + 0.2));
				if(self.jumper.position.z > self.cubes[self.cubes.length - 1].position.z) {
					self.jumper.position.z -= Math.abs((self.jumper.position.z - self.cubes[self.cubes.length - 1].position.z)) / time;
				} else if(self.jumper.position.z < self.cubes[self.cubes.length - 1].position.z) {
					self.jumper.position.z += Math.abs((self.jumper.position.z - self.cubes[self.cubes.length - 1].position.z)) / time;
				}
				self.jumper.position.x -= self.jumperStat.xSpeed
			} else {
				var time = Math.abs((self.cubes[self.cubes.length - 1].position.z - self.cubes[self.cubes.length - 2].position.z) / (self.jumperStat.xSpeed + 0.2));
				if(self.jumper.position.x > self.cubes[self.cubes.length - 1].position.x) {
					self.jumper.position.x -= Math.abs((self.jumper.position.x - self.cubes[self.cubes.length - 1].position.x)) / time;
				} else if(self.jumper.position.x < self.cubes[self.cubes.length - 1].position.x) {
					self.jumper.position.x += Math.abs((self.jumper.position.x - self.cubes[self.cubes.length - 1].position.x)) / time;
				}
				self.jumper.position.z -= self.jumperStat.xSpeed
			}
			// jumper在垂直方向上运动
			self.jumper.position.y += self.jumperStat.ySpeed
			// 运动伴随着缩放
		 
			// jumper在垂直方向上先上升后下降
			self.jumperStat.ySpeed -= 0.058
			// 每一次的变化，渲染器都要重新渲染，才能看到渲染效果
			self._render(self.scene, self.camera)
			requestAnimationFrame(function() {
				self.jumper.scale.y = 1;
				self._handleMouseup()
			})
		} else {
			// jumper掉落到方块水平位置，开始充值状态，并开始判断掉落是否成功 ==初始状态
			self.jumperStat.ready = false
			self.jumperStat.xSpeed = 0
			self.jumperStat.ySpeed = 0
			self.jumper.position.y = 1
			self._checkInCube();

			if(self.falledStat.location === 1) {
				$(".music2").trigger("click");
				// 掉落成功，进入下一步
				// self.score=self.score+self.addScore[self.x];

				self.score = self.score + self.add
                
                if(self.boxNum<10){
                	self.x = Math.floor(Math.random() * 9);
                } 
                else if(self.boxNum<100){
                	self.x=Math.floor(Math.random()*10);
                }
                else if( self.boxNum<150){
                	self.x=Math.floor(Math.random()*11);
                }
                else if( self.boxNum<200){
                	self.x=Math.floor(Math.random()*12);
                }
                else
                 {
				self.x = Math.floor(Math.random() * 13); //随机生成箱子
					} 
               console.log(self.boxNum);
               console.log(self.x);
				self.boxNum = self.boxNum + 1;
				self._reInfo();

				this._IfCreateLocal();
			 
				if(self.boxNum % 10 == 0) {
					self._createCube7();
					self.add = 10;

				} else if(self.boxNum % 15 == 0 && self.boxNum % 10 !== 0) {
					self._createCube6();
					self.add = 10;
				} else {

					self._createCubeRD(self.x);
					// self._createCube6();
					
					self.add = self.addScore[self.x];
				}

				//fix
				if(this.cubeStat.nextDir === 'left') {
					this.jumper.rotation.y = 0;
				} else {
					this.jumper.rotation.y = 4.7;
				}
				self._updateCamera()
				if(self.successCallback) {
					self.successCallback(self.score)
				}
			} else {
				// 掉落失败，进入失败动画
				self._falling();

			}
		}
	},
	_createCubeRD: function(x) {
		var self = this;
		switch(true) {
			case x == 0:
				self._createCube0();
				break;
			case x == 1:
				self._createCube1();
				break;
			case x == 2:
				self._createCube2();
				break;
			case x == 3:
				self._createCube0();
				break;
			case x == 4:
				self._createCube1();
				break;
			case x == 5:
				self._createCube2();
				break;
			case x == 6:
				self._createCube0();
				break;
			case x == 7:
				self._createCube1();
				break;
			case x == 8:
				self._createCube3();
				break;
			case x == 9:
				self._createCube4();
				break;
			case x == 10:
				self._createCube5();
				break;
			case x==11:
			    self._createCube3();
			    break;
			 case x==12:
			    self._createCube4();
			    break;
			 case x==13:
			    self._createCube5();
			    break;
			default:
				self._createCube2();
				break;
		}
	},
	/**
	 *游戏失败执行的碰撞效果
	 *@param {String} dir 传入一个参数用于控制倒下的方向：'rightTop','rightBottom','leftTop','leftBottom','none'
	 **/
	_fallingRotate: function(dir) {
		var self = this ;
		var offset = self.falledStat.distance - self.config.cubeWidth / 2
		var rotateAxis = 'z' // 旋转轴
		var rotateAdd = self.jumper.rotation[rotateAxis] + 0.1 // 旋转速度
		var rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2 // 旋转结束的弧度
		var fallingTo = self.config.ground + self.config.jumperWidth / 2 + offset
       	$(".mask2").show();
		if(dir === 'rightTop') {
			rotateAxis = 'x'
			rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
			rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI / 2
			self.jumper.geometry.translate.z = offset
		} else if(dir === 'rightBottom') {
			rotateAxis = 'x'
			rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
			rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2
			self.jumper.geometry.translate.z = -offset
		} else if(dir === 'leftBottom') {
			rotateAxis = 'z'
			rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
			rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI / 2
			self.jumper.geometry.translate.x = -offset
		} else if(dir === 'leftTop') {
			rotateAxis = 'z'
			rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
			rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2
			self.jumper.geometry.translate.x = offset
		} else if(dir === 'none') {
			rotateTo = false
			fallingTo = self.config.ground
		} else {
			throw Error('Arguments Error')
		}
		if(!self.fallingStat.end) {
			if(rotateTo) {
				self.jumper.rotation[rotateAxis] = rotateAdd
			} else if(self.jumper.position.y > fallingTo) {
				self.jumper.position.y -= self.config.fallingSpeed
			} else {
				self.fallingStat.end = true
			}
			self._render()
			requestAnimationFrame(function() {
				self._falling()
			})
		} else {
			if(self.failedCallback) {
				self.failedCallback()
			}
		}
	},
	/**
	 *游戏失败进入掉落阶段
	 *通过确定掉落的位置来确定掉落效果
	 **/
	_falling: function() {
		this.setCookie("ban",11,1);
		 this.setCookie("aop",111,1);
		var self = this
		if(self.falledStat.location == 0) {
			self._fallingRotate('none')
		} else if(self.falledStat.location === -10) {
			if(self.cubeStat.nextDir == 'left') {
				self._fallingRotate('leftTop')
			} else {
				self._fallingRotate('rightTop')
			}
		} else if(self.falledStat.location === 10) {
			if(self.cubeStat.nextDir == 'left') {
				if(self.jumper.position.x < self.cubes[self.cubes.length - 1].position.x) {
					self._fallingRotate('leftTop')
				} else {
					self._fallingRotate('leftBottom')
				}
			} else {
				if(self.jumper.position.z < self.cubes[self.cubes.length - 1].position.z) {
					self._fallingRotate('rightTop')
				} else {
					self._fallingRotate('rightBottom')
				}
			}
		}
	},
	/**
	 *判断jumper的掉落位置
	 *@return {Number} this.falledStat.location
	 * -1 : 掉落在原来的方块，游戏继续
	 * -10: 掉落在原来方块的边缘，游戏失败
	 *  1 : 掉落在下一个方块，游戏成功，游戏继续
	 *  10: 掉落在下一个方块的边缘，游戏失败
	 *  0 : 掉落在空白区域，游戏失败
	 **/
	_checkInCube: function() {
		if(this.cubes.length > 1) {
			// jumper 的位置
			var pointO = {
				x: this.jumper.position.x,
				z: this.jumper.position.z
			}
			// 当前方块的位置
			var pointA = {
				x: this.cubes[this.cubes.length - 1 - 1].position.x,
				z: this.cubes[this.cubes.length - 1 - 1].position.z
			}
			// 下一个方块的位置
			var pointB = {
				x: this.cubes[this.cubes.length - 1].position.x,
				z: this.cubes[this.cubes.length - 1].position.z
			}
			var distanceS, // jumper和当前方块的坐标轴距离
				distanceL, // jumper和下一个方块的坐标轴距离
				// 判断下一个方块相对当前方块的方向来确定计算距离的坐标轴
				shuold1, should2 //储存jumper若在盒子上则应距离白盒子多远 /x,z
			if(this.cubeStat.nextDir === 'left') {
				distanceS = Math.abs(pointO.x - pointA.x)
				distanceL = Math.abs(pointO.x - pointB.x)
				should1 = this.cubes[this.cubes.length - 1 - 1].geometry.parameters.width / 2 +
					this.config.jumperWidth / 2;
				should2 = this.cubes[this.cubes.length - 1].geometry.parameters.width / 2 +
					this.config.jumperWidth / 2;
			} else {
				distanceS = Math.abs(pointO.z - pointA.z)
				distanceL = Math.abs(pointO.z - pointB.z)
				should1 = this.cubes[this.cubes.length - 1 - 1].geometry.parameters.depth / 2 +
					this.config.jumperWidth / 2;
				should2 = this.cubes[this.cubes.length - 1].geometry.parameters.depth / 2 +
					this.config.jumperWidth / 2;
			}

			var result = 0
			if(this.cubeStat.nextDir === 'left') {
				if(distanceS < should1) {
					// 落在当前方块，将距离储存起来，并继续判断是否可以站稳
					this.falledStat.distance = distanceS
					result = (distanceS + this.config.jumperWidth / 2) < this.cubes[this.cubes.length - 1 - 1].geometry.parameters.width / 2 ? -1 : -10
				}
				// 
				else if(distanceL < should2) {
					this.falledStat.distance = distanceL
					// 落在下一个方块，将距离储存起来，并继续判断是否可以站稳
					result = (distanceL + this.config.jumperWidth / 2) < this.cubes[this.cubes.length - 1].geometry.parameters.width / 2 ? 1 : 10
					// 
				} else {
					result = 0
				}
			} else {
				if(distanceS < should1) {
					// 落在当前方块，将距离储存起来，并继续判断是否可以站稳
					this.falledStat.distance = distanceS
					result = (distanceS + this.config.jumperWidth / 2) < this.cubes[this.cubes.length - 1 - 1].geometry.parameters.depth / 2 ? -1 : -10
				}
				// 
				else if(distanceL < should2) {
					this.falledStat.distance = distanceL
					// 落在下一个方块，将距离储存起来，并继续判断是否可以站稳

					result = (distanceL + this.config.jumperWidth / 2) < this.cubes[this.cubes.length - 1].geometry.parameters.depth / 2 ? 1 : 10

				} else {
					result = 0
				}

			}
			this.falledStat.location = result;
			if((result == 1) || (result == -1)) {
				// var music = document.getElementById("fall-success-normal");

				// musicSuccessPlay.click();
				// $(".music2").trigger("click"); 
			} else {
				// this.playMuicFall();
				// musicFallPlay.click(); 
				$(".music").trigger("click");
			}

		}

	},
	// 每成功一步, 重新计算摄像机的位置，保证游戏始终在画布中间进行
	_updateCameraPos: function() {
		var lastIndex = this.cubes.length - 1
		var pointA = {
			x: this.cubes[lastIndex].position.x,
			z: this.cubes[lastIndex].position.z
		}
		var pointB = {
			x: this.cubes[lastIndex - 1].position.x,
			z: this.cubes[lastIndex - 1].position.z
		}
		var pointR = new THREE.Vector3()
		pointR.x = (pointA.x + pointB.x) /2
		pointR.y = 0
		pointR.z = (pointA.z + pointB.z) /2
		this.cameraPos.next = pointR
	},
	// 基于更新后的摄像机位置，重新设置摄像机坐标
	_updateCamera: function() {
		var self = this
		var c = {
			x: self.cameraPos.current.x,
			y: self.cameraPos.current.y,
			z: self.cameraPos.current.z
		}
		var n = {
			x: self.cameraPos.next.x,
			y: self.cameraPos.next.y,
			z: self.cameraPos.next.z
		}
		if(c.x > n.x || c.z > n.z) {
			self.cameraPos.current.x -= 0.28
			self.cameraPos.current.z -= 0.28
			if(self.cameraPos.current.x - self.cameraPos.next.x < 0.05) {
				self.cameraPos.current.x = self.cameraPos.next.x
			}
			if(self.cameraPos.current.z - self.cameraPos.next.z < 0.05) {
				self.cameraPos.current.z = self.cameraPos.next.z
			}
			self.camera.lookAt(new THREE.Vector3(c.x-3, 0, c.z-3))
			self._render()
			requestAnimationFrame(function() {
				self._updateCamera()
			})
		}
	},
	// 初始化jumper：游戏主角
	_createJumper: function() {
		var geometry = new THREE.CubeGeometry(this.config.jumperWidth, this.config.jumperHeight, this.config.jumperDeep);
		//fix
		geometry.translate(0, this.config.jumperHeight / 2, 0)
		//加载六个面的纹理贴图
		var _phone_1 = THREE.ImageUtils.loadTexture('img/phone/back.png');
		var _phone_2 = THREE.ImageUtils.loadTexture('img/phone/front.png');
		var _phone_3 = THREE.ImageUtils.loadTexture('img/phone/otherside.png');
		var _phone_4 = THREE.ImageUtils.loadTexture('img/phone/side.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshBasicMaterial({
				map: _phone_1
			}),
			new THREE.MeshBasicMaterial({
				map: _phone_2
			}),
			new THREE.MeshBasicMaterial({
				map: _phone_3
			}),
			new THREE.MeshBasicMaterial({
				map: _phone_3
			}),
			new THREE.MeshBasicMaterial({
				map: _phone_4
			}),
			new THREE.MeshBasicMaterial({
				map: _phone_4
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);

		var mesh = new THREE.Mesh(geometry, facematerial);
		mesh.position.y = 1;
		mesh.castShadow = true;
		this.jumper = mesh;
		this.scene.add(this.jumper);
	},
	// 新增一个方块, 新的方块有2个随机方向
	_createCube0: function() {
		//fix
		this.cubeStyle = [{
				width: 3.8,
				height: 2,
				deep: 3.8,
			},
			{
				width: 4,
				height: 2,
				deep: 4,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/0/otherside1.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/0/side1.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/0/block1top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/0/block1top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/0/side1.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/0/side1.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);
		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 5;
					break;
			 
				case this.score > 400:
					this.difficult =5.5;
					break;
				case this.score > 550:
					this.difficult = 6;
					break;
				default:
					this.difficult = 4;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_createCube1: function() {
		//fix
		this.cubeStyle = [{
				width: 3.8,
				height: 2,
				deep: 3.8,
			},
			{
				width: 4,
				height: 2,
				deep: 4,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/1/1-side.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/1/1-side2.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/1/1-top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/1/1-top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/1/1-side2.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/1/1-side2.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);
		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 5;
					break;
			 
				case this.score > 400:
					this.difficult = 5.5;
					break;
				case this.score > 550:
					this.difficult = 6;
					break;
				default:
					this.difficult = 4;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_createCube2: function() {
		//fix
		this.cubeStyle = [{
				width: 3.8,
				height: 2,
				deep: 3.8,
			},
			{
				width: 4,
				height: 2,
				deep: 4,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/2/2-side2.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/2/2-side2.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/2/2-top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/2/2-top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/2/2-side.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/2/2-side2.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);
		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 5;
					break;
				
				case this.score > 400:
					this.difficult = 5.5;
					break;
				case this.score > 550:
					this.difficult = 6;
					break;
				default:
					this.difficult = 4;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_createCube3: function() {
		//fix
		this.cubeStyle = [{
				width: 2,
				height: 2,
				deep: 2,
			},
			{
				width: 2,
				height: 2,
				deep: 2,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;

		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/3/3-side1.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/3/3-top.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/3/3-top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/3/3-top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/3/3-side2.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/3/3-top.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);

		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 3;
					break;
			 
				case this.score > 400:
					this.difficult = 4;
					break;
				case this.score > 500:
					this.difficult = 4.5;
					break;
				default:
					this.difficult =2.5;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-2 - this.difficult*Math.random();
							} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-2 - this.difficult*Math.random();
 	}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_createCube4: function() {
		//fix
		this.cubeStyle = [{
				width: 2,
				height: 2,
				deep: 2,
			},
			{
				width: 2,
				height: 2,
				deep: 2,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/4/4-side1.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/4/4-top.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/4/4-top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/4/4-top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/4/4-side1.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/4/4-top.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);
		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 3;
					break;
				 
				case this.score > 400:
					this.difficult = 4;
					break;
				case this.score > 500:
					this.difficult = 4.5;
					break;
				default:
					this.difficult = 2.5;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-2 - this.difficult*Math.random();			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-2 - this.difficult*Math.random();			}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_createCube5: function() {
		//fix
		this.cubeStyle = [{
				width: 2,
				height: 2,
				deep: 2,
			},
			{
				width: 2,
				height: 2,
				deep: 2,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		console.log()
		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/5/5-side.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/5/5-top.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/5/5-top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/5/5-top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/5/5-top.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/5/5-top.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象MeshLambertMaterial
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);
		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 3;
					break;
				
				case this.score > 400:
					this.difficult = 4;
					break;
				case this.score > 500:
					this.difficult = 4.5;
					break;
				default:
					this.difficult = 2.5;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-2 - this.difficult*Math.random();			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-2 -this.difficult*Math.random();
 		}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_createCube6: function() {
		//fix
		this.cubeStyle = [{
				width: 4,
				height: 0,
				deep: 4,
			},
			{
				width: 3.8,
				height: 0,
				deep: 3.8,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		var topGeometry = new THREE.BoxGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep);
		var texture1 = THREE.ImageUtils.loadTexture('img/box/6/store_top.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/6/store-left2.png');
		var topMaterial = new THREE.MeshLambertMaterial({map: texture1,transparent: true});
			
		var bottomGeometry = new THREE.BoxGeometry(cubeCreate.width - 0.5, cubeCreate.height + 1, cubeCreate.deep - 0.5);
		var bottomMaterial = new THREE.MeshLambertMaterial({map: texture2});

		this.mapUv(300, 370, topGeometry, 0, 45, 0, 195, 45, true); //left
		this.mapUv(300, 370, topGeometry, 1, 0, 0, 240, 70);
		this.mapUv(300, 370, topGeometry, 2, 0, 70, 240, 370); //top
		this.mapUv(300, 370, topGeometry, 4, 0, 0, 0, 0, true); //right
		//this.mapUv(300, 370, topGeometry, 0, 0, 0, 0, 40, true); //left


		this.mapUv(300, 120, bottomGeometry, 0, 0, 0, 290, 50, true); //left
		this.mapUv(300, 120, bottomGeometry, 1, 0, 0, 0, 0); //top
		this.mapUv(300, 120, bottomGeometry, 4, 0, 0, 0, 0, true); //right


		var materials = [topMaterial, bottomMaterial];
		var totalGeometry = new THREE.BoxGeometry(cubeCreate.width - 0.001, 0, cubeCreate.deep - 0.001);
		this.mapUv(300, 370, totalGeometry, 0, 299, 0, 299, 0, false); //left
		//this.mapUv(300, 370, totalGeometry, 0, 45, 0, 190, 45, true); //left
		var mesh = new THREE.Mesh(totalGeometry, materials);
		this.merge(totalGeometry, topGeometry, 0, [{
			x: 0,
			y: 0.5,
			z: 0
		}]);
		this.merge(totalGeometry, bottomGeometry, 1, [{
			x: 0,
			y: -0.5,
			z: 0
		}]);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z
			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-1 - this.difficult*Math.random();			
			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width-1 - this.difficult*Math.random();			
			}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
		 
	},
	_createCube7: function() {
		//fix
		this.cubeStyle = [{
				width: 5,
				height: 2,
				deep: 4,
			},
			{
				width: 4.8,
				height: 2,
				deep: 3.8,
			}
		];
		var cubeCreate = this.randomCubeFunc(this.cubeStyle);
		this.config.cubeWidth = cubeCreate.width;
		this.config.cubeHeight = cubeCreate.height;
		this.config.cubeDeep = cubeCreate.deep;
		//加载六个面的纹理贴图
		var texture1 = THREE.ImageUtils.loadTexture('img/box/7/honor-side1.png');
		var texture2 = THREE.ImageUtils.loadTexture('img/box/7/honor-side1.png');
		var texture3 = THREE.ImageUtils.loadTexture('img/box/7/honor-top.png');
		var texture4 = THREE.ImageUtils.loadTexture('img/box/7/honor-top.png');
		var texture5 = THREE.ImageUtils.loadTexture('img/box/7/honor-side.png');
		var texture6 = THREE.ImageUtils.loadTexture('img/box/7/honor-side.png');
		var materialArr = [
			//纹理对象赋值给6个材质对象
			new THREE.MeshPhongMaterial({
				map: texture1
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			}),
			new THREE.MeshPhongMaterial({
				map: texture3
			}),
			new THREE.MeshPhongMaterial({
				map: texture4
			}),
			new THREE.MeshPhongMaterial({
				map: texture5
			}),
			new THREE.MeshPhongMaterial({
				map: texture6
			})
		];
		//6个材质对象组成的数组赋值给MeshFaceMaterial构造函数
		var facematerial = new THREE.MeshFaceMaterial(materialArr);
		var geometry = new THREE.CubeGeometry(cubeCreate.width, cubeCreate.height, cubeCreate.deep)
		var mesh = new THREE.Mesh(geometry, facematerial)
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if(this.cubes.length) {
			var random = Math.random()
			this.cubeStat.currentDir = this.cubeStat.nextDir;
			this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
			mesh.position.x = this.cubes[this.cubes.length - 1].position.x
			mesh.position.y = this.cubes[this.cubes.length - 1].position.y
			mesh.position.z = this.cubes[this.cubes.length - 1].position.z

			switch(true) {
				case this.score > 300:
					this.difficult = 5.5;
					break;
				 
				case this.score > 500:
					this.difficult = 6;
					break;
				case this.score > 550:
					this.difficult = 6.5;
					break;
				default:
					this.difficult = 5;
			}

			if(this.cubeStat.nextDir === 'left') {
				mesh.position.x = this.cubes[this.cubes.length - 1].position.x - this.cubeStyle[1].width-1 -  this.difficult*Math.random();
			} else {
				mesh.position.z = this.cubes[this.cubes.length - 1].position.z - this.cubeStyle[1].width -1-  this.difficult*Math.random();
			}
		}
		this.cubes.push(mesh)
		// 当方块数大于3时，删除前面的方块，因为不会出现在画布中
		if(this.cubes.length > 3) {
			this.scene.remove(this.cubes.shift())
		}
		this.scene.add(mesh)
		// 每新增一个方块，重新计算摄像机坐标
		if(this.cubes.length > 1) {
			this._updateCameraPos()
		}
	},
	_CreateLocal: function(local) {
		var self = this;

		var geometry = new THREE.PlaneGeometry(6, 9, 1, 1);
		var texture = new THREE.TextureLoader();
		texture.load("img/local/" + local + ".png", function(texture) {
			var material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true
			});
			self.localMesh = new THREE.Mesh(geometry, material);
			self.localMesh.rotation.y = Math.PI / 4;
			self.localMesh.position.x = self.jumper.position.x - 2;
			self.localMesh.position.y = 9;
			self.localMesh.position.z = self.jumper.position.z - 2;
			self.localMesh.visible = true;
			self.scene.add(self.localMesh);
		})

	},
	mapUv: function(textureWidth, textureHeight, geometry, faceIdx, x1, y1, x2, y2, flag) {
		var tileUvW = 1 / textureWidth;
		var tileUvH = 1 / textureHeight;
		if(geometry.faces[faceIdx] instanceof THREE.Face3) {
			var UVs = geometry.faceVertexUvs[0][faceIdx * 2];
			if(faceIdx == 4 && !flag) {
				UVs[0].x = x1 * tileUvW;
				UVs[0].y = y1 * tileUvH;
				UVs[2].x = x1 * tileUvW;
				UVs[2].y = y2 * tileUvH;
				UVs[1].x = x2 * tileUvW;
				UVs[1].y = y1 * tileUvH;
			} else {
				UVs[0].x = x1 * tileUvW;
				UVs[0].y = y1 * tileUvH;
				UVs[1].x = x1 * tileUvW;
				UVs[1].y = y2 * tileUvH;
				UVs[2].x = x2 * tileUvW;
				UVs[2].y = y1 * tileUvH;
			}
			var UVs = geometry.faceVertexUvs[0][faceIdx * 2 + 1];
			if(faceIdx == 4 && !flag) {
				UVs[2].x = x1 * tileUvW;
				UVs[2].y = y2 * tileUvH;
				UVs[1].x = x2 * tileUvW;
				UVs[1].y = y2 * tileUvH;
				UVs[0].x = x2 * tileUvW;
				UVs[0].y = y1 * tileUvH;
			} else {
				UVs[0].x = x1 * tileUvW;
				UVs[0].y = y2 * tileUvH;
				UVs[1].x = x2 * tileUvW;
				UVs[1].y = y2 * tileUvH;
				UVs[2].x = x2 * tileUvW;
				UVs[2].y = y1 * tileUvH;
			}
		}
	},
	merge: function merge(totalGeometry, geometry, index, positions) {
		for(var i = 0, len = geometry.faces.length; i < len; ++i) {
			geometry.faces[i].materialIndex = 0;
		}
		var mesh = new THREE.Mesh(geometry);
		for(var i = 0, len = positions.length; i < len; ++i) {
			mesh.position.set(positions[i].x, positions[i].y, positions[i].z);
			mesh.updateMatrix();
			totalGeometry.merge(mesh.geometry, mesh.matrix, index);
		}
	},

	_IfCreateLocal: function() {
		var self = this;
		// if(typeof(self.localMesh)=="object"){self.localMesh.visible=false; return false; }

		if(self.boxNum == 16) {

			self._CreateLocal("London");
		}
		if(self.boxNum == 46) {
			self._CreateLocal("India");
		}
		if(self.boxNum == 76) {
			self._CreateLocal("malaysia");
		}
		if(self.boxNum == 106) {
			self._CreateLocal("SouthEast-Asia");
		}
		if(self.boxNum == 136) {
			self._CreateLocal("Paris");
		}
		if(self.boxNum == 166) {
			self._CreateLocal("Dubai");
		} else
        if(self.boxNum==196){
        	self._CreateLocal("sa");
        }

		 {
			if(self.localMesh) {
				self.localMesh.visible = false;
			}

		}

	},
	_getInfo: function(boxNum) {
		var self = this;
		switch(true) {
			case boxNum == 2:
				info = "Hi, I'm the new honor flagship phone! Are you ready for an Aurora Tour? Try pressing the screen.";
				break;
			case boxNum == 3:
				info = "Good job! You've taken the first step.";
				break;
			case boxNum == 4:
				info ="Wow, you've got the hang of it! Keep calm and carry on." ;
				break;
			case boxNum == 11:
				info = "You’ve passed 35% players. Take a breath! ";
				break;
			case boxNum == 21:
				info = "Wanna be the first to win a honor 10? "; 
				break;
            case boxNum == 31:
				info = " Stay tuned to the 5/15 'Beauty in AI' launch event. Gonna be cooler than ever! ";
				break;

			case boxNum == 51:
				info = "You are ahead of 50% players! Hang in there!";
				break;
			case boxNum == 61:
				info = "Awesome! 80% players are behind you.";
				break;
			case boxNum == 71:
				info = "You are really good at this! ";
				break;
			case boxNum == 81:
				info = "Your victory is just around the corner! ";
				break;
			case boxNum == 16:
				info = "Hi London, see you on 5/15. Save the date! ";
				break;
			case boxNum == 46:
				info = "Hello India, looking forward to the 5/15 launch event?";
				break;
			case boxNum == 76:
				info = "Can’t wait to see ya, Malaysia!";
				break;
			case boxNum == 106:
				info = "Let’s rock in Southeast Asia!";
				break;
			case boxNum == 136:
				info = "Paris is always a good idea.";
				break;
			case boxNum == 166:
				info = "Hey, friends in United Arab Emirates. How’s it going? ";
				break;
			case boxNum==196:
			info="Wait for me, Saudi Arabia!";

			default:
				undefined;

		}
		return info;

	},
	_reInfo: function() {
		var self = this;
		var appearLocal = [2, 3, 4, 11, 21,31, 51, 61, 71, 81, 16, 46, 76, 106, 136, 136, 166,196];
		if(appearLocal.indexOf(self.boxNum) !== -1) {
			$(".local-info").fadeIn();

			$(".local-info .local-info-content").html(self._getInfo(self.boxNum));

		} else {
			$(".local-info").fadeOut();
		}

	},
	_reHonorInfo: function(boxNum) {

	},
	// _createText: function(message, parameters) {
	// 	var spritey = this.makeTextSprite("Oops! Don’t worry. Honor phones never break. Play again! Get first-hand info and win more prizes at the 5/15 live stream on hihonor.com! ");
	// 	var pos = this.jumper.position;
	// 	spritey.position.set(pos.x, pos.y + 7, pos.z);
	// 	this.scene.add(spritey);
	// 	this.scene.add(spritey);
	// },
	_render: function() {
		this.renderer.render(this.scene, this.camera)
	},
	_setLight: function() {
		var directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
		directionalLight.position.set(2, 3, 1)
		directionalLight.shadowCameraVisible = true
		this.scene.add(directionalLight)

		var light = new THREE.AmbientLight(0xffffff, 0.3)
		this.scene.add(light)

		// var spotLight=new THREE.SpotLight(0xffffff);
		// spotLight.castShadow=true;
		// spotLight.shadowCameraVisible = true;
		//     spotLight.position.set(100,100,100);
		//     spotLight.shadowMapWidth = spotLight.shadowMapHeight = 1024*4;
		//     this.scene.add(spotLight);
	},
	_setCamera: function() {
		this.camera.position.set(120, 120, 120)
		this.camera.lookAt(this.cameraPos.current)
	},
	_setRenderer: function() {
		this.renderer.setSize(this.size.width, this.size.height)
		this.renderer.setClearColor(this.config.background, 0.0)
		document.body.appendChild(this.renderer.domElement)
	},
	_setSize: function() {
		this.size.width = window.innerWidth,
			this.size.height = window.innerHeight
	},
	playMuicFall: function() {
	 
		this.music.fall_failed[0].play();
	 
	},
	playMuicSuccess: function() {
		var self = this;
		this.music.fall_success_normal[0].play();
	 

	},
	_musicPower: function() {
		if(ifMusicPlay==true){
			var self = this;
		this.music.power_increase[1].pause();
		this.music.power_increase[0].play();
		}else{
			return false;
		}
		

		// this.music.power_increase[1].addEventListener("ended", playNext);

		// function playNext() {
		// 	var increaseStill = self.music.power_increase[1];
		// 	increaseStill.play();
		// 	return false;
		// }
	},
	getAudio: function() {

		this.music.fall_failed = [new Audio("./music/fall-failed.mp3")];
		this.music.fall_failed[0].setAttribute("onplay", "this.currentTime=0");
        this.music.fall_failed[0].volumn=0;
		this.music.fall_success_normal = [new Audio("./music/fall-success-normal.mp3")];
		this.music.fall_success_normal[0].setAttribute("onplay", "this.currentTime=0");
        this.music.fall_success_normal[0].volumn=0;
		// this.music.jump_start=[new Audio("./music/jump-start.mp3")];
		this.music.power_increase = [new Audio("./music/power-increase.mp3"),

			new Audio("./music/power-increase-still.mp3")
		];
		this.music.power_increase[0].setAttribute("onplay", "this.currentTime=0");
		this.music.power_increase[0].volumn=0;
		this.music.power_increase[1].setAttribute("onplay", "this.currentTime=0");
		this.music.background = [new Audio("./music/jump-background.mp3")];
	},
	setCookie:function(cname,cvalue,exdays)        
			{       
			var d = new Date();        
			d.setTime(d.getTime()+(exdays*24*60*60*1000));        
			var expires = "expires="+d.toGMTString();        
			document.cookie = cname + "=" + cvalue + "; " + expires;        
			}
}