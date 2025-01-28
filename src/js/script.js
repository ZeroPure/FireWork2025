const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// 图片数量
const length = 330;
// 图片路径
//const imgPaths = ['../../assets/0.png','../../assets/1.png'];
const imgPaths = Array.from({ length: length }, (_, i) => `../../assets/${i}.png`);
// 目前迭代到的图片索引
var currentIndex = 0;


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

// 上升烟花
const Star = {
    particles:[],

    addStars(x,y){
        const hue = Math.random() * 360; // 随机色相
        const saturation = `${50 + Math.random() * 50}%`; // 随机饱和度
        const lightness = `${40 + Math.random() * 20}%`; // 随机亮度

        let px = x;
        let py = y;

        // 防止越界导致图片超出画布
        if(y > canvas.height - 300){
            py = canvas.height - 300;
        }

        if(y < 300){
            py = 300;
        }

        if(x > canvas.width - 300){
            px = canvas.width - 300;
        }

        if(x < 300){
            px = 300;
        }

        this.particles.push({
            x:px,
            y:canvas.height, // 从底部发射
            destY:py, // 目标高度
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

            // 达到目标高度后爆炸(星花、文字、图片)
            if(star.y <= star.destY){

                Spark.addSparks(star.x,star.y,star.hue,star.saturation,star.lightness);

                setTimeout(()=>{
                    ImageSpark.addSpark(star.x,star.y);
                },200)

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


            particle.alpha -= 0.005;
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
    particleCache:{}, // 缓存图片粒子数据

    preloadImages(callback){
        let loaded = 0;

        for(let i = 0;i < length;i++){
            const img = ImageCache.getImage(`../../assets/${i}.png`);
            if(!img) {
                console.log(`粒子图片${i}加载失败`)
                continue;
            }

            const imgSize = 150; // 图片大小
            const center = imgSize / 2; // 图片中心
            const density = 6; // 粒子间隔

            // 绘制图片并且获得像素数据
            ctx.drawImage(img,0,0,imgSize,imgSize);
            const imgData = ctx.getImageData(0,0,imgSize,imgSize);
            ctx.clearRect(0,0,imgSize,imgSize);

            let pars = [];

            const random = Math.random();

            // 图片粒子化
            // 两种绽放方式
            // 向上绽放
            if(true){
                for(let h = 0;h < imgSize;h+=density){
                    for(let w = 0;w < imgSize;w+=density){
                        const position = (imgSize * h + w) * 4;
                        const r = imgData.data[position];
                        const g = imgData.data[position + 1];
                        const b = imgData.data[position + 2];
                        const a = imgData.data[position + 3] / 255; // 转为 0-1 范围
                        if (r + g + b === 0) continue; // 忽略全黑像素
                        pars.push({
                            offsetX: w - center, // 偏移量
                            offsetY: h - center,
                            r: r,
                            g: g,
                            b: b,
                            a: 1,
                            record: 0,
                            size:1.2, // 粒子大小
                        });
                    }
                }
            }
            // 中心绽放
            // else{
            //     for(let h = 0;h < imgSize;h+=density){
            //         for(let w = 0;w < imgSize;w+=density){
            //             const position = (imgSize * h + w) * 4;
            //             const r = imgData.data[position];
            //             const g = imgData.data[position + 1];
            //             const b = imgData.data[position + 2];
            //             const a = imgData.data[position + 3] / 255; // 转为 0-1 范围
            //             if (r + g + b === 0) continue; // 忽略全黑像素
            //             pars.push({
            //                 offsetX: w - center, // 偏移量
            //                 offsetY: h - center,
            //                 r: r,
            //                 g: g,
            //                 b: b,
            //                 a: 1,
            //                 record: 1,
            //                 size:1.2, // 粒子大小
            //             });
            //         }
            //     }
            // }
            // 缓存粒子数据
            this.particleCache[i] = pars;
            loaded++;
        }

        if(typeof callback === 'function' && loaded === length){
            callback();
        }
    },

    addSpark(x,y){
        // const random = Math.floor(Math.random() * 332);
        const cachedParticles = this.particleCache[currentIndex];

        // 图片索引++
        currentIndex++;
        if(currentIndex >= length){
            currentIndex = 0;
        }

        if(!cachedParticles){
            console.log('图片粒子数据加载失败');
            return;
        }

        cachedParticles.forEach(({offsetX,offsetY,r,g,b,a,record,size}) => {
            // 根据record来选择爆炸方式

            // 冲上绽放
            if(record === 0){
                this.particles.push({
                    x: x + offsetX,
                    y: y + offsetY + 150,
                    dy: y+ offsetY,
                    r: r,
                    g: g,
                    b: b,
                    a: a,
                    record: record,
                    upspeed: 3, // 上升速度
                    downspeed: Math.random() * 0.5, // 下落速度
                    isStay: false, // 是否停留
                    stayTime: 30, // 停留时间
                    size: size,
                })
            }
            // 中心绽放
            else{
                const speed = 0.08;// 初始速度
                let distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
                let speedFactor = distance * speed; // 速度因子
                let vx = (offsetX / distance) * speedFactor;
                let vy = (offsetY / distance) * speedFactor;

                this.particles.push({
                    x:x,
                    y:y,
                    fx:x + offsetX,
                    fy:y + offsetY,
                    vx:vx,
                    vy:vy,
                    r: r,
                    g: g,
                    b: b,
                    a: a,
                    record: record,
                    downspeed: Math.random() * 0.5, // 下落速度
                    isArrive: false, // 是否到达
                    stayTime: 40,  // 停留时间
                    size:size,
                })
            }
        })
    },

    // 冲上绽放方法绘制
    upDrawSpark(k){
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
            p.a -= 0.015;
        }

        // 透明度为0时删除粒子
        if(p.a <= 0){
            this.particles.splice(k,1);
        }
    },

    // 中心绽放方法绘制
    centerDrawSpark(k) {
        const p = this.particles[k];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI, false)
        ctx.closePath();
        ctx.fillStyle = "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.a + ")";
        ctx.fill();

        // 还没到达位置
        if (p.stayTime > 0 && !p.isArrive) {
            // 粒子移动
            p.x += p.vx;
            p.y += p.vy;

            // 不能越界
            if(p.x  > p.fx && p.vx > 0) p.x = p.fx;
            if(p.y  > p.fy && p.vy > 0) p.y = p.fy;
            if(p.x < p.fx && p.vx < 0) p.x = p.fx;
            if(p.y < p.fy && p.vy < 0) p.y = p.fy;

            // 到达位置
            if(p.x === p.fx && p.y === p.fy) p.isArrive = true;

        }
        else if (p.stayTime > 0 && p.isArrive) {
            p.stayTime--;
        }
        else if (p.stayTime <= 0) {
            p.y += p.downspeed;
            p.a -= 0.01;
        }

        // 透明度为0时删除粒子
        if(p.a <= 0){
            this.particles.splice(k,1);
        }
    },

    // 绘制图片粒子
    drawSpark(){
        for(let k = this.particles.length - 1;k >= 0 ;k--){
            if(this.particles[k].record === 0) this.upDrawSpark(k);
            else this.centerDrawSpark(k);
        }
    }
}


// 图片预加载
ImageCache.preloadImages(imgPaths,() => {
    console.log('所有图片加载完成');

    // 图片粒子化预加载
    ImageSpark.preloadImages(() => {
        console.log('所有图片粒子数据加载完成');
        const  loadingDiv = document.querySelector('.loading-init');
        const canvasContainer = document.querySelector('.container-canvas');

        // 隐藏loading动画
        if(loadingDiv){ loadingDiv.style.display = 'none'; }
        if(canvasContainer){ canvasContainer.style.display = 'block'; }

        tick();
    });
});

// 手动模式
function clickSite(e){
    // 获取鼠标点击的坐标
    let x = e.clientX;
    let y = e.clientY;

    // 绘制
    Star.addStars(x,y);
}

// 检查图片是否会重叠(发设多颗星星时)
function isOverlapping(x,y){
    const minDistance = 600; // 最小距离
    for(const star of Star.particles){
        const dx = star.x - x;
        const dy = star.destY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(distance < minDistance){
            return true; // 重叠
        }
    }
    return false; // 不重叠
}

// 自动模式
function auto(){
    // 随机坐标
    const x = Math.pow(Math.random(), 2) * canvas.width;
    const y = Math.pow(Math.random(), 2) * canvas.height;

    // 没发生重叠
    if(!isOverlapping(x,y)){
        Star.addStars(x,y);
    } else{
        // 发生重叠，重新放置
        auto();
    }
}

// 定时器模式
function scheduleFireworks(){
    // 根据随机数决定放几个烟花
    const random = Math.random();
    // 默认放一个
    let fireworkCount = 1;
    // 默认延时
    let delay = 2000;

    // if(random < 0.5){
    //     fireworkCount = 1;
    // }
    // else if(random < 0.75){
    //     fireworkCount = 2;
    // }
    // else{
    //     fireworkCount = 3;
    //     delay = 8000;// 延时加长,因为会卡
    // }


    if(random < 0.5){
        fireworkCount = 1;
    }
    else{
        fireworkCount = 2;
    }


    // 放烟花
    for(let i = 0;i < fireworkCount;i++){
        auto();
    }

    // 根据delay重新调度
    setTimeout(scheduleFireworks,delay)
}

scheduleFireworks();

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