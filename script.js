// 1. Firebase 配置 (从 Firebase 控制台复制你的配置)
const firebaseConfig = {
    apiKey: "AIzaSyDRmJacRW0A1YPG41RQxjQK0GbZb1Rj4aE",
    authDomain: "my-sillytrvean-project.firebaseapp.com",
    databaseURL: "https://console.firebase.google.com/u/0/project/my-sillytrvean-project/database/my-sillytrvean-project-default-rtdb/data", // 重要：确保这是 Realtime Database URL
    projectId: "my-sillytrvean-projectOUR_PROJECT_ID",
    storageBucket: "my-sillytrvean-project.firebasestorage.appET",
    messagingSenderId: "999192617156",
    appId: "1:999192617156:web:98c606748ec3fd54c46991"
};

// 2. 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. 轮播图逻辑
const carousels = {}; // 用于存储每个轮播图的当前索引

document.querySelectorAll('.work-module').forEach(module => {
    const moduleId = module.id;
    carousels[moduleId] = {
        currentIndex: 0,
        slideElement: module.querySelector('.carousel-slide'),
        images: module.querySelectorAll('.carousel-slide img')
    };
    showSlide(moduleId, 0); // 初始化显示第一张图
});

function showSlide(moduleId, index) {
    const carousel = carousels[moduleId];
    if (!carousel) return;

    const totalImages = carousel.images.length;
    if (index >= totalImages) {
        carousel.currentIndex = 0;
    } else if (index < 0) {
        carousel.currentIndex = totalImages - 1;
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
}


// 4. 下载统计逻辑
document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('.download-button');

    downloadButtons.forEach(button => {
        const workId = button.dataset.workid;
        const countElement = document.getElementById(`count-${workId}`);

        // 初始化时获取下载次数
        const countRef = database.ref(`downloadCounts/${workId}`);
        countRef.on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            if (countElement) {
                countElement.textContent = `下载次数: ${count}`;
            }
        });

        // 点击下载按钮时增加计数
        button.addEventListener('click', (event) => {
            // event.preventDefault(); // 如果不想立即下载，而是先处理JS，则取消注释
            // 但通常我们希望点击链接直接下载，所以注释掉

            const currentCountRef = database.ref(`downloadCounts/${workId}`);
            currentCountRef.transaction(currentCount => {
                return (currentCount || 0) + 1;
            }).then(() => {
                console.log(`Download count for ${workId} incremented.`);
                // 如果之前 preventDefault() 了，可以在这里触发下载
                // window.location.href = button.href;
            }).catch(error => {
                console.error("Firebase transaction failed: ", error);
            });
        });
    });
});
