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
    console.log('开始将本地数据同步到云端...');
    
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
        
        // 保存合并后的数据到云端
        const saveTodosResult = await saveTodosToCloud(mergedTodos, user.id);
        const savePlansResult = await savePlansToCloud(mergedPlans, user.id);
        
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
}

// 合并待办事项数据，保留最新的版本
function mergeTodosData(cloudTodos, localTodos) {
    const merged = {};
    
    // 先添加云端数据
    if (cloudTodos) {
        cloudTodos.forEach(todo => {
            const key = `${todo.date}_${todo.id}`;
            merged[key] = { ...todo };
        });
    }
    
    // 再用本地数据覆盖，保留最新版本
    localTodos.forEach(todo => {
        const key = `${todo.date}_${todo.id}`;
        // 如果云端不存在这个待办事项，或者本地版本更新（根据updated_at），则保留本地版本
        if (!merged[key] || !todo.updated_at || !merged[key].updated_at || 
            new Date(todo.updated_at) > new Date(merged[key].updated_at)) {
            merged[key] = { ...todo };
        }
    });
    
    // 转换回数组格式
    return Object.values(merged);
}

// 合并计划数据，保留最新的版本
function mergePlansData(cloudPlans, localPlans) {
    const merged = {};
    
    // 先添加云端数据
    if (cloudPlans) {
        cloudPlans.forEach(plan => {
            merged[plan.id] = { ...plan };
        });
    }
    
    // 再用本地数据覆盖，保留最新版本
    localPlans.forEach(plan => {
        // 如果云端不存在这个计划，或者本地版本更新（根据updated_at），则保留本地版本
        if (!merged[plan.id] || !plan.updated_at || !merged[plan.id].updated_at || 
            new Date(plan.updated_at) > new Date(merged[plan.id].updated_at)) {
            merged[plan.id] = { ...plan };
        }
    });
    
    // 转换回数组格式
    return Object.values(merged);
}

// 执行数据同步（双向同步，带数据合并）
async function syncData() {
    console.log('开始执行数据同步...');
    
    try {
        const user = await window.getCurrentUser();
        if (!user) {
            console.log('用户未登录，跳过数据同步');
            return false;
        }
        
        // 1. 先备份本地数据
        const localTodosBackup = JSON.parse(localStorage.getItem('todos') || '[]');
        const localPlansBackup = JSON.parse(localStorage.getItem('plans') || '[]');
        const localNotesBackup = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // 2. 从云端获取最新数据
        const cloudData = await fetchAllUserData(user.id);
        
        // 3. 合并数据（云端数据和本地数据合并，保留最新的版本）
        // 合并待办事项
        const mergedTodos = mergeData(localTodosBackup, cloudData.todos, 'id', 'updated_at');
        
        // 合并长期计划
        const mergedPlans = mergeData(localPlansBackup, cloudData.plans, 'id', 'updated_at');
        
        // 合并笔记
        const mergedNotes = mergeData(localNotesBackup, cloudData.notes, 'id', 'updated_at');
        
        // 4. 保存合并后的数据到本地存储
        // 保存原始待办事项数据
        localStorage.setItem('todos', JSON.stringify(mergedTodos));
        
        // 按日期重新组织待办事项
        const todosByDate = {};
        mergedTodos.forEach(todo => {
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
        
        // 保存长期计划到本地存储
        localStorage.setItem('plans', JSON.stringify(mergedPlans));
        
        // 保存笔记到本地存储
        localStorage.setItem('notes', JSON.stringify(mergedNotes));
        
        // 5. 将合并后的数据同步到云端（使用upsert方式）
        const todosSynced = await upsertTodosToCloud(user.id, mergedTodos);
        const plansSynced = await upsertPlansToCloud(user.id, mergedPlans);
        
        if (todosSynced && plansSynced) {
            console.log('数据同步完成');
            // 触发数据同步完成事件
            window.dispatchEvent(new CustomEvent('dataSynced'));
            return true;
        } else {
            console.error('同步数据到云端失败');
            // 如果同步失败，恢复本地备份
            localStorage.setItem('todos', JSON.stringify(localTodosBackup));
            localStorage.setItem('plans', JSON.stringify(localPlansBackup));
            localStorage.setItem('notes', JSON.stringify(localNotesBackup));
            return false;
        }
    } catch (error) {
        console.error('数据同步过程中发生错误:', error);
        return false;
    }
}

// 合并两个数据集，基于ID和更新时间戳保留最新版本
function mergeData(localData, cloudData, idField, timestampField) {
    const mergedMap = new Map();
    
    // 先添加本地数据
    localData.forEach(item => {
        if (item[idField]) {
            mergedMap.set(item[idField], item);
        }
    });
    
    // 再添加或更新云端数据（如果云端数据更新）
    cloudData.forEach(item => {
        if (item[idField]) {
            const existingItem = mergedMap.get(item[idField]);
            // 如果本地没有该数据，或者云端数据更新，则使用云端数据
            if (!existingItem || 
                !existingItem[timestampField] || 
                !item[timestampField] || 
                new Date(item[timestampField]) > new Date(existingItem[timestampField])) {
                mergedMap.set(item[idField], item);
            }
        }
    });
    
    // 转换回数组
    return Array.from(mergedMap.values());
}

// 使用upsert方式将待办事项保存到云端（不删除现有数据，只更新或插入）
async function upsertTodosToCloud(userId, todos) {
    try {
        if (todos.length > 0) {
            const todoRecords = todos.map(todo => ({ 
                ...todo, 
                user_id: userId,
                updated_at: todo.updated_at || new Date().toISOString()
            }));
            
            // 分批处理，避免超过Supabase的批量操作限制
            const batchSize = 100;
            for (let i = 0; i < todoRecords.length; i += batchSize) {
                const batch = todoRecords.slice(i, i + batchSize);
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

// 使用upsert方式将长期计划保存到云端（不删除现有数据，只更新或插入）
async function upsertPlansToCloud(userId, plans) {
    try {
        if (plans.length > 0) {
            const planRecords = plans.map(plan => ({ 
                ...plan, 
                user_id: userId,
                updated_at: plan.updated_at || new Date().toISOString()
            }));
            
            // 分批处理，避免超过Supabase的批量操作限制
            const batchSize = 100;
            for (let i = 0; i < planRecords.length; i += batchSize) {
                const batch = planRecords.slice(i, i + batchSize);
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
    
    // 将syncData函数暴露到全局，方便其他地方调用
    window.syncData = syncData;
}

// 将initDataSync函数挂载到window对象上，以便在app.js中访问
window.initDataSync = initDataSync;