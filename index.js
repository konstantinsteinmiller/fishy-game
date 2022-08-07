window.addEventListener('load', () => {
	const context = canvas.getContext('2d')
	canvas.width = 800
	canvas.height = 500
	context.font = '50px Georgia'
	let gameFrame = 0
	let score = 0
	let bubblesList = []
	let canvasPosition = canvas.getBoundingClientRect()
	let gameSpeed = 1
	let isGameOver = false

	let particlesList = []
	let adjustX = 15
	let adjustY = 30
	let letterScale = 5


	const mouse = {
		x: canvas.width/2,
		y: canvas.height/2,
		click: false,
		radius: 100,
	}

	canvas.addEventListener('mousedown',(e) => {
		mouse.click = true
	  mouse.x = Math.floor(e.x - canvasPosition.left)
		mouse.y = Math.floor(e.y - canvasPosition.top)
	})
	canvas.addEventListener('mouseup',(e) => {
		mouse.click = false
	})

	context.fillStyle = 'white'
	context.font = '30px Bangers'
	context.fillText('LEVEL 1', 10, 30)
	const textCoordinates = context.getImageData(0, 0, 150, 30)

	class Particle {
		constructor(x, y) {
			this.x = x
			this.y = y
			this.size = 3
			this.baseX = this.x
			this.baseY = this.y
			this.density = Math.random() * 8 + 1
			this.color = 'rgba(255,255,255,.8)'
			this.distance = 0
		}
		update() {
			let dx = player.x - this.x
			let dy = player.y - this.y
			this.distance = Math.sqrt(dx*dx + dy*dy)
			const forceDirectionX = dx / this.distance
			const forceDirectionY = dy / this.distance
			const maxDistance = player.dRadius
			let force = (maxDistance - this.distance) / maxDistance
			let directionX = forceDirectionX * force * this.density
			let directionY = forceDirectionY * force * this.density

			if (this.distance < player.dRadius) {
				this.x -= directionX
				this.y -= directionY
			} else {
				/* bring back the particles to original position if player not around*/
				if (this.x !== this.baseX) {
					dx = this.x - this.baseX
					this.x -= dx / 10
				}
				if (this.y !== this.baseY) {
					dy = this.y - this.baseY
					this.y -= dy / 10
				}
			}
		}
		draw(context) {
			context.fillStyle = this.color
			context.strokeStyle = 'rgba(34,147,214,1)'
			context.beginPath()

			if (this.distance < player.dRadius - 10) {
				this.size = 13
				context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
				context.stroke()
				context.closePath()
				context.beginPath()
				context.arc(this.x+3, this.y-3, this.size/2.5, 0, Math.PI * 2)
				context.arc(this.x-7, this.y-1, this.size/3.5, 0, Math.PI * 2)
			} else if (this.distance < player.dRadius) {
				this.size = 10
				context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
				context.stroke()
				context.closePath()
				context.beginPath()
				context.arc(this.x-2, this.y-2, this.size/3, 0, Math.PI * 2)
			} else {
				this.size = 8
				context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
				context.stroke()
				context.closePath()
				context.beginPath()
				context.arc(this.x-1, this.y-1, this.size/3, 0, Math.PI * 2)
			}

			context.closePath()
			context.fill()
		}
	}

	class Player {
		constructor(x, y) {
			this.x = x
			this.y = y
			this.radius = 50
			this.dRadius = 100
			this.angle = 0
			this.width = 0
			this.height = 0
			this.frame = 0
			this.frameX = 0
			this.frameY = 0
			this.spriteWidth = 498
			this.spriteHeight = 327
			this.approachRatio = 20
		}
		update() {
			const dx = this.x - mouse.x
			const dy = this.y - mouse.y
			const theta = Math.atan2(dy, dx)
			this.angle = theta
			if (mouse.x !== this.x) {
				this.x -= dx / this.approachRatio
			}
			if (mouse.y !== this.y) {
				this.y -= dy / this.approachRatio
			}
			if (gameFrame % 5 === 0) {
				this.frame++
				if (this.frame >= 12) this.frame = 0
				this.frameX = this.frame % 4
				this.frameY = Math.floor(this.frame / 4)
			}
		}
		draw(context) {
			// if (mouse.click) {
			// 	context.lineWidth = .2
			// 	context.beginPath()
			// 	context.moveTo(this.x, this.y)
			// 	context.lineTo(mouse.x, mouse.y)
			// 	context.stroke()
			// }
			// context.fillStyle = 'red'
			// context.beginPath()
			// context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
			// context.fill()
			// context.closePath()
			// context.fillRect(this.x, this.y, this.radius, 10)

			context.save()
			context.translate(this.x, this.y)
			context.rotate(this.angle)
			if (this.x >= mouse.x) {
				context.drawImage(
					playerImageLeft,
					this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
					0 - 45, 0 - 45, this.spriteHeight/4, this.spriteHeight/4
				)
			}
			else {
				context.drawImage(
					playerImageRight,
					this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
					0 - 45, 0 - 45, this.spriteWidth/4, this.spriteHeight/4
				)
			}
			context.restore()
		}
	}

	const player = new Player(canvas.width, canvas.height/2)

	class Bubble {
	  constructor() {
	    this.x = Math.random() * canvas.width
	    this.y = canvas.height + Math.random() * canvas.height
	    this.radius = 50
	    this.speed = Math.random() * 5 + 1
	    this.distance = -Infinity
			this.wasCountedToScore = false
			this.plopSound = Math.random() <= .5 ? bubblePopSound1 : bubblePopSound2
	  }
	  update() {
			this.y -= this.speed
			const dx = this.x - player.x
			const dy = this.y - player.y
			this.distance = Math.sqrt(dx * dx + dy * dy)
	  }
	  draw(context) {
			// context.fillStyle = 'green'
			// context.beginPath()
			// context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
			// context.fill()
			// context.closePath()
			// context.stroke()

			context.drawImage(
				bubbleImage,
				this.x - 67, this.y - 67, this.radius * 2.7, this.radius * 2.7,
			)
	  }
	}

	const handleBubbles = () => {
		if (gameFrame % 50 === 0) {
			bubblesList.push(new Bubble())
		}
	
		bubblesList = bubblesList.filter(bubble => {
			bubble.update()
			bubble.draw(context)

			const hasBubbleLeftScreen = bubble.y > 0 - bubble.radius * 2
			const isBubbleColliding = bubble.distance < bubble.radius + player.radius
			if (isBubbleColliding) {
				if (!bubble.wasCountedToScore) {
					bubble.plopSound ? bubble.plopSound.play() : ''
					score++
					bubble.wasCountedToScore = true
				}
			}
			return hasBubbleLeftScreen && !isBubbleColliding
		})
	}

	const BG = {
		x1: 0,
		x2: canvas.width,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	}

	const handleBackground = () => {
		BG.x1 -= gameSpeed
		BG.x2 -= gameSpeed
		if (BG.x1 < -BG.width) BG.x1 = BG.width
		if (BG.x2 < -BG.width) BG.x2 = BG.width
		context.drawImage(backgroundImage, BG.x1, BG.y, BG.width, BG.height)
		context.drawImage(backgroundImage, BG.x2, BG.y, BG.width, BG.height)
	}

	class Enemy {
	  constructor() {
	    this.x = canvas.width + 200
	    this.y = Math.random() * (canvas.height - 150) + 90
	    this.radius = 60
	    this.speed = Math.random() * 2 + 2
	    this.frame = 0
	    this.frameX = 0
	    this.frameY = 0
	    this.spriteWidth = 498
	    this.spriteHeight = 327
	  }
	  update() {
			this.x -= this.speed
			if (this.x < 0 - this.radius * 2) {
				this.x = canvas.width + 200
				this.y = Math.random() * (canvas.height - 150) + 90
				this.speed = Math.random() * 2 + 2
			}
			if (gameFrame % 5 === 0) {
				this.frame++
				if (this.frame >= 12) this.frame = 0
				this.frameX = this.frame % 4
				this.frameY = Math.floor(this.frame / 4)
			}
			
			// collision with player
			const dx = this.x - player.x
			const dy = this.y - player.y
			const distance = Math.sqrt(dx*dx + dy*dy)
			if (distance < this.radius + player.radius) {
				isGameOver = true
			}
	  }
	  draw(context) {
			// context.fillStyle  = 'red'
			// // context.fillStyle = 'green'
			// context.beginPath()
			// context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
			// context.fill()
			// context.closePath()
			// context.stroke()
			context.drawImage(
				enemyLeftImage,
			  this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,
			  this.x - 60, this.y - 60, this.spriteHeight/3, this.spriteHeight/3
			)
	  }
	}

	const enemy1 = new Enemy()
	const handleEnemies = () => {
		enemy1.update()
		enemy1.draw(context)
	}

	const handleGameOver = () => {
		context.fillStyle = 'black'
		context.font = '40px Bangers'
		context.fillText(`GAME OVER, you reached score: ${score}`, 130, 250)
		context.fillStyle = 'white'
		context.fillText(`GAME OVER, you reached score: ${score}`, 132, 252)
	}
	const init = () => {
		/* each pixel is spread over 4 indexes and form up rgba value
		 * for one pixel with 0-255 clamped value, therefore its neccessary to convert
		 * alpha to 0...1 value
		 */
		for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
			for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
				if (textCoordinates.data[(y*4*textCoordinates.width) + (x*4) + 3] > 128) {
					let positionX = x + adjustX
					let positionY = y + adjustY
					particlesList.push(new Particle(positionX * letterScale, positionY * letterScale))
				}
			}
		}
	}
	init()

	const handleParticles = () => {
		particlesList.forEach(particle => {
			particle.update()
			particle.draw(context)
		})
	}

	const animate = () => {
		context.clearRect(0, 0, canvas.width, canvas.height)

		handleBackground()
		handleParticles()
		handleBubbles()

		//draw
		player.update()
		player.draw(context)
		handleEnemies()
		gameFrame++

		context.fillStyle = 'black'
		context.fillText(`Score: ${score}`, 10, 30)
		context.fillStyle = 'white'
		context.fillText(`Score: ${score}`, 12, 32)

		isGameOver && handleGameOver()
		!isGameOver && requestAnimationFrame(animate)
	}
	animate(0)

	window.addEventListener('resize', () => {
		canvasPosition = canvas.getBoundingClientRect()
		canvas.width = 800
		canvas.height = 500
	})
})

