// 1. Firebase 配置 (请从 Firebase 控制台仔细复制你的真实配置!)
const firebaseConfig = {
    apiKey: "AIzaSyDRmJacRW0A1YPG41RQxjQK0GbZb1Rj4aE",
    authDomain: "my-sillytrvean-project.firebaseapp.com",
    databaseURL: "https://my-sillytrvean-project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-sillytrvean-project",
    storageBucket: "my-sillytrvean-project.firebasestorage.app",
    messagingSenderId: "999192617156",
    appId: "1:999192617156:web:98c606748ec3fd54c46991",
    measurementId: "G-TXBVG9EGWQ"
};

// 2. 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. 轮播图逻辑
const carousels = {}; // 用于存储每个轮播图的状态和定时器

function showSlide(moduleId, index) {
    const carousel = carousels[moduleId];
    if (!carousel || !carousel.images || carousel.images.length === 0) {
        // console.warn(`Carousel or images not found for ${moduleId}`);
        return;
    }

    const totalImages = carousel.images.length;

    if (index >= totalImages) {
        carousel.currentIndex = 0; // 循环到第一张
    } else if (index < 0) {
        carousel.currentIndex = totalImages - 1; // 循环到最后一张
    } else {
        carousel.currentIndex = index;
    }
    const offset = -carousel.currentIndex * 100; // 移动百分比
    carousel.slideElement.style.transform = `translateX(${offset}%)`;
}

function changeSlide(moduleId, step) {
    const carousel = carousels[moduleId];
    if (!carousel) return;
    showSlide(moduleId, carousel.currentIndex + step);
    resetAutoplay(moduleId); // 点击按钮后重置自动播放计时器
}

function startAutoplay(moduleId) {
    const carousel = carousels[moduleId];
    if (!carousel || carousel.images.length <= 1) return; // 如果只有一张或没有图片，不自动播放

    carousel.intervalId = setInterval(() => {
        changeSlide(moduleId, 1);
    }, 2000); // 每n秒切换一次
}

function stopAutoplay(moduleId) {
    const carousel = carousels[moduleId];
    if (carousel && carousel.intervalId) {
        clearInterval(carousel.intervalId);
    }
}

function resetAutoplay(moduleId) {
    stopAutoplay(moduleId);
    startAutoplay(moduleId);
}

document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有轮播图
    document.querySelectorAll('.work-module').forEach(module => {
        const moduleId = module.id;
        const slideElement = module.querySelector('.carousel-slide');
        const images = module.querySelectorAll('.carousel-slide img');
        const container = module.querySelector('.carousel-container');

        if (!slideElement || images.length === 0) {
            // console.warn(`Carousel slide or images not found for module: ${moduleId}`);
            return; // 如果没有图片或slide元素，跳过此模块的轮播图设置
        }

        carousels[moduleId] = {
            currentIndex: 0,
            slideElement: slideElement,
            images: images,
            intervalId: null
        };
        showSlide(moduleId, 0); // 初始化显示第一张图

        if (images.length > 1) { // 只有多于一张图片时才启动自动播放和交互
            startAutoplay(moduleId);

            // 鼠标悬停时停止自动播放，移开时恢复
            if (container) {
                container.addEventListener('mouseenter', () => stopAutoplay(moduleId));
                container.addEventListener('mouseleave', () => startAutoplay(moduleId));
            }
        }
    });

    // 下载统计逻辑 (这部分你的代码基本没问题, 主要是Firebase配置)
    const downloadButtons = document.querySelectorAll('.download-button');
    downloadButtons.forEach(button => {
        const workId = button.dataset.workid; // 这个是 'work1_download', 'work2_download' 等
        const countElement = document.getElementById(`count-${workId}`);

        if (!workId) {
            console.warn("Button missing data-workid:", button);
            return;
        }

        // 初始化时获取下载次数
        const countRef = database.ref(`downloadCounts/${workId}`);
        countRef.on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            if (countElement) {
                countElement.textContent = `下载次数: ${count}`;
            }
        }, (error) => {
            console.error(`Error fetching count for ${workId}:`, error);
            if (countElement) {
                countElement.textContent = `下载次数: 加载失败`;
            }
        });

        // 点击下载按钮时增加计数
        button.addEventListener('click', () => {
            // 注意：GitHub Pages上的下载是客户端行为，无法完美阻止用户通过其他方式下载。
            // Firebase计数是尽力而为。
            const currentCountRef = database.ref(`downloadCounts/${workId}`);
            currentCountRef.transaction(currentCount => {
                return (currentCount || 0) + 1;
            }).then(() => {
                // console.log(`Download count for ${workId} incremented.`);
            }).catch(error => {
                console.error(`Firebase transaction failed for ${workId}: `, error);
            });
            // 允许默认的下载行为发生
        });
    });
});