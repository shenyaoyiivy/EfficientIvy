// data_sync.js - 处理数据同步功能

// 从云端获取所有数据
async function fetchAllUserData(userId) {
    try {
        // 获取待办事项
        const { data: todosData, error: todosError } = await window.supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        
        if (todosError) {
            console.error('获取待办事项失败:', todosError);
        }
        
        // 获取长期计划
        const { data: plansData, error: plansError } = await window.supabase
            .from('plans')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        
        if (plansError) {
            console.error('获取长期计划失败:', plansError);
        }
        
        // 获取笔记
        const { data: notesData, error: notesError } = await window.supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        
        if (notesError) {
            console.error('获取笔记失败:', notesError);
        }
        
        return {
            todos: todosData || [],
            plans: plansData || [],
            notes: notesData || []
        };
    } catch (error) {
        console.error('获取用户数据失败:', error);
        return {
            todos: [],
            plans: [],
            notes: []
        };
    }
}

// 将日期格式转换为存储键名格式 (YYYY-MM-DD)
function formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 将待办事项保存到云端
async function saveTodosToCloud(userId, todos) {
    try {
        // 先删除用户的所有待办事项
        const { error: deleteError } = await window.supabase
            .from('todos')
            .delete()
            .eq('user_id', userId);
        
        if (deleteError) {
            console.error('删除待办事项失败:', deleteError);
            return false;
        }
        
        // 批量插入新的待办事项
        if (todos.length > 0) {
            const todoRecords = todos.map(todo => ({
                ...todo,
                user_id: userId,
                updated_at: new Date().toISOString()
            }));
            
            // 分批插入，避免超过Supabase的批量操作限制
            const batchSize = 100;
            for (let i = 0; i < todoRecords.length; i += batchSize) {
                const batch = todoRecords.slice(i, i + batchSize);
                const { error: insertError } = await window.supabase
                    .from('todos')
                    .insert(batch);
                
                if (insertError) {
                    console.error('插入待办事项失败:', insertError);
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('保存待办事项到云端失败:', error);
        return false;
    }
}

// 将长期计划保存到云端
async function savePlansToCloud(userId, plans) {
    try {
        // 先删除用户的所有长期计划
        const { error: deleteError } = await window.supabase
            .from('plans')
            .delete()
            .eq('user_id', userId);
        
        if (deleteError) {
            console.error('删除长期计划失败:', deleteError);
            return false;
        }
        
        // 批量插入新的长期计划
        if (plans.length > 0) {
            const planRecords = plans.map(plan => ({
                ...plan,
                user_id: userId,
                updated_at: new Date().toISOString()
            }));
            
            // 分批插入，避免超过Supabase的批量操作限制
            const batchSize = 100;
            for (let i = 0; i < planRecords.length; i += batchSize) {
                const batch = planRecords.slice(i, i + batchSize);
                const { error: insertError } = await window.supabase
                    .from('plans')
                    .insert(batch);
                
                if (insertError) {
                    console.error('插入长期计划失败:', insertError);
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('保存长期计划到云端失败:', error);
        return false;
    }
}

// 从云端同步数据到本地
async function syncFromCloud() {
    const user = await window.getCurrentUser();
    if (!user) {
        console.log('用户未登录，跳过从云端同步数据');
        return false;
    }
    
    try {
        const userData = await fetchAllUserData(user.id);
        
        // 保存待办事项到本地存储（按日期组织）
        // 先清空所有现有的待办事项键
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('todos_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // 然后按日期存储待办事项
        if (userData.todos && userData.todos.length > 0) {
            // 保存原始待办事项数据（用于同步到云端）
            localStorage.setItem('todos', JSON.stringify(userData.todos));
            
            // 按日期重新组织待办事项
            const todosByDate = {};
            userData.todos.forEach(todo => {
                if (todo.date) {
                    const dateKey = formatDateKey(todo.date);
                    if (!todosByDate[dateKey]) {
                        todosByDate[dateKey] = [];
                    }
                    todosByDate[dateKey].push(todo);
                }
            });
            
            // 保存按日期组织的待办事项
            Object.keys(todosByDate).forEach(dateKey => {
                localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todosByDate[dateKey]));
            });
        } else {
            localStorage.setItem('todos', JSON.stringify([]));
        }
        
        // 保存长期计划到本地存储
        localStorage.setItem('plans', JSON.stringify(userData.plans));
        
        // 保存笔记到本地存储
        localStorage.setItem('notes', JSON.stringify(userData.notes));
        
        console.log('从云端同步数据成功');
        
        // 触发数据同步完成事件
        window.dispatchEvent(new CustomEvent('dataSynced'));
        
        return true;
    } catch (error) {
        console.error('从云端同步数据失败:', error);
        return false;
    }
}

// 将本地数据同步到云端
async function syncToCloud() {
    const user = await window.getCurrentUser();
    if (!user) {
        console.log('用户未登录，跳过同步数据到云端');
        return false;
    }
    
    try {
        // 收集所有按日期存储的待办事项
        let allTodos = [];
        
        // 先检查是否有单一todos键的数据
        const todosStr = localStorage.getItem('todos');
        if (todosStr) {
            try {
                const todos = JSON.parse(todosStr);
                if (Array.isArray(todos)) {
                    allTodos = [...allTodos, ...todos];
                }
            } catch (e) {
                console.error('解析todos数据失败:', e);
            }
        }
        
        // 然后收集所有按日期组织的待办事项
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('todos_') && key !== 'todos') {
                try {
                    const dateTodos = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(dateTodos)) {
                        // 为每个待办事项添加日期信息（从键名中提取）
                        const dateStr = key.replace('todos_', '');
                        const datedTodos = dateTodos.map(todo => ({
                            ...todo,
                            date: dateStr,
                            updated_at: new Date().toISOString()
                        }));
                        allTodos = [...allTodos, ...datedTodos];
                    }
                } catch (e) {
                    console.error(`解析${key}数据失败:`, e);
                }
            }
        }
        
        // 去重（保留最新的待办事项）
        const uniqueTodos = {};
        allTodos.forEach(todo => {
            // 使用id作为唯一标识，如果没有id则生成一个
            const todoId = todo.id || `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!uniqueTodos[todoId] || 
                (todo.updated_at && uniqueTodos[todoId].updated_at && 
                 new Date(todo.updated_at) > new Date(uniqueTodos[todoId].updated_at))) {
                uniqueTodos[todoId] = { ...todo, id: todoId };
            }
        });
        
        // 转换回数组
        const finalTodos = Object.values(uniqueTodos);
        
        // 更新单一todos键，用于下次同步
        localStorage.setItem('todos', JSON.stringify(finalTodos));
        
        // 从本地存储获取长期计划
        const plansStr = localStorage.getItem('plans');
        const plans = plansStr ? JSON.parse(plansStr) : [];
        
        // 从本地存储获取笔记
        const notesStr = localStorage.getItem('notes');
        const notes = notesStr ? JSON.parse(notesStr) : [];
        
        // 同步待办事项
        const todosSynced = await saveTodosToCloud(user.id, finalTodos);
        if (!todosSynced) {
            console.error('同步待办事项失败');
            return false;
        }
        
        // 同步长期计划
        const plansSynced = await savePlansToCloud(user.id, plans);
        if (!plansSynced) {
            console.error('同步长期计划失败');
            return false;
        }
        
        console.log('数据同步到云端成功');
        return true;
    } catch (error) {
        console.error('同步数据到云端失败:', error);
        return false;
    }
}

// 执行数据同步（双向同步）
async function syncData() {
    console.log('开始执行数据同步...');
    
    // 首先从云端同步数据
    const fromCloudSynced = await syncFromCloud();
    if (!fromCloudSynced) {
        console.error('从云端同步数据失败，跳过后续同步步骤');
        return false;
    }
    
    // 然后将本地数据同步到云端
    const toCloudSynced = await syncToCloud();
    if (!toCloudSynced) {
        console.error('同步数据到云端失败');
        return false;
    }
    
    console.log('数据同步完成');
    return true;
}

// 初始化数据同步模块
function initDataSync() {
    // 监听认证状态变化，当用户登录后自动同步数据
    window.addEventListener('authStateChanged', async (event) => {
        if (event.detail && event.detail.session) {
            // 用户已登录，执行数据同步
            await syncData();
        }
    });
    
    // 定时同步数据（每5分钟）
    setInterval(async () => {
        const user = await window.getCurrentUser();
        if (user) {
            console.log('执行定时数据同步');
            await syncData();
        }
    }, 5 * 60 * 1000);
    
    // 在页面卸载前同步数据
    window.addEventListener('beforeunload', async () => {
        const user = await window.getCurrentUser();
        if (user) {
            // 这里使用同步方式，确保在页面关闭前完成
            try {
                await syncToCloud();
            } catch (error) {
                console.error('页面关闭前同步数据失败:', error);
            }
        }
    });
    
    // 将syncData函数暴露到全局，方便其他地方调用
    window.syncData = syncData;
}

// 将initDataSync函数挂载到window对象上，以便在app.js中访问
window.initDataSync = initDataSync;