// Supabase配置
// 真实的Supabase配置应该从环境变量中读取
// 注意：在实际部署时，应该使用真实的Supabase URL和密钥
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
        
        // 在开发环境下，使用增强的mock对象，让应用能够正常运行
        console.log('开发模式：使用模拟的Supabase客户端');
        
        // 模拟用户数据
        let mockUser = null;
        let authListeners = [];
        
        // 创建增强的mock对象
        window.supabase = {
            auth: {
                getUser: async () => ({ data: { user: mockUser } }),
                
                // 模拟登录功能
                signInWithPassword: async ({ email, password }) => {
                    // 简单的验证逻辑
                    if (!email || !password) {
                        return { error: { message: '请输入邮箱和密码' } };
                    }
                    
                    // 模拟成功登录
                    mockUser = {
                        id: 'user_' + Date.now(),
                        email: email,
                        created_at: new Date().toISOString(),
                        // 其他用户属性
                        user_metadata: {
                            email: email
                        }
                    };
                    
                    console.log('模拟登录成功:', mockUser);
                    
                    // 触发认证状态变化
                    authListeners.forEach(listener => 
                        listener('SIGNED_IN', { user: mockUser })
                    );
                    
                    return { data: { user: mockUser }, error: null };
                },
                
                // 模拟注册功能
                signUp: async ({ email, password }) => {
                    // 简单的验证逻辑
                    if (!email || !password) {
                        return { error: { message: '请输入邮箱和密码' } };
                    }
                    
                    if (password.length < 6) {
                        return { error: { message: '密码至少需要6个字符' } };
                    }
                    
                    // 模拟成功注册
                    console.log('模拟注册成功:', email);
                    
                    // 注册成功后自动登录
                    return await window.supabase.auth.signInWithPassword({ email, password });
                },
                
                // 模拟登出功能
                signOut: async () => {
                    mockUser = null;
                    
                    // 触发认证状态变化
                    authListeners.forEach(listener => 
                        listener('SIGNED_OUT', null)
                    );
                    
                    return { error: null };
                },
                
                // 模拟认证状态监听
                onAuthStateChange: (callback) => {
                    authListeners.push(callback);
                    return { 
                        data: { 
                            unsubscribe: () => {
                                authListeners = authListeners.filter(l => l !== callback);
                            }
                        } 
                    };
                }
            },
            
            // 模拟数据库操作
            from: (table) => ({
                select: async (query) => {
                    console.log(`模拟查询表${table}:`, query);
                    // 从localStorage获取数据
                    const localStorageKey = `mock_${table}`;
                    const data = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                    return { data, error: null };
                },
                insert: async (rows) => {
                    console.log(`模拟插入到表${table}:`, rows);
                    // 保存到localStorage
                    const localStorageKey = `mock_${table}`;
                    const existingData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                    const newData = [...existingData, ...rows];
                    localStorage.setItem(localStorageKey, JSON.stringify(newData));
                    return { data: rows, error: null };
                },
                update: async (updates, { eq }) => {
                    console.log(`模拟更新表${table}:`, updates, eq);
                    // 在真实应用中，这里会根据eq条件更新数据
                    return { data: [updates], error: null };
                },
                delete: async ({ eq }) => {
                    console.log(`模拟删除表${table}中的记录:`, eq);
                    // 在真实应用中，这里会根据eq条件删除数据
                    return { data: [], error: null };
                }
            })
        };
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
        
        // 在开发模式下，优先使用本地存储数据并更新UI
        console.log('用户已登录，更新UI以显示本地数据...');
        
        // 直接更新UI，不依赖云端数据同步
        const today = new Date();
        const activePage = document.querySelector('.page.active');
        
        // 尝试渲染日历和待办事项，这些功能只依赖本地存储
        if (window.renderCalendar) {
            window.renderCalendar();
        }
        
        if (window.showTodosForDate) {
            window.showTodosForDate(today);
        }
        
        // 如果有特定页面的加载函数，也调用它们
        if (activePage) {
            if (activePage.id === 'long-term-plans' && window.loadPlans) {
                window.loadPlans();
            } else if (activePage.id === 'notes' && window.loadNotes) {
                window.loadNotes();
            }
        }
        
        // 在开发环境下，我们可以尝试数据同步，但不阻塞UI更新
        // 注意：这不会影响用户体验，因为我们已经更新了UI
        if (window.syncData) {
            try {
                setTimeout(async () => {
                    console.log('开发模式：尝试数据同步（非阻塞）...');
                    await window.syncData();
                    console.log('数据同步完成（无论成功与否）');
                }, 1000);
            } catch (syncError) {
                console.log('数据同步非关键错误:', syncError);
            }
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