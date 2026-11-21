
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "./firebase.js";

console.log("VEXORA AUTH.JS ISHLADI!");

// HTML ELEMENTLARI
const authScreen = document.getElementById("authScreen");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");

// ELEMENTLARNI TEKSHIRISH
if (
    !authScreen ||
    !loginForm ||
    !registerForm ||
    !loginTab ||
    !registerTab
) {
    console.error("XATO: Kerakli HTML elementlari topilmadi!");
} else {

    // KIRISH BO‘LIMI
    loginTab.addEventListener("click", function() {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";

        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    });

    // RO‘YXATDAN O‘TISH BO‘LIMI
    registerTab.addEventListener("click", function() {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";

        registerTab.classList.add("active");
        loginTab.classList.remove("active");
    });

    // AKKAUNT YARATISH
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!name || !email || password.length < 6) {
            alert("Barcha ma'lumotlarni to‘g‘ri kiriting!");
            return;
        }

        const button = registerForm.querySelector("button[type='submit']");
        button.disabled = true;
        button.textContent = "Akkaunt yaratilmoqda...";

        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(result.user, {
                displayName: name
            });

            alert("Akkauntingiz muvaffaqiyatli yaratildi!");
            registerForm.reset();

        } catch (error) {
            console.error("REGISTER ERROR:", error);
            alert("Ro‘yxatdan o‘tishda xatolik: " + error.message);

        } finally {
            button.disabled = false;
            button.textContent = "Akkaunt yaratish";
        }
    });

    // TIZIMGA KIRISH
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const button = loginForm.querySelector("button[type='submit']");
        button.disabled = true;
        button.textContent = "Kirilmoqda...";

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            alert("VEXORA AI tizimiga xush kelibsiz!");
            loginForm.reset();

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            alert("Kirishda xatolik: " + error.message);

        } finally {
            button.disabled = false;
            button.textContent = "Tizimga kirish";
        }
    });

    // AKKAUNTDAN CHIQISH
    if (logoutButton) {
        logoutButton.addEventListener("click", async function() {
            const confirmLogout = confirm(
                "Haqiqatan ham akkauntdan chiqmoqchimisiz?"
            );

            if (!confirmLogout) return;

            try {
                await signOut(auth);
                alert("Akkauntdan muvaffaqiyatli chiqdingiz!");

            } catch (error) {
                console.error("LOGOUT ERROR:", error);
                alert("Chiqishda xatolik: " + error.message);
            }
        });
    }

    // FOYDALANUVCHI HOLATINI KUZATISH
    onAuthStateChanged(auth, function(user) {
        if (user) {
            authScreen.style.display = "none";

            if (userName) {
                userName.textContent =
                    user.displayName || "Foydalanuvchi";
            }

            if (userEmail) {
                userEmail.textContent = user.email || "";
            }

            console.log("VEXORA FOYDALANUVCHISI:", user.email);

        } else {
            authScreen.style.display = "flex";

            if (userName) {
                userName.textContent = "Foydalanuvchi";
            }

            if (userEmail) {
                userEmail.textContent = "";
            }

            console.log("Foydalanuvchi tizimdan chiqdi.");
        }
    });
}

const avatarInput = document.getElementById("avatarInput");
const profileImage = document.getElementById("profileImage");

if (avatarInput && profileImage) {
    avatarInput.addEventListener("change", function(event) {
        const file = event.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Faqat rasm faylini tanlang!");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Rasm hajmi 2 MB dan oshmasligi kerak!");
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {
            profileImage.src = reader.result;

            try {
                localStorage.setItem(
                    "vexoraProfileImage",
                    reader.result
                );

                alert("Profil rasmi yangilandi!");
            } catch (error) {
                alert("Rasmni saqlashda xatolik yuz berdi.");
            }
        };

        reader.readAsDataURL(file);
    });

    const savedImage = localStorage.getItem("vexoraProfileImage");

    if (savedImage) {
        profileImage.src = savedImage;
    }
}
