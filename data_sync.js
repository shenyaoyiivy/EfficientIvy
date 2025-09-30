// data_sync.js - 处理数据同步功能

// 确保supabase已初始化
if (!window.supabase) {
    console.warn('Supabase客户端尚未初始化，数据同步功能可能受限');
}

// 收集本地所有待办事项
export function collectLocalTodos() {
    try {
        // 先尝试从todos键获取所有待办事项
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        if (todos && todos.length > 0) {
            return todos;
        }
        
        // 如果todos键不存在或为空，则从按日期组织的待办事项中收集
        const allTodos = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('todos_')) {
                const dateTodos = JSON.parse(localStorage.getItem(key) || '[]');
                if (dateTodos && Array.isArray(dateTodos)) {
                    allTodos.push(...dateTodos);
                }
            }
        }
        
        return allTodos;
    } catch (error) {
        console.error('收集本地待办事项失败:', error);
        return [];
    }
}

// 收集本地所有长期计划
export function collectLocalPlans() {
    try {
        const plans = JSON.parse(localStorage.getItem('plans') || '[]');
        return plans || [];
    } catch (error) {
        console.error('收集本地长期计划失败:', error);
        return [];
    }
}

// 从云端获取所有数据
async function fetchAllUserData(userId) {
    try {
        if (!window.supabase) {
            console.error('Supabase客户端未初始化，无法获取云端数据');
            return { todos: [], plans: [], notes: [] };
        }
        
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

// 格式化日期键
export function formatDateKey(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 将待办事项保存到云端
async function saveTodosToCloud(userId, todos) {
    try {
        if (!window.supabase) {
            console.error('Supabase客户端未初始化，无法保存待办事项到云端');
            return false;
        }
        
        // 先删除该用户的所有待办事项
        const { error: deleteError } = await window.supabase
            .from('todos')
            .delete()
            .eq('user_id', userId);
        
        if (deleteError) {
            console.error('删除原有待办事项失败:', deleteError);
            return false;
        }
        
        // 然后批量插入新的待办事项
        if (todos && todos.length > 0) {
            const todoRecords = todos.map(todo => ({
                ...todo,
                user_id: userId
            }));
            
            // 移除可能存在的created_at和updated_at字段
            const cleanTodoRecords = todoRecords.map(record => {
                const { created_at, updated_at, ...cleanRecord } = record;
                return cleanRecord;
            });
            
            const { error: insertError } = await window.supabase
                .from('todos')
                .insert(cleanTodoRecords);
            
            if (insertError) {
                console.error('批量插入待办事项失败:', insertError);
                return false;
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
        if (!window.supabase) {
            console.error('Supabase客户端未初始化，无法保存长期计划到云端');
            return false;
        }
        
        // 先删除该用户的所有长期计划
        const { error: deleteError } = await window.supabase
            .from('plans')
            .delete()
            .eq('user_id', userId);
        
        if (deleteError) {
            console.error('删除原有长期计划失败:', deleteError);
            return false;
        }
        
        // 然后批量插入新的长期计划
        if (plans && plans.length > 0) {
            const planRecords = plans.map(plan => ({
                ...plan,
                user_id: userId
            }));
            
            // 移除可能存在的created_at和updated_at字段
            const cleanPlanRecords = planRecords.map(record => {
                const { created_at, updated_at, ...cleanRecord } = record;
                return cleanRecord;
            });
            
            const { error: insertError } = await window.supabase
                .from('plans')
                .insert(cleanPlanRecords);
            
            if (insertError) {
                console.error('批量插入长期计划失败:', insertError);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('保存长期计划到云端失败:', error);
        return false;
    }
}

// 从云端同步数据到本地
window.syncFromCloud = async function() {
    console.log('开始从云端同步数据到本地...');
    
    // 确保getCurrentUser函数存在
    if (!window.getCurrentUser) {
        console.error('getCurrentUser函数未定义，无法从云端同步数据');
        return false;
    }
    
    const user = await window.getCurrentUser();
    if (!user) {
        console.log('用户未登录，无法从云端同步数据');
        return false;
    }
    
    try {
        // 获取云端数据
        const cloudData = await fetchAllUserData(user.id);
        
        if (cloudData) {
            console.log('成功获取云端数据，开始处理...');
            
            // 收集本地现有数据
            const localTodos = collectLocalTodos();
            const localPlans = collectLocalPlans();
            
            // 合并云端和本地数据（保留最新版本）
            const mergedTodos = mergeTodosData(cloudData.todos, localTodos);
            const mergedPlans = mergePlansData(cloudData.plans, localPlans);
            
            // 按日期组织待办事项并保存，但不删除现有的待办事项键
            const todosByDate = {};
            mergedTodos.forEach(todo => {
                const dateKey = `todos_${formatDateKey(todo.date)}`;
                if (!todosByDate[dateKey]) {
                    todosByDate[dateKey] = [];
                }
                todosByDate[dateKey].push(todo);
            });
            
            // 保存合并后的待办事项数据
            Object.entries(todosByDate).forEach(([key, todos]) => {
                localStorage.setItem(key, JSON.stringify(todos));
            });
            
            // 保存合并后的计划和笔记数据
            if (mergedPlans && mergedPlans.length > 0) {
                localStorage.setItem('plans', JSON.stringify(mergedPlans));
            }
            
            if (cloudData.notes && cloudData.notes.length > 0) {
                localStorage.setItem('notes', JSON.stringify(cloudData.notes));
            }
            
            console.log('数据成功从云端同步到本地并与本地数据合并');
            return true;
        } else {
            console.error('获取云端数据失败');
            return false;
        }
    } catch (error) {
        console.error('从云端同步数据到本地时发生错误:', error);
        return false;
    }
};

// 将本地数据同步到云端
window.syncToCloud = async function() {
    console.log('开始将本地数据同步到云端...');
    
    // 确保getCurrentUser函数存在
    if (!window.getCurrentUser) {
        console.error('getCurrentUser函数未定义，无法同步到云端');
        return false;
    }
    
    const user = await window.getCurrentUser();
    if (!user) {
        console.log('用户未登录，无法同步到云端');
        return false;
    }
    
    try {
        // 收集本地所有的待办事项和计划
        const localTodos = collectLocalTodos();
        const localPlans = collectLocalPlans();
        
        // 先获取云端现有数据
        const cloudData = await fetchAllUserData(user.id);
        
        // 合并云端和本地数据（保留最新版本）
        const mergedTodos = mergeTodosData(cloudData.todos, localTodos);
        const mergedPlans = mergePlansData(cloudData.plans, localPlans);
        
        // 保存合并后的数据到云端 - 修复参数顺序
        const saveTodosResult = await saveTodosToCloud(user.id, mergedTodos);
        const savePlansResult = await savePlansToCloud(user.id, mergedPlans);
        
        if (saveTodosResult && savePlansResult) {
            console.log('本地数据成功同步到云端');
            return true;
        } else {
            console.error('同步本地数据到云端失败');
            return false;
        }
    } catch (error) {
        console.error('将本地数据同步到云端时发生错误:', error);
        return false;
    }
};

// 主要的数据同步函数（结合双向同步）
window.syncData = async function() {
    console.log('开始执行数据同步...');
    
    // 确保getCurrentUser函数存在
    if (!window.getCurrentUser) {
        console.error('getCurrentUser函数未定义，无法执行数据同步');
        return false;
    }
    
    const user = await window.getCurrentUser();
    if (!user) {
        console.log('用户未登录，跳过数据同步');
        return false;
    }
    
    try {
        // 1. 备份本地数据，以防同步失败
        const localTodosBackup = collectLocalTodos();
        const localPlansBackup = collectLocalPlans();
        const localNotesBackup = JSON.parse(localStorage.getItem('notes') || '[]');
        
        console.log('已创建本地数据备份，准备同步...');
        
        // 2. 从云端获取最新数据
        const cloudData = await fetchAllUserData(user.id);
        
        if (!cloudData) {
            console.error('获取云端数据失败');
            return false;
        }
        
        // 3. 收集当前本地数据
        const currentLocalTodos = collectLocalTodos();
        const currentLocalPlans = collectLocalPlans();
        
        // 4. 合并云端和本地数据（保留最新版本）
        const mergedTodos = mergeTodosData(cloudData.todos, currentLocalTodos);
        const mergedPlans = mergePlansData(cloudData.plans, currentLocalPlans);
        
        // 5. 保存合并后的数据到云端
        const saveToCloudResult = await saveTodosToCloud(user.id, mergedTodos) && 
                                 await savePlansToCloud(user.id, mergedPlans);
        
        if (!saveToCloudResult) {
            console.error('保存数据到云端失败');
            throw new Error('保存数据到云端失败');
        }
        
        // 6. 按日期组织待办事项并保存到本地
        const todosByDate = {};
        mergedTodos.forEach(todo => {
            const dateKey = `todos_${formatDateKey(todo.date)}`;
            if (!todosByDate[dateKey]) {
                todosByDate[dateKey] = [];
            }
            todosByDate[dateKey].push(todo);
        });
        
        // 保存合并后的待办事项数据
        Object.entries(todosByDate).forEach(([key, todos]) => {
            localStorage.setItem(key, JSON.stringify(todos));
        });
        
        // 保存合并后的计划和笔记数据
        if (mergedPlans && mergedPlans.length > 0) {
            localStorage.setItem('plans', JSON.stringify(mergedPlans));
        }
        
        if (cloudData.notes && cloudData.notes.length > 0) {
            localStorage.setItem('notes', JSON.stringify(cloudData.notes));
        }
        
        console.log('数据同步完成');
        
        // 触发数据同步完成事件
        const dataSyncedEvent = new CustomEvent('dataSynced');
        window.dispatchEvent(dataSyncedEvent);
        
        return true;
    } catch (error) {
        console.error('数据同步过程中发生错误:', error);
        
        // 尝试恢复本地数据
        try {
            console.log('尝试恢复本地数据...');
            
            // 清空现有的待办事项数据（按日期存储的）
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('todos_')) {
                    localStorage.removeItem(key);
                    // 因为我们修改了localStorage，所以需要重新遍历
                    i--;
                }
            }
            
            // 保存备份的数据
            localStorage.setItem('todos', JSON.stringify(localTodosBackup));
            localStorage.setItem('plans', JSON.stringify(localPlansBackup));
            localStorage.setItem('notes', JSON.stringify(localNotesBackup));
            
            // 重新按日期组织待办事项
            const backupTodosByDate = {};
            localTodosBackup.forEach(todo => {
                const dateKey = `todos_${formatDateKey(todo.date)}`;
                if (!backupTodosByDate[dateKey]) {
                    backupTodosByDate[dateKey] = [];
                }
                backupTodosByDate[dateKey].push(todo);
            });
            
            // 保存恢复的按日期组织的待办事项
            Object.entries(backupTodosByDate).forEach(([key, todos]) => {
                localStorage.setItem(key, JSON.stringify(todos));
            });
            
            console.log('本地数据已恢复');
        } catch (recoverError) {
            console.error('恢复本地数据失败:', recoverError);
        }
        
        return false;
    }
};

// 通用数据合并函数
function mergeData(localData, cloudData, idField, dateField) {
    const merged = {};
    
    // 先添加云端数据
    if (cloudData && Array.isArray(cloudData)) {
        cloudData.forEach(item => {
            if (item[idField]) {
                merged[item[idField]] = item;
            }
        });
    }
    
    // 然后添加或更新本地数据（优先保留更新时间较晚的数据）
    if (localData && Array.isArray(localData)) {
        localData.forEach(item => {
            if (item[idField]) {
                const existing = merged[item[idField]];
                if (!existing || 
                    (!existing[dateField] && item[dateField]) || 
                    (existing[dateField] && item[dateField] && 
                     new Date(item[dateField]) > new Date(existing[dateField]))) {
                    merged[item[idField]] = item;
                }
            }
        });
    }
    
    return Object.values(merged);
}

// 使用upsert方式将待办事项同步到云端
async function upsertTodosToCloud(userId, todos) {
    try {
        if (!window.supabase) {
            console.error('Supabase客户端未初始化，无法同步待办事项到云端');
            return false;
        }
        
        if (todos.length > 0) {
            const todoRecords = todos.map(todo => ({
                ...todo,
                user_id: userId
            }));
            
            // 移除可能存在的created_at和updated_at字段
            const cleanTodoRecords = todoRecords.map(record => {
                const { created_at, updated_at, ...cleanRecord } = record;
                return cleanRecord;
            });
            
            // 分批处理，避免超过Supabase的批量操作限制
            const batchSize = 100;
            for (let i = 0; i < cleanTodoRecords.length; i += batchSize) {
                const batch = cleanTodoRecords.slice(i, i + batchSize);
                const { error: upsertError } = await window.supabase
                    .from('todos')
                    .upsert(batch, { onConflict: 'id' }); // 基于id字段进行upsert
                
                if (upsertError) {
                    console.error('批量更新/插入待办事项失败:', upsertError);
                    return false;
                }
            }
        }
        return true;
    } catch (error) {
        console.error('使用upsert方式保存待办事项到云端失败:', error);
        return false;
    }
}

// 使用upsert方式将长期计划同步到云端
async function upsertPlansToCloud(userId, plans) {
    try {
        if (!window.supabase) {
            console.error('Supabase客户端未初始化，无法同步长期计划到云端');
            return false;
        }
        
        if (plans.length > 0) {
            const planRecords = plans.map(plan => ({
                ...plan,
                user_id: userId
            }));
            
            // 移除可能存在的created_at和updated_at字段
            const cleanPlanRecords = planRecords.map(record => {
                const { created_at, updated_at, ...cleanRecord } = record;
                return cleanRecord;
            });
            
            // 分批处理，避免超过Supabase的批量操作限制
            const batchSize = 100;
            for (let i = 0; i < cleanPlanRecords.length; i += batchSize) {
                const batch = cleanPlanRecords.slice(i, i + batchSize);
                const { error: upsertError } = await window.supabase
                    .from('plans')
                    .upsert(batch, { onConflict: 'id' }); // 基于id字段进行upsert
                
                if (upsertError) {
                    console.error('批量更新/插入长期计划失败:', upsertError);
                    return false;
                }
            }
        }
        return true;
    } catch (error) {
        console.error('使用upsert方式保存长期计划到云端失败:', error);
        return false;
    }
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
    
    // 添加页面加载时的数据恢复逻辑，确保即使在未登录状态下也能加载本地数据
    document.addEventListener('DOMContentLoaded', () => {
        // 确保即使没有认证，也能加载localStorage中的数据
        console.log('页面加载，尝试恢复本地数据');
        // 触发数据同步完成事件，以便UI组件能正确加载数据
        setTimeout(() => {
            const dataSyncedEvent = new CustomEvent('dataSynced');
            window.dispatchEvent(dataSyncedEvent);
        }, 100);
    });
    
    // 将syncData函数暴露到全局，方便其他地方调用
    window.syncData = syncData;
}

// 从云端同步数据到本地
async function syncFromCloud() {
    try {
        const user = await window.getCurrentUser();
        if (!user) {
            console.log('用户未登录，跳过从云端同步数据');
            return;
        }
        
        const allUserData = await fetchAllUserData();
        
        if (allUserData && allUserData.todos) {
            // 保存待办事项数据到localStorage
            allUserData.todos.forEach(todo => {
                const dateKey = todo.date.replace(/-/g, '_');
                // 先获取现有数据
                const existingTodos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
                
                // 检查是否已存在相同ID的待办事项
                const existingIndex = existingTodos.findIndex(t => t.id === todo.id);
                
                if (existingIndex >= 0) {
                    // 如果已存在，比较更新时间，保留最新的
                    const existingTodo = existingTodos[existingIndex];
                    const existingUpdatedAt = new Date(existingTodo.updatedAt || existingTodo.updated_at);
                    const cloudUpdatedAt = new Date(todo.updatedAt || todo.updated_at);
                    
                    if (cloudUpdatedAt > existingUpdatedAt) {
                        existingTodos[existingIndex] = todo;
                    }
                } else {
                    // 如果不存在，添加新的待办事项
                    existingTodos.push(todo);
                }
                
                localStorage.setItem(`todos_${dateKey}`, JSON.stringify(existingTodos));
            });
        }
        
        // 其他数据类型的同步逻辑...
        
    } catch (error) {
        console.error('从云端同步数据失败:', error);
        // 失败时不抛出错误，避免影响用户体验
    }
}

// 将initDataSync函数挂载到window对象上，以便在app.js中访问
window.initDataSync = initDataSync;

// 合并待办事项数据
export function mergeTodosData(cloudTodos, localTodos) {
    const merged = {};
    
    // 处理云端数据
    if (cloudTodos && Array.isArray(cloudTodos)) {
        cloudTodos.forEach(todo => {
            const key = `${todo.date}_${todo.id}`;
            merged[key] = todo;
        });
    }
    
    // 处理本地数据（优先级更高，因为可能包含最新的编辑）
    if (localTodos && Array.isArray(localTodos)) {
        localTodos.forEach(todo => {
            const key = `${todo.date}_${todo.id}`;
            merged[key] = todo;
        });
    }
    
    // 转换为数组并按日期排序
    return Object.values(merged).sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
}

// 合并长期计划数据
export function mergePlansData(cloudPlans, localPlans) {
    const merged = {};
    
    // 处理云端数据
    if (cloudPlans && Array.isArray(cloudPlans)) {
        cloudPlans.forEach(plan => {
            if (plan.id) {
                merged[plan.id] = plan;
            }
        });
    }
    
    // 处理本地数据（优先级更高）
    if (localPlans && Array.isArray(localPlans)) {
        localPlans.forEach(plan => {
            if (plan.id) {
                merged[plan.id] = plan;
            }
        });
    }
    
    // 转换为数组并按创建时间排序
    return Object.values(merged).sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA; // 降序排列
    });
}