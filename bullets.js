const bulletTypes = Object.freeze({
	straight: [new Bullet(false, 0, 0, 19, 32, 2, "graph/beam2.png")],
	
	///////////////////////
	
	doubl: [new Bullet(false, 0, 0, 15, 15, 2, "graph/bluecircl.png"),
		new Bullet(false, 0, 0, 15, 15, 2, "graph/bluecircl.png")],
	
	///////////////////////
	
	red: [new Bullet(false, 0, 0, 13, 13, 2, "graph/redcircl.png",
	function(e){
		if(e.vars.relx < -50 * s.resScale){
			e.vars.dir = "right";
		}
		if(e.vars.relx > 50 * s.resScale){
			e.vars.dir = "left";
		}
		
		e.vars.relx += e.velocity.x * world.time * s.resScale;
		
		if(e.vars.dir == "right"){
			e.velocity.x += (0.5 + e.vars.rd) * world.sf1 * world.time * s.resScale;
		}
		else if(e.vars.dir == "left"){
			e.velocity.x -= (0.5 + e.vars.rd) * world.sf1 * world.time * s.resScale;
		}
	})],
	
	///////////////////////
	
	tracking: [new Bullet(false, 0, 0, 19, 18, 1.5, "graph/beam3.png",
	function(e){
		if(e.vars.start > 0){
			e.velocity.y = -5 * world.sf2;
			
			e.vars.start -= 1 * world.time;
		}
		else if(e.vars.tracking > 0){
			var rad = Math.atan2((e.y + e.h / 2) - (player.y + player.h / 2), (e.x + e.w / 2) - (player.x + player.w / 2)); // in radians
			
			if(rad < 0){
				rad = 6.28 + rad;
			}
			e.vars.oldrad = rad;
			
			rad = e.vars.oldrad;
			
			var crossDist = abs(6.28 - max(rad, e.vars.rad) + min(rad, e.vars.rad));
			var dist = abs(rad - e.vars.rad);
			
			if(e.vars.rad > rad && abs(e.vars.rad - rad) > 0.15){
				if(crossDist > dist){
					e.vars.rad -= 0.1 * world.sf2 * world.time;
				}
				else{
					e.vars.rad += 0.1 * world.sf2 * world.time;
				}
			}
			else{
				if(crossDist > dist){
					e.vars.rad += 0.1 * world.sf2 * world.time;
				}
				else{
					e.vars.rad -= 0.1 * world.sf2 * world.time;
				}
			}
			
			if(e.vars.rad > 6.28)
				e.vars.rad = (6.28 - e.vars.rad) * (-1);
			if(e.vars.rad < 0)
				e.vars.rad = 6.28 - e.vars.rad * (-1);
			
			e.vars.tracking -= 1 * world.time;
		}
		
		e.velocity.x = -cos(e.vars.rad) * 5 * world.sf2;
		e.velocity.y = sin(e.vars.rad) * 5 * world.sf2;
		
		s.ctx.drawImage(e.img, e.sx, e.sy, e.sw, e.sh, e.x, e.y, e.w, e.h);
	}, true)], // not default draw()
	
	///////////////////////
	
	bomb: [new Bullet(false, 0, 0, 179, 182, 0.15, "graph/bomb.png",
	function(e){
		if(e.vars.start){
			e.velocity.x = randomInt(-8, 8);
			e.velocity.y = randomInt(-4, -12);
			
			e.vars.start = false;
		}
		
		if(e.velocity.x > 0)
			e.velocity.x -= e.vars.mass * world.time; // slow down
		else
			e.velocity.x += e.vars.mass * world.time; // slow down;
		
		
		if(e.velocity.y < 0)
			e.velocity.y += e.vars.mass * world.time; // -||-
		else
			e.velocity.y = 0;
		
		if(e.vars.frame > e.vars.duration){
			e.vars.frame = 0;
			e.vars.state++;
		}
		
		// animation (ticking)
		
		if(e.vars.frame <= e.vars.duration/2){
			if(!e.vars.stopDraw)
				s.ctx.drawImage(e.img, e.sx, e.sy, e.sw, e.sh, e.x, e.y, e.w, e.h);
		}
		else if(e.vars.frame <= e.vars.duration){
			if(!e.vars.stopDraw)
				s.ctx.drawImage(e.vars.secImg, e.sx, e.sy, e.sw, e.sh, e.x, e.y, e.w, e.h);
		}
		
		if(e.vars.state >= 3){ // BOOM
			e.vars.stopDraw = true;
			e.stopColl = true;
			
			if(e.vars.boomAnim < 70){
				e.vars.cX += 1 * world.time;
				
				if(e.vars.cX >= 5){
					e.vars.cX -= 4;
					e.vars.cY++;
				}
				
				var size = 0.8*s.resScale;
				
				if(!lowExplosion) // high quality (sprite)
					s.ctx.drawImage(e.vars.boomImg, floor(e.vars.cX)*320, e.vars.cY*320, 320, 320, e.x+e.w/2-320*size/2, e.y+e.h/2-320*size/2, size*320, size*320);
				
				if(e.vars.boomAnim < 30){ // collisions
					if(e.vars.boomAnim < 20)
						e.vars.exRadius += 5 * world.time * s.resScale;
					
					if(lowExplosion){ // low quality (circle)
						s.ctx.fillStyle = "rgba(244, 66, 66, 0.3)";
						s.ctx.arc(e.x+e.w/2, e.y+e.h/2, e.vars.exRadius, 0, 2*PI);
						s.ctx.fill();
					}
					
					if(e.vars.hurtCoolD <= 0){
						if(rectCircleColl({x: e.x+e.w/2, y: e.y+e.h/2, r: e.vars.exRadius},
							{x: player.x, y: player.y, w: player.w, h: player.h})){
							
							// hurt player
							player.hurt(e.power * 1.5);
							e.vars.hurtCoolD = 120;
							
							sounds.hurt.play();
						}
					}
					else
						e.vars.hurtCoolD -= 1 * world.time;
				}
			}
			else
				e.destroy = true;
			
			e.vars.boomAnim += 1 * world.time;
		}
		
		e.vars.frame += 1 * world.time;
	}, true)], // true for notdraw
});