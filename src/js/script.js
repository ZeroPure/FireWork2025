const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 设定画布大小
function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// 预加载图片
const ImageCache = {
    cache:{},

    preloadImages(paths,callback){
        let loaded = 0;
        const total = paths.length;
        paths.forEach((path) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                this.cache[path] = img;
                loaded++;
                // 全部加载完成后执行回调函数
                if(loaded === total && typeof callback === 'function'){
                    callback();
                }

            };

            // 图片加载失败处理
            img.onerror = () => {
                console.log(`图片加载失败：${path}`);
            };
        })
    },

    // 获取图片
    getImage(path){
        return this.cache[path];
    }
}

// 图片路径
//const imgPaths = ['../../assets/0.png','../../assets/1.png'];
const imgPaths = Array.from({ length: 331 }, (_, i) => `../../assets/${i}.png`);


// 图片预加载
ImageCache.preloadImages(imgPaths,() => {
    console.log('所有图片加载完成');
    tick();
});


// 上升烟花
const Star = {
    particles:[],

    addStars(x,y){
        const hue = Math.random() * 360; // 随机色相
        const saturation = `${50 + Math.random() * 50}%`; // 随机饱和度
        const lightness = `${40 + Math.random() * 20}%`; // 随机亮度

        let py = y;

        if(y > canvas.height - 300){
            py = canvas.height - 300;
        }

        this.particles.push({
            x:x,
            y:canvas.height,
            destY:py,
            speedY: 1,
            alpha: 1,
            hue: hue,
            saturation: saturation,
            lightness: lightness
        })
    },

    drawStars(){
        for(let k = this.particles.length - 1;k >= 0 ;k--){
            const star = this.particles[k];
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, 2 * Math.PI,false)
            ctx.closePath();
            ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}, ${star.lightness}, ${star.alpha})`;
            ctx.fill();

            star.x += (Math.random() > 0.5 ? 0.4 : -0.4); // 水平摆动
            star.speedY += 0.02;
            star.y -= star.speedY;

            // 达到目标高度后爆炸
            if(star.y <= star.destY){
                Spark.addSparks(star.x,star.y,star.hue,star.saturation,star.lightness);
                ImageSpark.addSpark(star.x,star.y);
                this.particles.splice(k,1);
            }
        }
    }
}

// 爆炸烟花
const Spark = {
    // 保存粒子信息
    particles:[],

    addSparks(x,y,hue,saturation,lightness){
        // 初始半径和粒子数量
        const count = 200 + Math.floor(Math.random() * 20);
        const radius = 10;

        for(let i = 0;i < count;i++){
            // 角度和弧度
            const angle = (360 / count) * i;
            const radians = (angle * Math.PI) / 180;

            this.particles.push({
                x: x,
                y: y,
                alpha: 1,// 粒子透明度
                radians: radians, // 弧度
                speed: Math.random(), // 初始速度
                hue: hue,
                saturation: saturation,
                lightness: lightness,
                time: 500 // 持续时间
            })
        }
    },

    drawFire(){

        // 遍历数组绘制粒子
        for(let k = this.particles.length - 1;k >= 0 ;k--){
            const particle = this.particles[k];

            // 使用 hsla() 设置颜色
            const color = `hsla(${particle.hue}, ${particle.saturation}, ${particle.lightness}, ${particle.alpha})`;

            // 绘制粒子
            ctx.beginPath();
            ctx.arc( particle.x, particle.y, 2, 0, 2 * Math.PI,false)
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // 粒子位置
            if(particle.time > 300){
                particle.x += Math.cos(particle.radians) * particle.speed * 2;
                particle.y += Math.sin(particle.radians) * particle.speed * 2;
            }


            if(particle.time <= 300 && particle.time > 200){
                particle.x += Math.cos(particle.radians) * particle.speed * 1.5;
                particle.y += Math.sin(particle.radians) * particle.speed * 1.5 + 0.25;
            }

            if(particle.time <= 200 && particle.time > 100){
                particle.x += Math.cos(particle.radians) * particle.speed;
                particle.y += Math.sin(particle.radians) * particle.speed + 0.35;
            }

            if(particle.time <= 100 && particle.time > 0){
                particle.x += Math.cos(particle.radians) * particle.speed * 0.5;
                particle.y += Math.sin(particle.radians) * particle.speed * 0.5 + 0.45;
            }


            particle.alpha -= 0.0035;
            particle.time -= 1;

            if(particle.alpha <= 0 || particle.time <= 0){
                this.particles.splice(k,1);
            }
        }

        ImageSpark.drawSpark();
    }
}


// 图片爆炸
const ImageSpark = {
    particles:[],

    addSpark(x,y){
        const random = Math.floor(Math.random() * 332);

        const img = ImageCache.getImage(`../../assets/${random}.png`);
        if(!img){
            console.log('获取图片失败');
            return;
        }

        const imgSize = 150; // 图片大小
        const center = imgSize / 2; // 图片中心
        const density = 6; // 粒子间隔

        // 获得图片像素
        ctx.drawImage(img,0,0,imgSize,imgSize);
        const imgData = ctx.getImageData(0,0,imgSize,imgSize);
        ctx.clearRect(0,0,imgSize,imgSize);

        // 图片粒子化
        for(let h = 0;h < imgSize;h+=density){
            for(let w = 0;w < imgSize;w+=density){
                const position = (imgSize * h + w) * 4;
                const r = imgData.data[position];
                const g = imgData.data[position + 1];
                const b = imgData.data[position + 2];
                const a = imgData.data[position + 3] / 255; // 转为 0-1 范围
                if (r + g + b === 0) continue; // 忽略全黑像素

                // 粒子位置
                let px = x + (w - center);
                let py = y + (h - center);

                this.particles.push({
                    x: px,
                    y: py + 150,
                    dy: py,
                    r: r,
                    g: g,
                    b: b,
                    a: 1,
                    upspeed: 3, // 上升速度
                    downspeed: Math.random() * 0.5, // 下落速度
                    isStay: false, // 是否停留
                    stayTime: 25,//停留时间
                    size: 1,
                });
            }
        }
    },


    // 绘制图片粒子
    drawSpark(){
        for(let k = this.particles.length - 1;k >= 0 ;k--){
            const p = this.particles[k];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI,false)
            ctx.closePath();
            ctx.fillStyle = "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.a + ")";
            ctx.fill();

            // 还没到达最高点，继续向上移动
            if(!p.isStay && p.stayTime > 0){
                p.y -= p.upspeed;
                p.upspeed -= 0.03;
            }

            // 如果粒子到达最高点并且还未进入停留状态
            if(p.stayTime > 0 && !p.isStay && p.y <= p.dy){
                p.isStay = true;
            }

            // 粒子停留状态
            if(p.isStay){
                p.stayTime--;
                // 停留状态结束
                if(p.stayTime <= 0){
                    p.isStay = false;
                }
            }

            // 粒子下落
            if(!p.isStay && p.stayTime <= 0){
                p.y += p.downspeed;
                p.a -= 0.005;
            }

            if(p.a <= 0){
                this.particles.splice(k,1);
            }
        }
    }
}


function clickSite(e){
    // 获取鼠标点击的坐标
    let x = e.clientX;
    let y = e.clientY;
    // 绘制
    Star.addStars(x,y);
}

// 渲染更新粒子信息
function tick(){
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 背景颜色（带透明度）
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    Star.drawStars();
    Spark.drawFire();
    requestAnimationFrame(tick);
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('click', clickSite);