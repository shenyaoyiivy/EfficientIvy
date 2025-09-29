// auth.js - 处理用户认证功能

// Supabase配置
const SUPABASE_URL = 'https://mxsmsgfwxnvqxwbideqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c21zZ2Z3eG52cXh3YmlkZXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTI4MDQsImV4cCI6MjA3NDcyODgwNH0.vdA4NYpFIYEgJfGdsBAJsEd0v5KieI-fJZ_TxplLI28';

// 初始化Supabase客户端
if (window.supabase && typeof window.supabase.createClient === 'function') {
    // 如果已经存在createClient方法，则使用它
    try {
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase客户端初始化成功');
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        window.supabase = null;
    }
} else if (typeof window.supabase === 'undefined' && typeof SupabaseClient === 'function') {
    // 备用方案：如果有SupabaseClient构造函数
    try {
        window.supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('使用SupabaseClient构造函数初始化成功');
    } catch (error) {
        console.error('SupabaseClient初始化失败:', error);
        window.supabase = null;
    }
} else {
    console.error('Supabase初始化失败，请确保已加载正确的Supabase SDK');
    // 创建一个mock对象，确保应用不会因为缺少supabase对象而崩溃
    window.supabase = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: null, error: { message: 'Supabase SDK未加载' } }),
            signUp: async () => ({ data: null, error: { message: 'Supabase SDK未加载' } }),
            signOut: async () => ({ error: null }),
            getUser: async () => ({ data: { user: null }, error: { message: 'Supabase SDK未加载' } }),
            onAuthStateChange: () => ({ data: { unsubscribe: () => {} } })
        }
    };
}

// 检查用户是否已登录
export async function checkUserSession() {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return null;
    }
    
    const { data, error } = await window.supabase.auth.getSession();
    if (error) {
        console.error('获取用户会话失败:', error);
        return null;
    }
    return data.session;
}

// 用户登录
export async function loginUser(email, password) {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return { success: false, error: '系统错误：认证服务不可用' };
    }
    
    const { data, error } = await window.supabase.auth.signInWithPassword({
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
export async function registerUser(email, password) {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return { success: false, error: '系统错误：认证服务不可用' };
    }
    
    const { data, error } = await window.supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        console.error('注册失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, user: data.user };
}

// 登出用户
export async function logoutUser() {
    try {
        if (!window.supabase) {
            console.error('Supabase客户端未初始化');
            return false;
        }
        
        // 登出前先同步数据到云端
        console.log('登出前同步数据到云端...');
        if (window.syncData) {
            await window.syncData();
        }
        
        // 然后再执行登出操作
        const { error } = await window.supabase.auth.signOut();
        
        if (error) {
            console.error('登出失败:', error);
            throw error;
        }
        
        console.log('用户成功登出');
        if (window.updateAuthUI) {
            window.updateAuthUI(null);
        }
        return true;
    } catch (error) {
        console.error('登出过程中发生错误:', error);
        return false;
    }
}

// 获取当前用户
export async function getCurrentUser() {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return null;
    }
    
    // 在较新的Supabase SDK版本中，user()方法已被弃用
    // 使用getUser()方法代替
    try {
        const { data, error } = await window.supabase.auth.getUser();
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
export function setupAuthStateListener(callback) {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return null;
    }
    
    return window.supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// 显示登录表单
function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm && registerForm) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

// 显示注册表单
function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
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
window.updateAuthUI = async function() {
    const user = await getCurrentUser();
    const openLoginBtn = document.getElementById('open-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoElement = document.getElementById('user-info');
    
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
};

// 初始化认证模块
window.initAuth = function() {
    // DOM元素
    const loginModal = document.getElementById('login-modal');
    const openLoginBtn = document.getElementById('open-login-btn');
    const closeLoginBtn = document.querySelector('#login-modal .close');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegisterBtn = document.getElementById('switch-to-register');
    const switchToLoginBtn = document.getElementById('switch-to-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    // 打印调试信息
    console.log('初始化认证模块:', {
        loginModal: !!loginModal,
        openLoginBtn: !!openLoginBtn,
        closeLoginBtn: !!closeLoginBtn,
        loginForm: !!loginForm,
        registerForm: !!registerForm
    });
    
    // 打开登录模态框
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            console.log('登录按钮被点击');
            if (loginModal) {
                loginModal.style.display = 'block';
                showLoginForm();
            } else {
                console.error('登录模态框不存在');
            }
        });
    } else {
        console.error('登录按钮不存在');
        // 尝试在DOMContentLoaded后重新绑定
        document.addEventListener('DOMContentLoaded', () => {
            const delayedOpenLoginBtn = document.getElementById('open-login-btn');
            if (delayedOpenLoginBtn) {
                console.log('延迟绑定登录按钮事件');
                delayedOpenLoginBtn.addEventListener('click', () => {
                    const delayedLoginModal = document.getElementById('login-modal');
                    if (delayedLoginModal) {
                        delayedLoginModal.style.display = 'block';
                        showLoginForm();
                    }
                });
            }
        });
    }
    
    // 关闭登录模态框
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
    
    // 点击模态框外部关闭
    if (loginModal) {
        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
    
    // 切换到注册表单
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    // 切换到登录表单
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = await loginUser(email, password);
            if (result.success) {
                console.log('登录成功');
                if (loginModal) {
                    loginModal.style.display = 'none';
                }
                await window.updateAuthUI();
            } else {
                showError(loginForm, result.error);
            }
        });
    }
    
    // 注册表单提交
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
                console.log('注册成功');
                if (loginModal) {
                    loginModal.style.display = 'none';
                }
                await window.updateAuthUI();
            } else {
                showError(registerForm, result.error);
            }
        });
    }
    
    // 登出按钮点击
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            console.log('登出按钮被点击');
            const success = await logoutUser();
            if (success) {
                await window.updateAuthUI();
            }
        });
    }
    
    // 初始化时更新UI状态
    window.updateAuthUI();
    
    // 设置认证状态变化监听器
    const authListener = setupAuthStateListener((event, session) => {
        console.log('认证状态变化:', event, session);
        window.updateAuthUI();
        
        // 触发自定义事件，方便其他模块监听
        const authEvent = new CustomEvent('authStateChanged', {
            detail: { event, session }
        });
        window.dispatchEvent(authEvent);
    });
    
    // 清理函数（可选）
    window.cleanupAuth = function() {
        if (authListener && authListener.data && authListener.data.unsubscribe) {
            authListener.data.unsubscribe();
        }
    };
};

// 将getCurrentUser函数挂载到window对象上，以便在data_sync.js中访问
window.getCurrentUser = getCurrentUser;
