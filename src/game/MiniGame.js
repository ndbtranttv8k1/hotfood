import { recipeData, ingredientImages, allIngredients, gameState, penaltyGifs } from '../data/constants.js';
import { hideUnlockedButton } from '../script.js'
// Các biến trạng thái toàn cục của Game
let userSequence = [];
let currentGame = null;
let draggingEl = null;
let offsetX = 0, offsetY = 0;
let onWin = null; // Biến lưu trữ hàm callback khi thắng
// -------------------------------
// 1. KHỞI TẠO HỆ THỐNG GAME
export function initGameSystem(onWinCallback) {
    onWin = onWinCallback; // Lưu callback vào biến để dùng sau
    // Nút mở game
    const gameIcon = document.getElementById("gameIcon");
    if (gameIcon) gameIcon.addEventListener("click", () => startRandomGame());
    // Nút tắt game
    const closeBtn = document.getElementById("closeFood4Game");
    const food4Modal = document.getElementById("food4GameModal");
    if (food4Modal) {
        // 👉 CHẶN TẤT CẢ sự kiện chuột không cho thoát ra khỏi Modal
        const blockEvents = (e) => e.stopPropagation();
        food4Modal.addEventListener("mousedown", blockEvents);
        food4Modal.addEventListener("click", blockEvents);
        food4Modal.addEventListener("wheel", blockEvents); // Chặn cả cuộn chuột để zoom Trái Đất
    }
    if (closeBtn && food4Modal) {
        closeBtn.onclick = () => {
            food4Modal.style.display = "none";
            cleanUpIngredients(); // Dọn rác khi tắt ngang
            if (window.controls) window.controls.enabled = true;
        };
    }
    // Logic kéo
    document.addEventListener("mousemove", (e) => { 
        // Thay vì chỉ check !draggingEl, check thêm cả .style để chắc chắn 100% không bị null
        if (!draggingEl || !draggingEl.style) return; 
        draggingEl.style.left = (e.clientX - offsetX) + "px";
        draggingEl.style.top = (e.clientY - offsetY) + "px";
    });
    // Logic thả
    document.addEventListener("mouseup", (e) => {
        if (!draggingEl) return;
        // Tìm element ngay tại con trỏ chuột lúc nhả click
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const isDrop = el && (el.id === "dropZone" || el.closest("#dropZone"));
        
        if (isDrop) {
            handleDrop(draggingEl.dataset.name);
        } else {
            // Thả trượt ra ngoài nồi -> Bay về khay
            snapBack(draggingEl);
        }
        // Phải kiểm tra xem thẻ ảnh còn tồn tại không (vì handleDrop có thể đã xóa nó thành null rồi)
        if (draggingEl) {
            draggingEl.style.pointerEvents = "auto";
            draggingEl.style.zIndex = "1";
            draggingEl = null;
        }
    });
}
// -------------------------------
// 2. LOGIC CHỌN MÓN VÀ BẮT ĐẦU GAME
export function startRandomGame() { 
    const allGames = Object.keys(recipeData);
    // Chỉ chọn những món chưa được đánh dấu là true trong gameState
    const lockedGames = allGames.filter(g => !gameState[g]);
    
    if (lockedGames.length === 0) {
        alert("🎉 Bạn đã mở khóa tất cả món!");
        return;
    }
    // Random 1 món trong danh sách khóa
    const randomGame = lockedGames[Math.floor(Math.random() * lockedGames.length)];
    startCookingGame(randomGame);
}

function startCookingGame(gameName) {
    cleanUpIngredients();
    currentGame = gameName;

    const dishGray = document.getElementById("dishGray");
    const dishColor = document.getElementById("dishColor");
    // Reset UI Nồi
    if (dishGray) dishGray.src = `/cook/cookpot.jpg`;
    if (dishColor) {
        dishColor.src = `/cook/cookpot.jpg`;
        dishColor.style.clipPath = "inset(100% 0 0 0)"; // Trống rỗng
    }

    const modal = document.getElementById("food4GameModal");
    const container = document.getElementById("ingredientContainer");
    const seqDisplay = document.getElementById("currentSequence");
    
    if (modal) modal.style.display = "flex";
    if (window.controls) window.controls.enabled = false;
    if (container) container.innerHTML = ""; 
    if (seqDisplay) seqDisplay.innerText = "Các bước: ";
    userSequence = []; 
    // Sao chép và xáo trộn nguyên liệu
    let ingredientsToShow = [...allIngredients];
    ingredientsToShow.sort(() => Math.random() - 0.5);
    // Render danh sách nguyên liệu
    ingredientsToShow.forEach(ing => {
        const img = document.createElement("img");
        img.draggable = false; // Tắt drag mặc định của browser
        img.src = ingredientImages[ing] || `/earth/esspurr.png`; // Fallback image
        img.className = "ing-img";
        img.dataset.name = ing;
        // Bắt đầu quy trình kéo thả thủ công
        img.addEventListener("mousedown", (e) => {
            e.preventDefault(); 
            draggingEl = img;
            
            const rect = img.getBoundingClientRect();
            document.body.appendChild(draggingEl); // Đưa ra khỏi khay để không bị dính CSS overflow
            // Ép vị trí cố định theo chuột
            draggingEl.style.position = "fixed";
            draggingEl.style.transform = "none";
            draggingEl.style.left = rect.left + "px";
            draggingEl.style.top = rect.top + "px";
            draggingEl.style.width = rect.width + "px";
            draggingEl.style.height = rect.height + "px";
            draggingEl.style.zIndex = "9999";
            draggingEl.style.pointerEvents = "none"; // Bỏ qua pointer để mouseup lấy đúng dropZone bên dưới

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });
        
        if (container) container.appendChild(img);
    });
}
// -------------------------------
// 3. LOGIC KHI THẢ NGUYÊN LIỆU (DROP / SNAPBACK)
function snapBack(element) {
    if (!element) return;
    const container = document.getElementById("ingredientContainer");
    if (container) container.appendChild(element); // Trả về khay
    // Xóa sạch các CSS fix cứng
    element.style.position = "";
    element.style.left = "";
    element.style.top = "";
    element.style.width = "";
    element.style.height = "";
    element.style.transform = "";
}
function handleDrop(ing) {
    // Chặn bỏ trùng
    if (userSequence.includes(ing)) {
        snapBack(draggingEl); // Nếu trùng thì đẩy về khay
        return; 
    }
    const dropSound = new Audio('/cook/water.mp3');
    dropSound.play().catch(e => console.log("Audio play error:", e));

    userSequence.push(ing);
    // Cập nhật text
    const seqDisplay = document.getElementById("currentSequence");
    if (seqDisplay) seqDisplay.innerText = "Đã cho vào: " + userSequence.join(", ");
    // Hiệu ứng đầy nồi (Tính theo tỷ lệ 5 nguyên liệu)
    const percent = userSequence.length / 5;
    const dishColor = document.getElementById("dishColor");
    if (dishColor) dishColor.style.clipPath = `inset(${(1 - percent) * 100}% 0 0 0)`;
    // Đã bỏ vào nồi thì xóa thẻ ảnh đi
    if (draggingEl) {
        draggingEl.remove();
        draggingEl = null;
    }
    // ==========================================
    // RANDOM ĐỔI MẶT "DAWG" TRÊN KHAY
    // Tìm thẻ ảnh Dawg CÒN LẠI trên khay (nghĩa là chưa bị ném vào nồi)
    const dawgElement = document.querySelector('.ing-img[data-name="Dawg"]');
    if (dawgElement) {
        // Mảng chứa các đường dẫn ảnh meme của Dawg
        const dawgFaces = [
            "/cook/dog1.png",  
            "/cook/dog2.png",  
            "/cook/dog3.png",  
            "/cook/dog4.png",  
            "/cook/dog5.png"
        ];
        // Chọn ngẫu nhiên 1 ảnh trong mảng và gắn vào Dawg
        const randomFace = dawgFaces[Math.floor(Math.random() * dawgFaces.length)];
        dawgElement.src = randomFace;
    }

    if (ing === "Dawg") {
        //cho 1 chút delay để thẻ ảnh biến mất mượt mà rồi mới hiện alert
        setTimeout(() => triggerDawgSecret(), 100);
        return; // Dừng lại, không cần chờ đủ 5 món nữa
    }
    // Đủ 5 món -> Kiểm tra kết quả
    if (userSequence.length === 5) {
        // Cho một chút timeout để UI cập nhật ảnh nồi đầy trước khi hiện Alert
        setTimeout(() => checkRecipeResult(), 300);
    }
}
// -------------------------------
// 4. KIỂM TRA CÔNG THỨC & HOÀN THÀNH
function triggerDawgSecret() {
    alert("🌟 BÍ ẨN ĐƯỢC GIẢI ĐÁP! Bạn đã tìm ra bí mật của Dawg!\n\nHãy vào Gallery để xem chi tiết nhé.");
    // Giả sử tên secret này trong DB của bạn là "secret_dawg"
    const secretName = "secret3"; 
    const secretCard = document.getElementById("card-" + secretName);
    if (secretCard) {
        secretCard.classList.remove("locked");
        secretCard.classList.add("unlocked");
    }
    // Reset ván chơi hiện tại sau khi tìm ra secret
    cleanUpIngredients();
    startCookingGame(currentGame); 
}
function checkRecipeResult() {
    let matchedFood = null;
    // Duyệt qua DB tìm món khớp (không quan trọng thứ tự bỏ vào)
    for (const foodKey in recipeData) {
        const recipe = recipeData[foodKey];
        if (recipe.length === 5) {
            const isMatch = recipe.every(item => userSequence.includes(item));
            if (isMatch) {
                matchedFood = foodKey; 
                break; 
            }
        }
    }

    if (matchedFood) {
        // [RẼ NHÁNH 1]: Công thức bí mật
        if (matchedFood.startsWith("secret")) {
            alert("🌟 CHÚC MỪNG! Bạn vừa khám phá ra một Công Thức Bí Mật!\n\nHãy vào Gallery để xem chi tiết nhé.");
            
            const secretCard = document.getElementById("card-" + matchedFood);
            if (secretCard) {
                secretCard.classList.remove("locked");
                secretCard.classList.add("unlocked");
            }
            // Reset ván chơi hiện tại vì tìm ra secret không có nghĩa là giải xong nhiệm vụ chính
            cleanUpIngredients();
            startCookingGame(currentGame); 
            
        } 
        // [RẼ NHÁNH 2]: Nấu đúng món chính
        else {
            alert("🎉 Tuyệt vời! Bạn đã nấu ra món: " + matchedFood);            
            // Mở khóa thẻ tương ứng bên trong Gallery Tab 1
            const mainCard = document.getElementById("card-" + matchedFood);
            if (mainCard) {
                mainCard.classList.remove("locked");
                mainCard.classList.add("unlocked");
            }
            hideUnlockedButton(matchedFood);
            // Gọi ra hàm script.js để đánh dấu unlock và hiển thị mô hình 3D
            if (typeof onWin === "function") {
                onWin(matchedFood);
            }
            
            cleanUpIngredients(); 
            const modal = document.getElementById("food4GameModal");
            if (modal) modal.style.display = "none";
        }
    } else {
        // [RẼ NHÁNH 3]: Nấu sai
        alert("❌ Uh oh! Hỗn hợp này không tạo ra món nào cả. Thử lại nhé!");
        startCookingGame(currentGame); 
        // --- GIF PHẠT --
        // Cho vòng lặp chạy đúng 2 lần để đẻ ra 2 ảnh
        for (let i = 0; i < 2; i++) {
            // 1. Bốc random 1 đường dẫn ảnh cho mỗi lần lặp
            const randomIndex = Math.floor(Math.random() * penaltyGifs.length);
            // 2. Tạo ra một thẻ <img> hoàn toàn mới
            const penaltyImg = document.createElement("img");
            penaltyImg.src = penaltyGifs[randomIndex];
            penaltyImg.className = "penalty-gif-dynamic"; 
            // 3. Tính tọa độ random lại từ đầu cho mỗi ảnh (để không bị đè lên nhau)
            const maxX = Math.max(0, window.innerWidth - 250); 
            const maxY = Math.max(0, window.innerHeight - 250);
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);
            // 4. Ép tọa độ vào thẻ img
            penaltyImg.style.left = randomX + "px";
            penaltyImg.style.top = randomY + "px";
            // 5. Hàm tự hủy (Bấm vào ảnh nào thì ảnh đó bay màu)
            penaltyImg.onclick = () => {
                penaltyImg.remove(); 
            };
            // 6. Quăng ảnh lên màn hình
            document.body.appendChild(penaltyImg);
        }
    }
}
// -------------------------------
// 5. TIỆN ÍCH DỌN DẸP RÁC (DOM)
export function cleanUpIngredients() { 
    // Xóa thẻ ảnh đang trôi nổi ngoài body (do kéo thả dang dở)
    document.querySelectorAll('body > .ing-img').forEach(img => img.remove());
    if (draggingEl) {
        draggingEl.remove();
        draggingEl = null;
    }
}