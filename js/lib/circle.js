function Circle({x, y}, r, otherProperties = {}) {
	this.pos = {x, y};
	this.vel = {x: 0, y: 0};
	this.ang = {pos: 0, vel: 0};
	this.radius = r;
	this.mass =  Math.PI * r*r;
	this.gravity = this.mass * World.G;
	this.restitution = 0;
	this.friction = 0.6;
	this.locked = false;
	this.collLayers = 1;
	this.hasBounced = false;
	this.isRemoved = true;
	Object.assign(this, otherProperties);
}
//Math.cos = function(x) {
//	return Math.sqrt(1 - Math.pow(Math.sin(x), 2));
//}

Circle.objs = [];
Circle.takenIds = [];

Circle.generateID = function() {
	return Math.floor(Math.random() * 1e15);
}
Circle.add = function({x, y}, r, otherProperties = {}) {
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
	Circle.takenIds.splice(Circle.takenIds.indexOf(toRemove.meta.id), 1);
	toRemove.isRemoved = true;
} 

Object.defineProperty(Circle.prototype, "angle", {
	get: function get() {
		if (isNaN(this.vel.y / this.vel.x)) return 0;
		return Math.atan2(this.vel.y, this.vel.x);
	}
});
Object.defineProperty(Circle.prototype, "speed", {
	get: function get() {
		if (this.locked) return 0;
		return Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
	}
});

Circle.prototype.isCollidingWith = function(other, ease = 0) {
	if (!(this.collLayers & other.collLayers)) return false;
	let xdiff, ydiff;
	xdiff = other.pos.x - this.pos.x;
	ydiff = other.pos.y - this.pos.y;
	return this.radius + other.radius + ease > this.distanceTo(other);
}
Circle.prototype.angleTo = function(other) {
	let xdiff, ydiff;
	if (other.pos) {
		xdiff = other.pos.x - this.pos.x;
		ydiff = other.pos.y - this.pos.y;
	} else {
		xdiff = other.x - this.pos.x;
		ydiff = other.y - this.pos.y;
	}
	if (ydiff == 0 && xdiff == 0) return 0;
	return Math.atan2(ydiff, xdiff);
}
Circle.prototype.distanceTo = function(other) {
	let xdiff, ydiff;
	if (other.pos) {
		xdiff = other.pos.x - this.pos.x;
		ydiff = other.pos.y - this.pos.y;
	} else {
		xdiff = other.x - this.pos.x;
		ydiff = other.y - this.pos.y;
	}
	return Math.sqrt(xdiff * xdiff + ydiff * ydiff);
}
Circle.prototype.setSpeedAtAngle = function(angle, speed) {
	if (this.locked) return;
	const speedAtAngle = this.getSpeedAtAngle(angle);
	this.vel.x += Math.cos(angle) * (speed - speedAtAngle);
	this.vel.y += Math.sin(angle) * (speed - speedAtAngle);
}
Circle.prototype.getSpeedAtAngle = function(angle) {
	if (this.locked) return 0;
	return Math.cos(this.angle - angle) * this.speed;
}

Circle.prototype.accelerate = function(angle, speed) {
	if (this.locked) return;
	this.vel.x += Math.cos(angle) * speed;
	this.vel.y += Math.sin(angle) * speed;
}
Circle.prototype.accelerateAngular = function(speed) {
	if (this.locked) return;
	this.ang.vel += speed;
}
Circle.prototype.applyPerpendicularForce = function(mag, angle, distFromCircle = this.radius) {
	if (this.locked) return;
	this.accelerate((angle + Math.PI / 2), mag * World.T / this.mass);
	this.accelerateAngular(mag * World.T / this.mass / distFromCircle);
}
Circle.prototype.applyFriction = function(mag, angle) {
	if (this.locked) return;
	const previousSpeedSign = Math.sign(this.getSpeedAtAngle(angle + Math.PI / 2));
	const previousAngVelSign = Math.sign(this.ang.vel);
	this.applyPerpendicularForce(mag, angle);
	if (Math.abs(previousSpeedSign - Math.sign(this.getSpeedAtAngle(angle + Math.PI / 2))) >= 2) {
		this.setSpeedAtAngle(angle + Math.PI / 2, 0);
	}
	if (Math.abs(previousAngVelSign - Math.sign(this.angVel)) >= 2) {
		this.angVel = 0;
	}
}

Circle.prototype.bounce = function(other) {
	if (this.locked) return;
	const relAngle = this.angleTo(other);
	let collSpeedA = this.getSpeedAtAngle(relAngle),
		collSpeedB = other.getSpeedAtAngle(relAngle);


	const restitution = this.restitution * other.restitution;
	if (isNaN(collSpeedA)) collSpeedA = 0;
	if (isNaN(collSpeedB)) collSpeedB = 0;
	const massSum = this.mass + other.mass;

	let normalForce;
	if (other.locked) {
		this.setSpeedAtAngle(relAngle, -collSpeedA * restitution);
		normalForce = collSpeedA * (1 + restitution) * this.mass;
	} else {
		const elasticSpeedA = ((this.mass - other.mass) * collSpeedA + other.mass * 2 * collSpeedB) / massSum,
			elasticSpeedB = (this.mass * 2 * collSpeedA + (other.mass - this.mass) * collSpeedB) / massSum;

		const inelasticSpeed = (this.mass * collSpeedA + other.mass * collSpeedB) / massSum;

		const bounceSpeedA = elasticSpeedA * restitution + inelasticSpeed * (1 - restitution),
			bounceSpeedB = elasticSpeedB * restitution + inelasticSpeed * (1 - restitution);

		this.setSpeedAtAngle(relAngle, Math.abs(bounceSpeedA) < 0.1 ? 0 : bounceSpeedA);
		other.setSpeedAtAngle(relAngle, Math.abs(bounceSpeedB) < 0.1 ? 0 : bounceSpeedB);
		normalForce = Math.abs(collSpeedA - bounceSpeedA) * this.mass;
	}

	const frictionForce = normalForce * this.friction + other.friction;
	const frictionDir = -Math.sign(this.ang.vel * this.radius - other.ang.vel * other.radius +
		this.getSpeedAtAngle(relAngle + Math.PI / 2) - other.getSpeedAtAngle(-relAngle + Math.PI / 2));
	this.applyPerpendicularForce(frictionForce * frictionDir, relAngle, this.radius, true);
	other.applyPerpendicularForce(frictionForce * frictionDir, -relAngle, other.radius, true);
}
Circle.prototype.fixPos = function() {
	const collidingList = [];
	for (const other of Circle.objs) {
		if (other == this || !this.isCollidingWith(other) || other.hasBounced) continue;
		collidingList.push(other);
	}
	for (const other of collidingList) {
		const relAngle = this.angleTo(other);
		if (!other.locked) {
			const distance = other.radius + this.radius - this.distanceTo(other);
			this.pos.x -= distance * Math.cos(relAngle);
			other.pos.x += distance * Math.cos(relAngle);
			this.pos.y -= distance * Math.sin(relAngle);
			other.pos.y += distance * Math.sin(relAngle);
		} else {
			this.pos.x = other.pos.x - Math.cos(relAngle) * (other.radius + this.radius - 0.5);
			this.pos.y = other.pos.y - Math.sin(relAngle) * (other.radius + this.radius - 0.5);
		}
		this.bounce(other);
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
	return this.gravity / (xdiff * xdiff + ydiff * ydiff);
}
Circle.prototype.attract = function(other) {
	const relAngle = other.angleTo(this);
	const attraction = this.attractionTo(other) * World.T;
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
	if (this.locked) return;
	this.pos.x += this.vel.x * World.T;
	this.pos.y += this.vel.y * World.T;
	this.ang.pos += this.ang.vel * World.T;
	this.calcAttractionAll();
	this.fixPos();
}
Circle.prototype.airResistance = function() {
	this.vel.x *= 0.995;
	this.vel.y *= 0.995;
	this.ang.vel *= 0.995;
}

Circle.updateAll = function() {
	for (o in Circle.objs) {
		Circle.objs[o].hasBounced = false;
	}
	for (o in Circle.objs) {
		Circle.objs[o].move();
	}
	for (o in Circle.objs) {
		Circle.objs[o].airResistance();
	}
}

function movePlayer() {
	for (o in Circle.objs) {
		let other = Circle.objs[o];
		if (other == player.mat || !player.mat.isCollidingWith(other)) continue;
		
	}
}