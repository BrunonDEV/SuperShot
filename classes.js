const PLAYER_W = 96;
const PLAYER_H = 75;

class Screen{
	constructor(cnv){
		this.canvas = cnv;
		if(this.canvas != null)
			this.ctx = this.canvas.getContext("2d");
		
		this.resScale = 1; // window rescale factor
		this.resScaleY = 1; // ^ but for Y axes
	}
	
	init(cnv){
		this.canvas = cnv;
		this.ctx = this.canvas.getContext("2d");
	}
	
	w(){
		return this.canvas.width;
	}
	
	h(){
		return this.canvas.height;
	}
}

class World{
	constructor(){
		this.time = 1;
		this.friction = 1;
		
		this.bullets = [];
		this.opponents = [];
		this.powups = [];
		this.flyByes = [];
		
		this.wave = 0;
		this.tenth = 1;
		this.fifth = 1;
		this.second = 1;
		
		this.second2 = 1;
		this.fifth2 = 1;
		
		this.freeze = false;
		
		this.powWaves = [];
		this.powWaves.push(randomInt(5, 9)); // one pow-up between 5th and 9th wave
		
		this.opp = 0;

		this.loading = false;
		
		// bullets "cache"
		
		this.randDir = "";
		
		this.sf1 = 0;
		this.pf1 = 0;
		this.pf1 = 0;
		this.pf2 = 0;
		
		this.bomb_coold = 0;
	}
	
	init(){
		for(var i = 0; i < this.opponents.length; i++){
			this.opponents[i].init();
		}
	}
	
	addBullet(friendly, sx, sy, sw, sh, scale, img, speedx, speedy, pow, func, vars, ndraw){
		this.bullets.push(new Bullet(friendly, sx, sy, sw, sh, scale, img, speedx, speedy, pow, func, vars, ndraw));
		
		//API("bulletAdd", this.wave);
	}
	
	addOpponent(x, y, sx, sy, sw, sh, scale, img, flameoff, cooldown, startcooldown, bullets, start, movement, vars){
		this.opponents.push(new Opponent(x, y, sx, sy, sw, sh, scale, img, flameoff, cooldown, startcooldown, bullets, start, movement, vars));
	}
	
	addPowUp(x, y, speed){
		this.powups.push(new PowUp(x, y, speed));
	}
	
	addFlyBy(startCoold, speed, pow){
		this.flyByes.push(new FlyBy(startCoold, speed, pow));
	}
	
	update(){
		if(this.freeze)
			this.time /= player.slowfactor;
		
		for(var i = 0; i < this.bullets.length; i++){
			if(!this.bullets[i].update()){
				this.bullets.splice(i, 1);
				//API("bulletDel");
				i--;
			}
		}
		for(var i = 0; i < this.opponents.length; i++){
			if(!this.opponents[i].update()){
				this.opponents.splice(i, 1);
				i--;
			}
		}
		for(var i = 0; i < this.powups.length; i++){
			if(!this.powups[i].update()){
				this.powups.splice(i, 1);
				i--;
			}
		}
		for(var i = 0; i < this.flyByes.length; i++){
			if(!this.flyByes[i].update()){
				this.flyByes.splice(i, 1);
				API("flyBy", "die");
				i--;
			}
		}
		
		if(this.opponents.length == 0 && this.loading === false){
			this.newWave();
		}
	}
	
	newWave(){
		this.wave++;
		
		var data = {
			wave: this.wave,
			player_sx: player.speed.x,
			player_sy: player.speed.y,
			player_coold: player.cooldown,
			player_HP: player.HP,
			factors: {
				sf1: this.sf1,
				pf1: this.pf1,
				sf2: this.sf2,
				pf2: this.pf2,
				bomb_coold: this.bomb_coold
			},
			bullets: this.bullets.length
		};

		var obj = this;

		this.loading = true;

		console.log("Wave " + this.wave + " requested.");

		$.when(API("requestNewWave", data, "text")).done(function(data){
			try{
				data = JSON.parse(data);
			} catch(e){
				console.log(e);
				console.log(data);
			}

			if(data.error != "" && data.error != null){
				stopError(data.error);
			}
			else
				console.log("server: OK");

			if(data.debug != null)
				console.log(data.debug);

			// OPPONENTS
			
			obj.sf1 = data.factors.sf1;
			obj.pf1 = data.factors.sf1;
			
			obj.sf2 = data.factors.sf2;
			obj.pf2 = data.factors.pf2;

			obj.bomb_coold = data.factors.bomb_coold;

			var opp = data.opp;
			
			var cooldfactor;

			var sp_img; // img file

			var ss_w, ss_h; // spaceship w and h

			var flameoff = 2; // flame Y offset (depends on spaceship img) (default 2)

			for(var i = 1; i < opp + 1; i++){			
				var rand = randomInt(0, 10);
				
				var bullet;

				var ss_scale = 0.5;
				
				cooldfactor = 160 / obj.sf1;
				
				if((rand <= 4 && obj.wave > 1) || (rand <= 4 && obj.wave > 15)){ // 40%, 40%
					bullet = bulletTypes.doubl;
					
					bullet[0].init(35, 75, -3*world.sf1, -5*world.sf1, 2*world.pf1);
					bullet[1].init(35, 75, 3*world.sf1, -5*world.sf1, 2*world.pf1);

					sp_img = "graph/opp2";

					ss_w = 208;
					ss_h = 168;

					flameoff = 13;
				}
				else if((rand <= 5 && obj.wave >= 5) || (rand <= 6 && obj.wave > 10)){ // 10%, 20%
					if(Math.random()) // 50/50
						obj.randDir = "right";
					else
						obj.randDir = "left";
					
					cooldfactor *= 2; // obj bullet is 2x slower in Y axis than usual
					
					bullet = bulletTypes.red;
					
					bullet[0].init(30, 75, 0, -3*world.sf1, 3*world.pf1, { // ! speedx, speedy, vars !
						relx: 0,
						dir: world.randDir,
						rd: randomFloat(0, 0.1)
					});

					sp_img = "graph/opp3";
					
					ss_scale = 0.6;
					ss_w = 135;
					ss_h = 132;

					flameoff = 25;
				}
				else if(rand == 7 && obj.wave >= 25){ // 10%
					obj.rad = 0;
					obj.crossDist = 0;
					obj.dist = 0;
					
					cooldfactor = 180 / obj.sf2;
					
					bullet = bulletTypes.tracking;
					
					bullet[0].init(12, 75, 0, 0, 3*world.pf2, { // vars
						tracking: 30 / world.sf2,
						rad: 4.71,
						start: 15 / world.sf2,
					});

					sp_img = "graph/opp5";

					ss_w = 99;
					ss_h = 139;

					flameoff = 20;
				}
				else if(rand == 8 && obj.wave >= 15){ // 10%
					bullet = bulletTypes.bomb;
					
					cooldfactor = obj.bomb_coold;
					
					bullet[0].init(30, 75, 0, 0, 3*world.pf1, { // vars
						start: true,
						mass: 0.1,
						frame: 0,
						secImg: getImage("graph/bomb2.png"),
						boomImg: getImage("graph/shockwave.png"),
						duration: 30,
						state: 0,
						boomAnim: 0,
						cX: 0,
						cY: 0,
						stopDraw: false,
						exRadius: 25,
						hurtCoolD: 0,
					});

					sp_img = "graph/opp4";

					ss_w = 195;
					ss_h = 132;

					flameoff = 22;
				}
				else{
					bullet = bulletTypes.straight;
					
					bullet[0].init(30, 75, 0, -5*world.sf1, 3*world.pf1);

					sp_img = "graph/opp1";

					ss_w = 194;
					ss_h = 170;

					flameoff = 4;
				}
				
				var x = randomInt(0, obj.fifth * 5); // opponent's Y speed
				
				if(x > 3)
					x = 3; // max 3
				
				var startcooldown = randomInt(0, 30); // start cooldown, max 0.5s
				
				obj.addOpponent(s.w() / (opp + 1) * i, s.h()/10, 0, 0, ss_w, ss_h, ss_scale*s.resScale, sp_img, flameoff, cooldfactor, startcooldown, bullet, function(e){ // start
					e.velocity.y = e.vars.speed;
				}, function(e){ // update
					if(e.y + e.h >= 250 * s.resScaleY){
						e.velocity.y = e.vars.speed;
					}
					if(e.y < 25*s.resScaleY){
						e.velocity.y = -e.vars.speed;
					}
				},{ // vars
					speed: x
				});
			}

			// FLYBYES

			for(var i = 0; i < data.flyByes.count; i++){
				world.addFlyBy(data.flyByes.coolds[i], data.flyByes.params.speed, data.flyByes.params.pow);
			}
			
			// OTHERS

			eval(data.code);
			
			$("#wave").html(obj.wave);

			if(obj.wave == 30){
				message("you're doing {well}!", 2000, function(){
					message("keep it {up}!", 2500);
				});
			}
			if(obj.wave == 50){
				$.when(API("getBest")).done(function(res){
					if(res < 50){
						message("you've reached {wave 50}!", 200, function(){
							message("now you can start from {wave 25}!", 2500);
						});
					}
				});
			}

			obj.loading = false;

			obj.init();
		});
	}
	
	resize(factorX, factorY, skipXY){
		for(var i = 0; i < this.bullets.length; i++){
			if(!skipXY){
				this.bullets[i].x *= factorX;
				this.bullets[i].y *= factorY;
			}
			
			this.bullets[i].w *= factorX;
			this.bullets[i].h *= factorX;
		}
		for(var i = 0; i < this.opponents.length; i++){
			if(!skipXY){
				this.opponents[i].x *= factorX;
				this.opponents[i].y *= factorY;
			}
			
			this.opponents[i].w *= factorX;
			this.opponents[i].h *= factorX;
		}
		for(var i = 0; i < this.powups.length; i++){
			if(!skipXY){
				this.powups[i].x *= factorX;
				this.powups[i].y *= factorY;
			}
			
			this.powups[i].w *= factorX;
			this.powups[i].h *= factorX;
		}
		for(var i = 0; i < this.flyByes.length; i++){
			if(!skipXY){
				this.flyByes[i].x *= factorX;
				this.flyByes[i].y *= factorY;

				this.flyByes[i].flame.x *= factorX;
				this.flyByes[i].flame.y *= factorY;

				this.flyByes[i].warning.x *= factorX;
				this.flyByes[i].warning.y *= factorY;
			}

			this.flyByes[i].w *= factorX;
			this.flyByes[i].h *= factorX;

			this.flyByes[i].flame.w *= factorX;
			this.flyByes[i].flame.h *= factorX;

			this.flyByes[i].warning.w *= factorX;
			this.flyByes[i].warning.h *= factorX;
		}
	}
}

class Player{
	constructor(auto, screen, x, y, w, h, ndraw){
		if(auto){
			this.w = PLAYER_W;
			this.h = PLAYER_H;
			
			this.x = (screen.w() / 2) - (this.w / 2);
			this.y = screen.h() - (screen.h() / 4);
		}
		else{
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		}
		
		this.img = getImage("graph/ship1.png");
		
		this.flame_img = getImage("graph/flame1.png");
		
		this.velocity = {x: 0, y: 0};
		
		this.flame = false;
		this.flame_frame = 0;
		this.flame_clock = 0;
		this.flame_frame_start_len = 1;
		this.flame_frame_len = 4;

		this.cooldown_clock = 0;
		
		this.maxHP = 100; // 100 is default
		this.HP = 100;

		this.cooldown = 20;
		
		this.slowmode = false;
		
		this.pows = [];
		this.pows_c = [];
		this.pows_started = [];
	}

	// const variables

	get mass() {
        return 0.1;
	}
	
	get speed(){
		return {x: 5, y: 5};
	}

	get slowfactor(){
		return 2.5;
	}

	// functions

	addPowUp(type, coold){
		$.when(API("addPowUp", {type: type, coold: coold}, "JSON")).done(function(res){
			if(res.code != null){
				eval(res.code);
			}
			else{
				stopError(res.error);
			}
		});
	}
	
	draw(){
		s.ctx.drawImage(this.img, 0, 0, 128, 100, this.x, this.y, this.w, this.h);
	}
	
	update(){
		this.draw(); // Spaceship
			
		// CONTROLS
		
		var up_hold = false;
		
		if(keys[38] || keys[87]){ // UP
			if(!this.slowmode)
				this.velocity.y = this.speed.y * s.resScaleY;
			else
				this.velocity.y = (this.speed.y / this.slowfactor) * s.resScaleY;
			
			this.flame = true;
			
			up_hold = true;
		}
		if(keys[40] || keys[83]){ // DOWN
			if(!this.slowmode)
				this.velocity.y = -this.speed.y * s.resScaleY;
			else
				this.velocity.y = (-this.speed.y / this.slowfactor) * s.resScaleY;
		}
		if(keys[39] || keys[68]){ // RIGHT
			if(!this.slowmode)
				this.velocity.x = this.speed.x * s.resScale;
			else
				this.velocity.x = (this.speed.x / this.slowfactor) * s.resScale;
		}
		if(keys[37] || keys[65]){ // LEFT
			if(!this.slowmode)
				this.velocity.x = -this.speed.x * s.resScale;
			else
				this.velocity.x = (-this.speed.x / this.slowfactor) * s.resScale;
		}
		
		if(keys[88] || mouse[0]){ // X (Mouse LB)
			if(this.cooldown_clock <= 0){
				world.addBullet(true, 0, 0, 18, 20, 5*s.resScale, "graph/beam1.png");
				
				world.bullets[world.bullets.length-1].init(this.x + this.w / 2 - 12*s.resScale, this.y - 5*s.resScaleY, 0, 10, 25); // speedx, speedy, pow
				
				world.addBullet(true, 0, 0, 18, 20, 5*s.resScale, "graph/beam1.png");
				
				world.bullets[world.bullets.length-1].init(this.x - this.w / 2 + 12*s.resScale, this.y - 5*s.resScaleY, 0, 10, 25);
				
				this.cooldown_clock = this.cooldown;
			}
		}
		
		if(keys[90] || mouse[2]){ // Z (Mouse RB)
			if(!this.slowmode){
				motionblur_alpha = 0.9;
				motion_blur = true;
			}

			this.slowmode = true;
		}
		else{
			this.slowmode = false;
		}
		
		if(this.cooldown_clock > 0){
			if(!world.freeze)
				this.cooldown_clock -= 1 * world.time;
			else
				this.cooldown_clock -= 1 * world.time * this.slowfactor;
		}
		if(this.cooldown_clock < 0)
			this.cooldown_clock = 0;
		
		// FLAME
		
		if(this.flame){
			s.ctx.drawImage(this.flame_img, 250 * this.flame_frame, 0, 250, 250, this.x-this.w/2-7*s.resScale, this.y-this.h/2+5*s.resScale, this.w*2, this.h*2);
			
			if(this.flame_frame < 5){
				if(this.flame_clock % this.flame_frame_start_len == 0){
					if(up_hold === false && this.flame_frame > 0)
						this.flame_frame--;
					else
						this.flame_frame++;
				}
			}
			else{
				if(this.flame_clock % this.flame_frame_len == 0){
					if(up_hold === false && this.flame_frame > 0)
						this.flame_frame--;
					else
						this.flame_frame++;
				}
			}
			
			this.flame_clock++;
			
			if(this.flame_frame == 0 && up_hold === false){
				this.flame_frame = 0;
				this.flame_clock = 0;
				this.flame = false;
			}
			
			if(up_hold === true && this.flame_frame >= 10)
				this.flame_frame = 6;
		}
		
		// POWER-UPs
		
		for(var i = 0; i < this.pows.length; i++){
			if(world.freeze == false && this.pows[i] == "freeze"){
				world.freeze = true;

				$.when(API("confirmPowUp", this.pows[i], "text")).done(function(res){
					if(res != null && res != ""){
						stopError(res);
					}
				});

				absolute_sounds.timedown.play();
			}
			else if(this.pows_started[i] !== true){
				$.when(API("confirmPowUp", this.pows[i], "text")).done(function(res){
					if(res != null && res != ""){
						stopError(res);
					}
				});

				this.pows_started[i] = true;
			}

			if(this.pows[i] == "rapidfire"){
				player.cooldown = 12; // faster
			}
			
			if(this.pows_c[i] <= 0){
				if(this.pows[i] == "freeze"){
					world.freeze = false;
					
					absolute_sounds.timeup.play();
				}
				else if(this.pows[i] == "rapidfire"){
					player.cooldown = 20; // default
				}

				API("deletePowUp", this.pows[i]);
				
				this.pows.splice(i, 1);
				this.pows_c.splice(i, 1);
				this.pows_started.splice(i, 1);
			}
			else if(world.opponents.length > 0){
				if(world.freeze){
					this.pows_c[i] -= 1 * (world.time * this.slowfactor);
				}
				else{
					this.pows_c[i] -= 1 * world.time;
				}
			}
		}
		
		if(this.HP > this.maxHP)
			this.HP = this.maxHP;
		
		// POSITION etc
		
		this.x += this.velocity.x * (60 / FPS);
		this.y -= this.velocity.y * (60 / FPS); // inverted because up = forward
		
		if(this.velocity.x > 0)
			this.velocity.x -= this.mass * world.friction * s.resScale * (60 / FPS);
		if(this.velocity.y > 0)
			this.velocity.y -= this.mass * world.friction * s.resScaleY * (60 / FPS);
		
		if(this.velocity.x < 0)
			this.velocity.x += this.mass * world.friction * s.resScale * (60 / FPS);
		if(this.velocity.y < 0)
			this.velocity.y += this.mass * world.friction * s.resScaleY * (60 / FPS);
		
		if(this.velocity.x > 0 && this.velocity.x < 0.5*s.resScale)
			this.velocity.x = 0;
		if(this.velocity.y > 0 && this.velocity.y < 0.5*s.resScaleY)
			this.velocity.y = 0;
		if(this.velocity.x < 0 && this.velocity.x > -0.5*s.resScale)
			this.velocity.x = 0;
		if(this.velocity.y < 0 && this.velocity.y > -0.5*s.resScaleY)
			this.velocity.y = 0;
		
		if(this.x < 0)
			this.x = 0;
		if(this.y < 0)
			this.y = 0;
		if(this.x + this.w > s.w())
			this.x = s.w() - this.w;
		if(this.y + this.h > s.h())
			this.y = s.h() - this.h;
		
		// TIME
		
		world.time = (60 / FPS) * Math.abs(Math.max(Math.abs(this.velocity.x) / s.resScale, Math.abs(this.velocity.y) / s.resScaleY)) / 5;
	}
	
	hurt(power){
		this.HP -= power;
		
		var x, y;
		
		for(var i = 0; i < 10*particleMult; i++){
			x = this.x + PLAYER_W*s.resScale/2 + random(-25*s.resScale, 25*s.resScale) + 10*s.resScale;
			y = this.y + PLAYER_H*s.resScale/2 + random(-25*s.resScale, 25*s.resScale);
			particles_obj.spawn(x, y);
		}
		
		if(this.HP <= 0)
			this.die();

		API("playerHurt", power);
		
		sounds.hurt.play();
	}
	
	die(){
		var x, y;
		
		for(var i = 0; i < 20*particleMult; i++){
			x = this.x + PLAYER_W*s.resScale/2 + random(-100*s.resScale, 100*s.resScale);
			y = this.y + PLAYER_H*s.resScale/2 + random(-100*s.resScale, 100*s.resScale);
			particles_obj.spawn(x, y);
		}
		
		//$("body").html("<br /><center><h2 style='color: red; cursor: auto;'>You died.</h1></center>"); // temporary
		
		sounds.hurt2.play();
		
		gameOver();
	}
}

class Bullet{
	constructor(friendly, sx, sy, sw, sh, scale, img, func, ndraw){
		this.id = BULLET_ID;
		BULLET_ID++;
		
		this.friendly = friendly; // if friendly == true it hurts opponents, otherwise player
		
		this.x = 0;
		this.y = 0;
		this.w = sw * scale;
		this.h = sh * scale;
		
		this.scale = scale;
		
		this.sx = sx; // source x
		this.sy = sy; // source y
		this.sw = sw; // source w
		this.sh = sh; // source h
		
		this.img = getImage(img);
		
		this.speedx = 0;
		this.speedy = 0;
		this.power = 0;
		
		this.velocity = {x: 0, y: 0};
		
		this.func = func;
		this.vars = 0;
		
		if(ndraw != null) // if true don't draw
			this.ndraw = ndraw;
		else
			this.ndraw = false;
		
		this.stopColl; // collisions off
		
		this.destroy = false;
	}
	
	init(x, y, speedx, speedy, pow, vars){
		this.x = x;
		this.y = y;

		this.speedx = speedx;
		this.speedy = speedy;
		this.power = pow;
		
		this.velocity = {x: speedx, y: speedy}
		
		this.vars = vars;
	}
	
	draw(){
		s.ctx.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, this.x, this.y, this.w, this.h);
	}
	
	rescale(scale){
		this.scale = scale;
		
		this.w = this.sw * scale;
		this.h = this.sh * scale;
	}
	
	update(){
		if(this.ndraw == false){
			this.draw();
		}

		if(this.destroy)
			return false; // destroy
		
		if(!world.freeze){
			this.x += this.velocity.x * world.time * s.resScale;
			this.y -= this.velocity.y * world.time * s.resScaleY; // inverted because up = forward
		}
		else{
			if(this.friendly){
				this.x += this.velocity.x * world.time * s.resScale * player.slowfactor;
				this.y -= this.velocity.y * world.time * s.resScaleY * player.slowfactor; // inverted because up = forward
			}
			else{
				this.x += this.velocity.x * world.time * s.resScale;
				this.y -= this.velocity.y * world.time * s.resScaleY; // inverted because up = forward
			}
		}
		
		if(this.func != null)
			this.func(this);
		
		if(this.y < 0 - this.h || this.y + this.h > s.h() + this.h || this.x < 0 - 250 || this.x + this.w > s.w() + 250){
			return false; // destroy
		}
		
		if(!this.stopColl){ // collisions
			if(this.friendly){ // hurts opponents
				for(var i = 0; i < world.opponents.length; i++){
					if(intersect(this, world.opponents[i])){
						world.opponents[i].hurt(this.power);
						
						return false; // destroy
						
						break;
					}
				}
			}
			else{ // hurts player
				if(intersect(this, player)){
					player.hurt(this.power);
					
					return false; // destroy
				}
			}
		}
		
		return true;
	}
	
	rep(e, obj){
		this.id = BULLET_ID;
		BULLET_ID++;
		
		this.friendly = e.friendly; // if friendly == true it hurts opponents, otherwise player
		
		if(obj == null)
			obj = {x: 0, y: 0};
		
		this.x = e.x * s.resScale + obj.x;
		this.y = e.y * s.resScaleY + obj.y;
		this.w = e.w;
		this.h = e.h;
		
		this.sx = e.sx; // source x
		this.sy = e.sy; // source y
		this.sw = e.sw; // source w
		this.sh = e.sh; // source h
		
		this.img = e.img;
		
		this.speedx = e.speedx;
		this.speedy = e.speedy;
		this.power = e.power;
		
		this.scale = e.scale;
		
		this.velocity = $.extend(true, {}, e.velocity);
		
		this.func = e.func;
		this.vars = $.extend(true, {}, e.vars);
		
		this.ndraw = e.ndraw;
		this.destroy = e.destroy;
	}
}

class Opponent{
	constructor(x, y, sx, sy, sw, sh, scale, img, flameoff, cooldown, startcooldown, bullets, start, movement, vars){
		this.id = OPPONENT_ID;
		OPPONENT_ID++;
		
		this.x = x;
		this.y = -sh * scale;
		this.w = sw * scale;
		this.h = sh * scale;

		this.scale = (scale/s.resScale); // absolute scale

		if(vars.speed == 0)
			this.destY = (250 - this.h) / 2; // in half a way
		else
			this.destY = 250 - this.h;
		
		this.sx = sx; // source x
		this.sy = sy; // source y
		this.sw = sw; // source w
		this.sh = sh; // source h
		
		this.img = getImage(img + ".png");

		this.flame = {
			img: getImage(img + "_flame.png"),
			offset: flameoff,
			sy: 1,
			stop: false,
			speed: 10,
			flicker_state: true,
			flicker_coold: 0
		};
		
		this.velocity = {x: 0, y: 0};
		
		this.cooldown = cooldown;
		this.cooldown_clock = 0;
		
		this.startcooldown = startcooldown;

		this.floatincooldown = 30;
		
		this.intersect_coold = 0;
		
		this.bullets = bullets;
		
		this.start = start; // start
		this.movement = movement; // function
		this.vars = vars; // variables
		
		this.HP = 100;
		
		this.x -= this.w / 2;

		this.ON = false;

		this.destroy = false;
	}
	
	init(){
		this.start(this);
	}
	
	draw(){
		s.ctx.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, this.x, this.y, this.w, this.h);
	}

	drawFlame(){
		var scale = this.scale * 0.9;

		var w = this.flame.img.width*scale*s.resScale;

		if(this.flame.stop){ // hiding
			if(this.flame.sy > 1)
				this.flame.sy -= this.flame.speed * world.time;
		}
		else{ // revealing
			if(this.flame.sy < this.flame.img.height)
				this.flame.sy += this.flame.speed * world.time;
		}

		if(this.flame.flicker_coold <= 0){
			this.flame.flicker_state = !this.flame.flicker_state;
			this.flame.flicker_coold = 5;
		}
		else
			this.flame.flicker_coold -= 1 * world.time;

		// check limits

		if(this.flame.sy > this.flame.img.height)
			this.flame.sy = this.flame.img.height;
		if(this.flame.sy < 1)
			this.flame.sy = 1;

		// draw

		if(this.flame.flicker_state)
			s.ctx.filter = "saturate(1.5)";

		if(this.flame.sy > 1)
			s.ctx.drawImage(this.flame.img, 0, this.flame.img.height - floor(this.flame.sy), this.flame.img.width, floor(this.flame.sy), this.x + this.w/2 - w/2, this.y + this.flame.offset*s.resScale - floor(this.flame.sy)*scale*s.resScale, w, floor(this.flame.sy)*scale*s.resScale);
	
		if(this.flame.flicker_state){
			s.ctx.filter = "none";
		}
	}
	
	update(){
		if(this.destroy){
			return false; // destroy
		}
			
		if(this.y < this.destY*s.resScaleY && this.ON == false){
			this.y += ((this.destY*s.resScaleY) / this.floatincooldown) * world.time;
			this.flame.stop = false;
		}
		else
			this.ON = true;

		if(graph_quality != 0)
			this.drawFlame(); // flame animation

		this.draw(); // draw spaceship

		if(this.cooldown_clock <= 0 && this.startcooldown <= 0 && this.ON){ // shooting
			for(var i = 0; i < this.bullets.length; i++){
				var newbull = new Bullet();
				newbull.rep(this.bullets[i], this);
				
				newbull.rescale(newbull.scale * s.resScale);
				
				world.bullets.push(newbull);
				//API("bulletAdd");
			}
			
			this.cooldown_clock = this.cooldown;
		}
		else if(this.ON) // cooldown
			this.cooldown_clock -= 1 * world.time;
		
		if(this.startcooldown > 0 && this.ON) // start cooldown
			this.startcooldown -= 1 * world.time;
		
		if(this.ON)
			this.movement(this);
		
		if(this.intersect_coold <= 0){ // collisions
			if(intersect(this, player)){
				player.hurt(20);
			}
			
			this.intersect_coold = 30;
		}
		else
			this.intersect_coold -= 1*world.time;
		
		if(this.ON){ // movement
			this.x += this.velocity.x * world.time * s.resScale;
			this.y -= this.velocity.y * world.time * s.resScaleY; // inverted because up = forward

			if(this.velocity.y < 0)
				this.flame.stop = false;
			else
				this.flame.stop = true;
		}

		return true;
	}
	
	hurt(power){
		this.HP -= power;
		
		if(this.HP <= 0)
			this.die();
		
		var x, y;
		
		for(var i = 0; i < 10*particleMult; i++){
			x = this.x + this.w/2 + random(-25, 25)*s.resScale + 10;
			y = this.y + this.h/2 + random(-25, 25)*s.resScale;
			particles_obj.spawn(x, y);
		}
		
		sounds.hurt.play();
	}
	
	die(){
		if(this.destroy === false){
			var x, y;
			
			for(var i = 0; i < 20*particleMult; i++){
				x = this.x + this.w/2 + random(-100, 100)*s.resScale;
				y = this.y + this.h/2 + random(-100, 100)*s.resScale;
				particles_obj.spawn(x, y);
			}
			
			sounds.hurt2.play();

			var obj = this;
			
			$.when(API("killEnemy", world.wave, "text")).done(function(res){ // random power up
				if(res == '1'){
					world.addPowUp(obj.x + obj.w / 2, obj.y, 3+(world.tenth*0.25));
				}
			});
		}
		
		this.destroy = true;
	}
}

class PowUp{
	constructor(x, y, speed){
		this.id = POWUP_ID;
		POWUP_ID++;
		
		this.x = x;
		this.y = y;
		
		this.velocity = {x: 0, y: speed};
		
		var rand = randomInt(0, 10);
		
		var tsh1; // threshold 1
		
		if(player.HP < player.maxHP / 2)
			tsh1 = 8;
		else
			tsh1 = 4;

		if(rand >= tsh1 * 2){
			this.type = "rapidfire";
			this.pass = false;
			this.cooldown = FPS*10;

			this.img = getImage("graph/pow_rapidfire.png");
			
			this.sw = 150;
			this.sh = 132;
			
			this.scale = 0.30;
			
			this.w = this.sw*this.scale*s.resScale;
			this.h = this.sh*this.scale*s.resScale;
		}
		else if(rand >= tsh1){
			this.type = "freeze";
			this.pass = false;
			this.cooldown = FPS*5;

			this.img = getImage("graph/pow_freeze.png");
			
			this.sw = 173;
			this.sh = 292;
			
			this.scale = 0.20;
			
			this.w = this.sw*this.scale*s.resScale;
			this.h = this.sh*this.scale*s.resScale;
		}
		else{
			this.type = "heal";
			this.pass = true;

			this.img = getImage("graph/pow_heal.png");
			
			this.sw = 277;
			this.sh = 260;
			
			this.scale = 0.20;
			
			this.w = this.sw*this.scale*s.resScale;
			this.h = this.sh*this.scale*s.resScale;
		}
		
		this.x -= this.w / 2; // for appearing in the center of dead opponent
	}
	
	draw(){
		s.ctx.drawImage(this.img, 0, 0, this.sw, this.sh, this.x, this.y, this.w, this.h);
	}
	
	update(){
		this.draw();
		
		this.x += this.velocity.x * world.time * s.resScale;
		this.y += this.velocity.y * world.time * s.resScaleY;
		
		if(this.y + this.h > s.h() + this.h){
			return false; // destroy
		}
		
		if(intersect(this, player)){
			if(this.pass){ // passive power-up
				if(this.type == "heal"){
					if(15 + player.HP < player.maxHP)
						player.HP += 15;
					else
						player.HP = player.maxHP;

					$.when(API("playerHeal")).done(function(res){
						if(res != null && res != ""){
							stopError(res);
						}
					});
					
					sounds.heal.play();
				}
			}
			else // active power-up
				player.addPowUp(this.type, this.cooldown);
			
			return false; // destroy
		}

		return true;
	}
}

class FlyBy{
	constructor(startCoold, speed, pow){ // startCoold in *seconds*
		// general

		this.sw = 88;
		this.sh = 97;
		this.scale = 0.7 * s.resScale;

		this.w = this.sw * this.scale;
		this.h = this.sh * this.scale;

		var rand = randomInt(0, 1);
		
		if(rand == 0){
			this.x = -this.w;
			this.img = getImage("graph/flyBy_toR.png");
			this.dir = "R";
		}
		else{
			this.x = s.w() + this.w;
			this.img = getImage("graph/flyBy_toL.png");
			this.dir = "L";
		}

		//this.y = randomInt(320 * s.resScale, s.h() - this.h - 120 * s.resScaleY);
		this.y = 0; // set later

		this.go = false;
		this.go_coold = FPS; // 1 second

		if(world.wave >= 25)
			this.go_coold = (3*FPS / 4); // 3/4 of a second

		this.go_countdown = this.go_coold;

		this.startCoold = startCoold * FPS; // from seconds to frames

		this.hitted = false;

		// params

		this.params = {
			speed: speed,
			pow: pow
		}

		Object.freeze(this.params); // half-constant

		// warning

		this.warning = {
			img: getImage("graph/flyBy_warn.png"),
			sw: 100,
			sh: 100,
			scale: 0.4 * s.resScale,
			x: 0,
			y: 0, // set later
			state: true,
			stateChangeCountD: FPS / 8 // 1/8 of the second
		};

		this.warning.y -= (this.warning.sh * this.warning.scale) / 2;

		if(this.dir === "R"){
			this.warning.x = 0 + 25*s.resScale;
		}
		else{ // "L"
			this.warning.x = s.w() - this.warning.sw * this.warning.scale - 25*s.resScale;
		}

		// flame

		this.flame = {
			img: getImage("graph/flyBy_flame_toL.png"), // set later
			sw: 53,
			sh: 18,
			scale: 0.6 * s.resScale,
			x: this.x,
			y: 0, // set later
			satd: false, // saturated
			satCoold: FPS / 8,
			satCountD: 0
		};

		this.flame.satCountD = this.flame.satCoold;

		this.flame.w = this.flame.sw * this.flame.scale;
		this.flame.h = this.flame.sh * this.flame.scale;

		if(this.dir === "L"){
			this.flame.x += this.w - 10*s.resScale;
			this.flame.img = getImage("graph/flyBy_flame_toL.png");
		}
		else{ // "R"
			this.flame.x -= this.flame.w - 10*s.resScale;
			this.flame.img = getImage("graph/flyBy_flame_toR.png");
		}

		this.flame.y += this.h / 2 - this.flame.h / 2;
	}

	initPos(){
		if(this.inited !== true){
			this.y = player.y + player.h / 2;

			if(this.y + this.h > s.h())
				this.y = s.h() - this.h;

			if(this.dir === "R" && this.y > s.h() - 110 * s.resScale){
				this.y = s.h() - 250 * s.resScaleY;
			}

			this.warning.y = this.y + this.h / 2;
			this.flame.y = this.y + this.h / 2 - this.flame.h / 2;

			this.inited = true; // once
		}
	}

	draw(){
		if(this.go){
			if(graph_quality != 0){
				// flame
				if(this.flame.satd)
					s.ctx.filter = "saturate(2)";

				s.ctx.drawImage(this.flame.img, 0, 0, this.flame.sw, this.flame.sh, this.flame.x, this.flame.y, this.flame.w, this.flame.h);

				if(this.flame.satd)
					s.ctx.filter = "none";
			}

			if(this.flame.satCountD <= 0){
				this.flame.satd = !this.flame.satd;
				this.flame.satCountD = this.flame.satCoold;
			}
			else
				this.flame.satCountD -= 1 * world.time;

			// spaceship
			s.ctx.drawImage(this.img, 0, 0, this.sw, this.sh, this.x, this.y, this.w, this.h);
		}
	}

	drawWarning(){
		s.ctx.drawImage(this.warning.img, 0, 0, this.warning.sw, this.warning.sh, this.warning.x, this.warning.y, this.warning.sw * this.warning.scale, this.warning.sh * this.warning.scale);
	}

	update(){
		if(this.go){
			if(this.dir === "R"){
				// to the right
				this.x += this.params.speed * world.time * s.resScale;

				this.flame.x += this.params.speed * world.time * s.resScale;
			}
			else{
				// to the left
				this.x -= this.params.speed * world.time * s.resScale;

				this.flame.x -= this.params.speed * world.time * s.resScale;
			}

			if(this.dir === "R" && this.x > s.w() + this.w)
				return false; // destroy
			else if(this.x < 0 - this.w) // "L"
				return false; // destroy

			if(intersect(this, player) && this.hitted === false){
				player.hurt(this.params.pow);

				this.hitted = true;
			}
		}
		else if(this.startCoold <= 0){
			this.initPos(); // once

			if(this.go_countdown > 0){ // flashing warning sign
				if(this.warning.state){
					this.drawWarning();
				}
				if(this.warning.stateChangeCountD <= 0){
					this.warning.state = !this.warning.state;

					this.warning.stateChangeCountD = FPS / 8;
				}
				else{
					this.warning.stateChangeCountD -= 1 * world.time;
				}

				this.go_countdown -= 1 * world.time;
			}
			else
				this.go = true;
		}
		else
			this.startCoold -= 1 * world.time;

		this.draw();

		return true;
	}
}