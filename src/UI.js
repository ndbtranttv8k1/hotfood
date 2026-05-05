import { AudioController } from './data/Audio.js';
export function initUI(controls) {
    // -------------------------------
    // 1. ĐỒNG HỒ
    function updateClock() {
        const now = new Date();
        let h = String(now.getHours()).padStart(2, '0');
        let m = String(now.getMinutes()).padStart(2, '0');
        let s = String(now.getSeconds()).padStart(2, '0');
        const clockEl = document.getElementById('clock');
        if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
    // -------------------------------
    // 2. KÉO THẢ CỬA SỔ
    document.querySelectorAll('.window').forEach(win => {
        const bar = win.querySelector('.title-bar');
        if (!bar) return;

        let isDragging = false, offsetX, offsetY;
        bar.addEventListener('mousedown', e => {
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            if (controls) controls.enabled = false; // Tắt xoay Trái Đất khi kéo UI
        });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            win.style.left = (e.clientX - offsetX) + 'px';
            win.style.top = (e.clientY - offsetY) + 'px';
        });
        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (controls) controls.enabled = true; // Bật lại xoay Trái Đất
        });
    });
    // -------------------------------
    // 3. START SCREEN
    const startBtn = document.getElementById('startBtn');
    const startScreen = document.getElementById('startScreen');
    if (startBtn && startScreen) {
        startBtn.addEventListener('click', () => {
            startScreen.style.display = 'none';
            AudioController.playBGM(); 
        });
    }
    // -------------------------------
    // 4. MUSIC PLAYER
    const playBtn = document.getElementById('playBtn');
    const nextBtn = document.getElementById('nextBtn');
    const albumArtImg = document.querySelector('.musicArt img');
    const subtitle = document.querySelector('.subtitle');
    const playlist = [
        {
            audio: "/earth/Webcore.mp3",
            image: "/UI/example.jpg",
            title: "Webcore"
        },
        {
            audio: "/earth/Around_the_World.mp3",
            image: "/UI/around.jpg", 
            title: "Around the World"
        },
        {
            audio: "/earth/Goodnight.mp3",
            image: "/UI/goodni.jpg",
            title: "Mì+Thịt bò+Hành lá+Hành tây+Tỏi"
        }
    ];
    let currentTrack = 0;
    if (playBtn && nextBtn) {
        // Init bài đầu tiên khi web vừa load
        if (bgm) bgm.src = playlist[0].audio;
        if (albumArtImg) albumArtImg.src = playlist[0].image;
        if (subtitle) subtitle.textContent = playlist[0].title;
        // Nút Play/Pause
        playBtn.onclick = () => {
            if (bgm && bgm.paused) {
                AudioController.playBGM();
                playBtn.textContent = '⏸';
            } else {
                AudioController.pauseBGM();
                playBtn.textContent = '▶';
            }
        };
        // Nút Next
        nextBtn.addEventListener('click', () => {
            // Chuyển sang bài tiếp theo, nếu hết mảng thì quay lại 0
            currentTrack = (currentTrack + 1) % playlist.length;
            const currentSongInfo = playlist[currentTrack];
            // 1. Đổi bài nhạc
            AudioController.changeTrack(currentSongInfo.audio);
            playBtn.textContent = '⏸'; // Tự động hiển thị nút pause vì đổi bài là tự động phát
            // 2. Đổi ảnh và tên bài
            if (albumArtImg) albumArtImg.src = currentSongInfo.image;
            if (subtitle) subtitle.textContent = currentSongInfo.title;
        });
    }
    // -------------------------------
    // 5. MỞ/ĐÓNG APP DESKTOP VÀ MODAL CƠ BẢN
    // Mở App
    document.querySelectorAll('.icon').forEach(icon => {
        icon.onclick = () => {
            const id = icon.dataset.app;
            const appEl = document.getElementById(id);
            if (appEl) {
                appEl.style.display = 'block';
                AudioController.playOpen();
            }
        };
    });
    // Đóng App
    document.querySelectorAll('.closeApp').forEach(btn => {
        btn.onclick = () => {
            const appModal = btn.closest('.appModal');
            if (appModal) appModal.style.display = 'none';
            AudioController.playClose();
        };
    });
    // Đóng GAME HUB
    const closeGameHub = document.getElementById("closeGameHub");
    const gameHub = document.getElementById("gameHub");
    if (closeGameHub && gameHub) {
        closeGameHub.addEventListener("click", () => {
            gameHub.style.display = "none";
        });
    }
    // Mở khóa âm thanh lần đầu khi người dùng click vào trang
    const startBGM = () => {
        AudioController.playBGM();
        window.removeEventListener('click', startBGM);
    };
    window.addEventListener('click', startBGM);
    // -------------------------------
    // 6. ĐÓNG MODAL CHÍNH (myModal)
    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];

    if (span && modal) {
        span.onclick = function() {
            modal.style.display = "none";
            AudioController.playClose();
        }
    }
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            AudioController.playClose();
        }
    });
}
// -------------------------------
// HÀM ĐỔ DỮ LIỆU ĐỘNG VÀO MODAL MÓN ĂN
export function openFoodModalHTML(foodKey, data) {
    if (!data) return; 
    // Đổ text (Nếu không có intro thì để chuỗi rỗng)
    const introEl = document.getElementById('introContent');
    if (introEl) introEl.innerHTML = data.intro || "Đang cập nhật giới thiệu...";
    // Đổ array nguyên liệu (Phòng thủ: nếu không có mảng ingredients thì dùng mảng rỗng)
    const ingredients = data.ingredients || [];
    let ingredientHTML = "<ul>";
    ingredients.forEach(item => {
        ingredientHTML += `<li>${item}</li>`;
    });
    ingredientHTML += "</ul>";
    
    const ingredEl = document.getElementById('ingredContent');
    if (ingredEl) ingredEl.innerHTML = ingredientHTML;
    // Đổ clip
    const clipEl = document.getElementById('clipContent');
    if (clipEl) clipEl.innerHTML = data.clip || "";
    // Reset Accordion Bootstrap
    if(window.jQuery) {
        $('.panel-collapse').removeClass('in').css('height', '');
        $('.panel-title > a').addClass('collapsed');
    }
    // XỬ LÝ MÀU SẮC RIÊNG (THEME)
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        // Reset lại class gốc để xóa các theme trước đó
        modalContent.className = 'modal-content custom-layout'; 
        // Thêm class dựa trên foodKey
        modalContent.classList.add(foodKey);
    }
    // Hiển thị Modal
    document.getElementById('myModal').style.display = 'block';
}