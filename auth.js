// auth.js - 处理用户认证功能

// Supabase配置
const SUPABASE_URL = 'https://mxsmsgfwxnvqxwbideqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c21zZ2Z3eG52cXh3YmlkZXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTI4MDQsImV4cCI6MjA3NDcyODgwNH0.vdA4NYpFIYEgJfGdsBAJsEd0v5KieI-fJZ_TxplLI28';

// 初始化Supabase客户端
// 注意：这里假设页面已经加载了全局的supabase库
const supabase = window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 检查用户是否已登录
async function checkUserSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('获取用户会话失败:', error);
        return null;
    }
    return data.session;
}

// 用户登录
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        console.error('登录失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, user: data.user };
}

// 用户注册
async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        console.error('注册失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, user: data.user };
}

// 用户登出
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('登出失败:', error);
        return false;
    }
    
    return true;
}

// 获取当前用户
async function getCurrentUser() {
    // 在较新的Supabase SDK版本中，user()方法已被弃用
    // 使用getUser()方法代替
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
        return data.user;
    } catch (err) {
        console.error('获取用户信息时发生错误:', err);
        return null;
    }
}

// 设置认证状态变化监听器
function setupAuthStateListener(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// 初始化认证模块
function initAuth() {
    // 登录模态框
    const loginModal = document.getElementById('login-modal');
    const openLoginBtn = document.getElementById('open-login-btn');
    const closeLoginBtn = document.querySelector('#login-modal .close');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegisterBtn = document.getElementById('switch-to-register');
    const switchToLoginBtn = document.getElementById('switch-to-login');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoElement = document.getElementById('user-info');
    
    // 打开登录模态框
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
            showLoginForm();
        });
    }
    
    // 关闭登录模态框
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // 切换到注册表单
    if (switchToRegisterBtn && switchToLoginBtn) {
        switchToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
        
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    // 处理登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = await loginUser(email, password);
            
            if (result.success) {
                loginModal.style.display = 'none';
                updateAuthUI();
            } else {
                showError(loginForm, result.error);
            }
        });
    }
    
    // 处理注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                showError(registerForm, '两次输入的密码不一致');
                return;
            }
            
            const result = await registerUser(email, password);
            
            if (result.success) {
                alert('注册成功，请登录！');
                showLoginForm();
            } else {
                showError(registerForm, result.error);
            }
        });
    }
    
    // 处理登出
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const success = await logoutUser();
            if (success) {
                await updateAuthUI();
            }
        });
    }
    
    // 显示登录表单
    function showLoginForm() {
        if (loginForm && registerForm) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
    }
    
    // 显示注册表单
    function showRegisterForm() {
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }
    
    // 显示错误信息
    function showError(form, message) {
        let errorElement = form.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.classList.add('error-message', 'text-red-500', 'text-sm', 'mt-2');
            form.appendChild(errorElement);
        }
        errorElement.textContent = message;
        
        // 5秒后清除错误信息
        setTimeout(() => {
            errorElement.textContent = '';
        }, 5000);
    }
    
    // 更新认证UI
    async function updateAuthUI() {
        const user = await getCurrentUser();
        if (user) {
            // 用户已登录
            if (openLoginBtn) openLoginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userInfoElement) {
                userInfoElement.textContent = `欢迎，${user.email}`;
                userInfoElement.style.display = 'block';
            }
            
            // 触发数据同步 - 从云端加载数据到本地
            if (window.syncFromCloud) {
                // 先从云端同步数据到本地存储
                await window.syncFromCloud();
            } else if (window.syncData) {
                // 备用方案：使用完整的同步函数
                await window.syncData();
            }
        } else {
            // 用户未登录
            if (openLoginBtn) openLoginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfoElement) userInfoElement.style.display = 'none';
        }
    }
    
    // 初始化UI状态
    updateAuthUI().catch(error => {
        console.error('Failed to initialize auth UI:', error);
    });
}

// 将initAuth函数挂载到window对象上，以便在app.js中访问
window.initAuth = initAuth;

// 将getCurrentUser函数挂载到window对象上，以便在data_sync.js中访问
window.getCurrentUser = getCurrentUser;
