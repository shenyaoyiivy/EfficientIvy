// Supabase配置
const SUPABASE_URL = 'https://XXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// 初始化Supabase客户端
if (typeof window !== 'undefined') {
    try {
        // 由于我们已经在HTML中引入了Supabase库，应该直接使用全局的supabase.createClient函数
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase客户端初始化成功');
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        // 创建一个mock对象作为最后的备用方案，确保应用不会因为缺少supabase对象而崩溃
        window.supabase = {
            auth: {
                getUser: async () => ({ data: { user: null } }),
                signInWithPassword: async () => ({ error: 'Supabase初始化失败' }),
                signUp: async () => ({ error: 'Supabase初始化失败' }),
                signOut: async () => ({ error: null }),
                onAuthStateChange: () => ({ data: { unsubscribe: () => {} } })
            },
            from: () => ({
                select: () => ({ data: [], error: null }),
                insert: () => ({ data: [], error: null }),
                update: () => ({ data: [], error: null }),
                delete: () => ({ data: [], error: null })
            })
        };
    }
}

// 获取当前用户
export async function getCurrentUser() {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return null;
    }
    
    try {
        const { data, error } = await window.supabase.auth.getUser();
        if (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
        return data.user;
    } catch (error) {
        console.error('获取用户信息时发生异常:', error);
        return null;
    }
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

// 用户登出
export async function logoutUser() {
    if (!window.supabase) {
        console.error('Supabase客户端未初始化');
        return { success: false, error: '系统错误：认证服务不可用' };
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
        return { success: false, error: error.message };
    }
    
    console.log('用户成功登出');
    if (window.updateAuthUI) {
        window.updateAuthUI(null);
    }
    
    return { success: true };
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
        if (window.syncData) {
            console.log('用户已登录，开始从云端同步数据...');
            
            // 尝试从云端同步数据
            const syncResult = await window.syncData();
            
            if (syncResult) {
                console.log('数据同步成功，已保存到本地存储');
                
                // 确保数据已保存到本地后，主动更新UI显示
                const today = new Date();
                const activePage = document.querySelector('.page.active');
                
                if (activePage) {
                    if (activePage.id === 'today-todos') {
                        if (window.showTodosForDate) {
                            window.showTodosForDate(today);
                        }
                    } else if (activePage.id === 'calendar') {
                        if (window.renderCalendar) {
                            window.renderCalendar();
                        }
                        if (window.showTodosForDate) {
                            window.showTodosForDate(today);
                        }
                    } else if (activePage.id === 'long-term-plans') {
                        if (window.loadPlans) {
                            window.loadPlans();
                        }
                    } else if (activePage.id === 'notes') {
                        if (window.loadNotes) {
                            window.loadNotes();
                        }
                    }
                } else {
                    // 默认显示今天的待办事项
                    if (window.renderCalendar) {
                        window.renderCalendar();
                    }
                    if (window.showTodosForDate) {
                        window.showTodosForDate(today);
                    }
                }
            } else {
                console.error('数据同步失败，但会尝试使用本地存储的数据');
                
                // 无论同步是否成功，都尝试更新UI
                const today = new Date();
                if (window.renderCalendar) {
                    window.renderCalendar();
                }
                if (window.showTodosForDate) {
                    window.showTodosForDate(today);
                }
            }
        } else {
            console.warn('syncData函数不可用，无法从云端同步数据');
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
    
    // 显示登录模态框
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
            showLoginForm();
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
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
    
    // 切换到注册表单
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', showRegisterForm);
    }
    
    // 切换到登录表单
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', showLoginForm);
    }
    
    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // 简单验证
            if (!email || !password) {
                alert('请填写邮箱和密码');
                return;
            }
            
            // 显示加载状态
            const loginButton = loginForm.querySelector('button[type="submit"]');
            const originalText = loginButton.textContent;
            loginButton.disabled = true;
            loginButton.textContent = '登录中...';
            
            try {
                const result = await loginUser(email, password);
                if (result.success) {
                    // 登录成功
                    console.log('用户登录成功');
                    if (loginModal) {
                        loginModal.style.display = 'none';
                    }
                    // 清空表单
                    loginForm.reset();
                    // 更新UI
                    await window.updateAuthUI();
                } else {
                    // 登录失败
                    alert(result.error || '登录失败，请重试');
                }
            } catch (error) {
                console.error('登录过程中发生异常:', error);
                alert('登录过程中发生错误，请稍后再试');
            } finally {
                // 恢复按钮状态
                loginButton.disabled = false;
                loginButton.textContent = originalText;
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
            
            // 简单验证
            if (!email || !password) {
                alert('请填写邮箱和密码');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            // 显示加载状态
            const registerButton = registerForm.querySelector('button[type="submit"]');
            const originalText = registerButton.textContent;
            registerButton.disabled = true;
            registerButton.textContent = '注册中...';
            
            try {
                const result = await registerUser(email, password);
                if (result.success) {
                    // 注册成功
                    alert('注册成功，请登录');
                    showLoginForm();
                    // 清空表单
                    registerForm.reset();
                } else {
                    // 注册失败
                    alert(result.error || '注册失败，请重试');
                }
            } catch (error) {
                console.error('注册过程中发生异常:', error);
                alert('注册过程中发生错误，请稍后再试');
            } finally {
                // 恢复按钮状态
                registerButton.disabled = false;
                registerButton.textContent = originalText;
            }
        });
    }
    
    // 登出按钮点击事件
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const result = await logoutUser();
                if (result.success) {
                    console.log('用户已登出');
                } else {
                    alert(result.error || '登出失败，请重试');
                }
            } catch (error) {
                console.error('登出过程中发生异常:', error);
                alert('登出过程中发生错误，请稍后再试');
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

// 如果DOM已加载，初始化认证模块
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.initAuth) {
            window.initAuth();
        }
    });
} else {
    // DOM已加载，直接初始化
    if (window.initAuth) {
        window.initAuth();
    }
}