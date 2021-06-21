function Circle({x, y}, r, otherProperties={}) {
	this.pos = {x, y};
	this.vel = {x: 0, y: 0};
	this.ang = {pos: 0, vel: 0};
	this.radius = r;
	this.mass = otherProperties.mass ?? Math.PI * r*r;
	this.gravity = otherProperties.gravity ?? this.mass*World.G;
	this.restitution = otherProperties.restitution || 0;
	this.Fstatic = otherProperties.staticFriction ?? 0.4;
	this.Fsliding = otherProperties.slidingFriction ?? 0.2;
	this.locked = otherProperties.locked || false;
	this.collLayers = otherProperties.collisionLayers || ["a"];
	this.meta = otherProperties.meta;
	this.hasBounced = false;
	this.isRemoved = true;
}
//Math.cos = function(x) {
//	return Math.sqrt(1 - Math.pow(Math.sin(x), 2));
//}

Circle.objs = [];
Circle.takenIds = [];

Circle.generateID = function() {
	return Math.floor(Math.random()*1e15)
}
Circle.add = function({x, y}, r, otherProperties={}) {
	otherProperties.meta = otherProperties.meta || {};
	otherProperties.meta.id = 0;
	while (Circle.takenIds.includes(otherProperties.meta.id)) {
		otherProperties.meta.id = Circle.generateID();
	}
	Circle.takenIds.push(otherProperties.meta.id);
	let returnObj = new Circle({x, y}, r, otherProperties);
	Circle.objs.push(returnObj);
	return returnObj;
}
Circle.remove = function(toRemove) {
	Circle.objs.splice(Circle.objs.indexOf(toRemove), 1);
	Circle.takenIds.splice(Circle.takenIds.indexOf(toRemove.meta.id), 1)
	toRemove.isRemoved = true;
} 

Object.defineProperty(Circle.prototype, "angle", {
	get: function get() {
		if (isNaN(this.vel.y/this.vel.x)) return 0;
		let testVal = this.vel.y/this.vel.x;
		return -Math.atan2(this.vel.x, this.vel.y) + (Math.PI/2);
	}
});
Object.defineProperty(Circle.prototype, "speed", {
	get: function get() {
		if (this.locked) return 0;
		return Math.sqrt(this.vel.x*this.vel.x + this.vel.y*this.vel.y);
	}
})

Circle.prototype.isCollidingWith = function(other) {
	let xdiff, ydiff;
	xdiff = other.pos.x - this.pos.x;
	ydiff = other.pos.y - this.pos.y;
	return this.radius + other.radius >= Math.sqrt(xdiff*xdiff + ydiff*ydiff);
}
Circle.prototype.angleTo = function(other) {
	if (other.pos) {
		xdiff = other.pos.x - this.pos.x;
		ydiff = other.pos.y - this.pos.y;
	} else {
		xdiff = other.x - this.pos.x;
		ydiff = other.y - this.pos.y;
	}
	if (ydiff == 0 && xdiff == 0) return 0;
	return -Math.atan2(xdiff, ydiff) + (Math.PI/2);
}
Circle.prototype.accelerate = function(angle, speed) {
	if (this.locked) return;
	//console.log(angle, speed);
	//console.log(Math.cos(angle)*speed, Math.sin(angle)*speed)
	this.vel.x += Math.cos(angle)*speed;
	this.vel.y += Math.sin(angle)*speed;
}
Circle.prototype.bounce = function(other) {
	let relAngle = this.angleTo(other);
	let collAngleA = relAngle;
		collAngleB = -relAngle;
	let collSpeedA = Math.cos(this.angle-collAngleA)*this.speed,
		collSpeedB = Math.cos(other.angle-collAngleB)*other.speed;

	if (isNaN(collSpeedA)) collSpeedA = 0;
	if (isNaN(collSpeedB)) collSpeedB = 0;
	//console.log(collSpeedA, collSpeedB)
	let massSum = this.mass + other.mass;

	//if (other.locked) {
	//console.log(collSpeedA*(1 + other.restitution))
	this.accelerate(collAngleA, -collSpeedA*(1 + other.restitution));
	return collSpeedA; // return normal force
	//} else {
	//	let outSpeedA = ((this.mass - other.mass)*collSpeedA*other.restitution + other.mass*2*collSpeedB*this.restitution)/massSum,
	//		outSpeedB = (this.mass*2*collSpeedA*other.restitution + (other.mass - this.mass)*collSpeedB*this.restitution)/massSum;
	//
	//	//console.log(-collSpeedA, -collSpeedB)
	//	console.log(collAngleA, this.angle, (this.angle + Math.PI - collAngleA*2)/Math.PI*180);
	//	this.accelerate(this.angle + Math.PI - collAngleA*2, collSpeedA - outSpeedA);
	//	other.accelerate(-other.angle + Math.PI - collAngleB*2, collSpeedB - outSpeedB);
	//	console.log(this.vel);
	//}
}
Circle.prototype.fixPos = function() {
	if (this.locked) return;
	for (o in Circle.objs) {
		let other = Circle.objs[o];
		if (other == this || !this.isCollidingWith(other) || other.hasBounced) continue;
		let normalForce = this.bounce(other);
		let relAngle = this.angleTo(other);
		this.pos.x = other.pos.x - Math.cos(relAngle)*(other.radius+this.radius-0.5);
		this.pos.y = other.pos.y - Math.sin(relAngle)*(other.radius+this.radius-0.5);
		let static = other.Fstatic*normalForce*this.radius;
		let sliding = other.Fsliding*normalForce*this.radius;
		let angVel = this.ang.vel;
		let linVel = angVel*this.radius;
		let perpenVel = Math.cos(this.angle-relAngle+Math.PI/2)*this.speed;
		let onGroundVel = perpenVel - linVel;

		if (onGroundVel > static) {
			let sign = onGroundVel/Math.abs(onGroundVel);
			onGroundVel = sign*Math.max(0, Math.abs(onGroundVel) - sliding);
			this.ang.vel = (onGroundVel + linVel) / this.radius;
		} else {
			this.ang.vel = perpenVel/this.radius;
		}

		let fAccel = perpenVel - linVel;
		if (Math.abs(fAccel) > static) {
			this.accelerate(relAngle+Math.PI/2, sliding * fAccel/Math.abs(fAccel/2.5));
		} else {
			this.accelerate(relAngle+Math.PI/2, fAccel * 0.4);
		}
	}
	this.hasBounced = true;
}
Circle.prototype.attractionTo = function(other) {
	let xdiff, ydiff;
	if (other.pos) {
		xdiff = other.pos.x - this.pos.x;
		ydiff = other.pos.y - this.pos.y;
	} else {
		xdiff = other.x - this.pos.x;
		ydiff = other.y - this.pos.y;
	}
	return this.gravity/(xdiff*xdiff + ydiff*ydiff)*100;
}
Circle.prototype.attract = function(other) {
	let relAngle = other.angleTo(this);
	let attraction = this.attractionTo(other);
	other.accelerate(relAngle, attraction);
}
Circle.prototype.calcAttractionAll = function() {
	if (this.locked) return;
	for (o in Circle.objs) {
		let other = Circle.objs[o];
		if (other == this) continue;
		other.attract(this);
	}
}
Circle.prototype.move = function() {
	this.pos.x += this.vel.x*World.T;
	this.pos.y += this.vel.y*World.T;
	this.ang.pos += this.ang.vel*World.T;
	this.calcAttractionAll();
	this.fixPos();
}

Circle.updateAll = function() {
	for (o in Circle.objs) {
		Circle.objs[o].hasBounced = false;
	}
	for (o in Circle.objs) {
		Circle.objs[o].move();
	}
	//console.log(player.mat.vel.y);
}

function movePlayer() {
	for (o in Circle.objs) {
		let other = Circle.objs[o];
		if (other == player.mat || !player.mat.isCollidingWith(other)) continue;
		
	}
}