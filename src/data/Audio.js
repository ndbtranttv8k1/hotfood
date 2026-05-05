const bgm = document.getElementById('bgm');
const closeSound = new Audio('/food/off.wav');
const openSound = new Audio('/food/on.wav');
// --- SETUP VOLUME
// Kiểm tra bgm có tồn tại không
if (bgm) {
    bgm.volume = 0.5;
}
// Chỉnh âm lượng
closeSound.volume = 0.6;
openSound.volume = 0.6;
// Preload giúp tải sẵn âm thanh vào bộ nhớ, click là kêu ngay không bị delay
openSound.preload = "auto";
closeSound.preload = "auto";
export const AudioController = {
    playBGM: () => {
        if (bgm && bgm.paused) bgm.play().catch(() => {});
    },
    pauseBGM: () => {
        if (bgm && !bgm.paused) bgm.pause();
    },
    playOpen: () => { 
        openSound.currentTime = 0; 
        openSound.play().catch(() => {}); 
    },
    playClose: () => { 
        closeSound.currentTime = 0; 
        closeSound.play().catch(() => {}); 
    },
    changeTrack: (url) => { 
        if (bgm) {
            bgm.src = url; 
            bgm.play().catch(() => {}); 
        }
    },
};