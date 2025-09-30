// DOM元素
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// 模态框元素
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContainer = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalSave = document.getElementById('modal-save');
const modalCancel = document.getElementById('modal-cancel');

// 模态框回调函数
let modalCallback = null;

// 当前选中的日期
let currentDate = new Date();
let selectedDate = new Date();
// 当前视图模式 (week 或 month)
let currentViewMode = 'week';

// 格式化时间戳为日期时间字符串（年月日小时分钟）
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 初始化模态框
function initModal() {
    // 保存按钮点击事件
    modalSave.addEventListener('click', () => {
        const value = modalInput.value.trim();
        if (modalCallback) {
            modalCallback(value);
        }
        hideModal();
    });
    
    // 取消按钮点击事件
    modalCancel.addEventListener('click', hideModal);
    
    // 点击背景关闭模态框
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            hideModal();
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
            hideModal();
        }
    });
}    

// 显示确认对话框
function showConfirmModal(title, message, confirmCallback) {
    // 保存原始的模态框元素内容和样式
    const originalBodyContent = modalBody.innerHTML;
    const originalSaveText = modalSave.textContent;
    
    // 修改模态框为确认对话框样式
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p class="text-gray-600">${message}</p>`;
    modalSave.textContent = '确认';
    
    // 设置确认回调
    modalSave.onclick = () => {
        if (confirmCallback) {
            confirmCallback();
        }
        // 恢复模态框原始状态
        restoreModalState(originalBodyContent, originalSaveText);
        hideModal();
    };
    
    // 取消按钮点击事件
    modalCancel.onclick = () => {
        // 恢复模态框原始状态
        restoreModalState(originalBodyContent, originalSaveText);
        hideModal();
    };
    
    // 显示模态框
    modalBackdrop.classList.remove('hidden');
    // 添加动画效果
    setTimeout(() => {
        modalContainer.classList.remove('scale-95', 'opacity-0');
        modalContainer.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// 恢复模态框原始状态
function restoreModalState(originalBodyContent, originalSaveText) {
    modalBody.innerHTML = originalBodyContent;
    modalSave.textContent = originalSaveText;
    
    // 重新绑定保存按钮的原始事件
    modalSave.onclick = () => {
        const value = modalInput.value.trim();
        if (modalCallback) {
            modalCallback(value);
        }
        hideModal();
    };
    
    // 重新绑定取消按钮的原始事件
    modalCancel.onclick = hideModal;
}

// 显示输入模态框
function showModal(title, placeholder, defaultValue = '', callback) {
    modalTitle.textContent = title;
    modalInput.placeholder = placeholder;
    modalInput.value = defaultValue;
    modalCallback = callback;
    
    modalBackdrop.classList.remove('hidden');
    // 添加动画效果
    setTimeout(() => {
        modalContainer.classList.remove('scale-95', 'opacity-0');
        modalContainer.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    // 自动聚焦输入框
    setTimeout(() => {
        modalInput.focus();
    }, 100);
}

// 隐藏模态框
function hideModal() {
    modalContainer.classList.remove('scale-100', 'opacity-100');
    modalContainer.classList.add('scale-95', 'opacity-0');
    
    // 延迟隐藏背景，等待动画完成
    setTimeout(() => {
        modalBackdrop.classList.add('hidden');
        modalInput.value = '';
        modalCallback = null;
    }, 300);
}

// 初始化页面
function initApp() {
    // 初始化导航
    initNavigation();
    
    // 初始化模态框
    initModal();
    
    // 初始化今日待办页面
    initTodayPage();
    
    // 初始化长期计划页面
    initPlanPage();
    
    // 初始化随手记页面
    initNotesPage();
    
    // 确保在页面加载时就能显示本地数据，而不依赖数据同步完成事件
    // 这解决了在GitHub Pages上刷新页面后内容重置的问题
    setTimeout(() => {
        // 立即显示今日待办页面的数据
        const todayPage = document.getElementById('today-todos');
        if (todayPage && !todayPage.classList.contains('hidden')) {
            showTodosForDate(selectedDate);
        }
        
        // 检查其他页面是否需要加载数据
        const planPage = document.getElementById('long-term-plans');
        const notesPage = document.getElementById('notes');
        
        if (!planPage.classList.contains('hidden')) {
            loadPlans();
        }
        
        if (!notesPage.classList.contains('hidden')) {
            loadNotes();
        }
    }, 100);
}

// 初始化导航
function initNavigation() {
    // 为每个导航链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // 获取目标页面ID
            const targetId = link.getAttribute('href').substring(1);
            
            // 隐藏所有页面
            pages.forEach(page => {
                page.classList.add('hidden');
            });
            
            // 显示目标页面
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }
            
            // 更新活动链接样式
            navLinks.forEach(navLink => {
                navLink.classList.remove('text-primary', 'font-semibold');
                navLink.classList.add('text-gray-600', 'hover:text-primary');
            });
            
            // 为当前链接添加活动样式
            link.classList.remove('text-gray-600', 'hover:text-primary');
            link.classList.add('text-primary', 'font-semibold');
        });
    });
}

// 初始化今日待办页面
function initTodayPage() {
    // 渲染日历
    renderCalendar();
    
    // 显示当前日期的待办
    showTodosForDate(selectedDate);
    
    // 日历导航按钮事件
    document.getElementById('prev-month').addEventListener('click', () => {
        if (currentViewMode === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else {
            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        selectedDate = new Date(currentDate);
        renderCalendar();
        showTodosForDate(selectedDate);
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        if (currentViewMode === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        selectedDate = new Date(currentDate);
        renderCalendar();
        showTodosForDate(selectedDate);
    });
    
    // 视图切换按钮事件
    document.getElementById('week-view-btn').addEventListener('click', () => {
        setViewMode('week');
    });
    
    document.getElementById('month-view-btn').addEventListener('click', () => {
        setViewMode('month');
    });
    
    document.getElementById('today-btn').addEventListener('click', () => {
        selectedDate = new Date();
        currentDate = new Date();
        renderCalendar();
        showTodosForDate(selectedDate);
    });
    
    // 添加待办事件
    document.getElementById('add-todo').addEventListener('click', addTodo);
    document.getElementById('todo-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
}

// 检查日期的待办事项状态
function checkDateTodoStatus(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateKey = `${year}-${month}-${day}`;
    
    // 获取日期的待办数据
    const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
    
    if (todos.length === 0) {
        return null; // 没有待办事项
    }
    
    // 检查是否所有待办事项都已完成
    const allCompleted = todos.every(todo => todo.completed);
    
    return allCompleted ? 'completed' : 'hasTodos';
}

// 设置视图模式
function setViewMode(mode) {
    if (mode === currentViewMode) return;
    
    currentViewMode = mode;
    
    // 更新按钮样式
    const weekBtn = document.getElementById('week-view-btn');
    const monthBtn = document.getElementById('month-view-btn');
    
    if (mode === 'week') {
        weekBtn.classList.remove('bg-gray-100', 'text-gray-600');
        weekBtn.classList.add('bg-primary', 'text-white');
        monthBtn.classList.remove('bg-primary', 'text-white');
        monthBtn.classList.add('bg-gray-100', 'text-gray-600');
    } else {
        weekBtn.classList.remove('bg-primary', 'text-white');
        weekBtn.classList.add('bg-gray-100', 'text-gray-600');
        monthBtn.classList.remove('bg-gray-100', 'text-gray-600');
        monthBtn.classList.add('bg-primary', 'text-white');
    }
    
    // 重新渲染日历
    renderCalendar();
}

// 渲染日历
function renderCalendar() {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const daysContainer = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    
    // 清空日历
    daysContainer.innerHTML = '';
    
    // 显示当前月份
    currentMonthElement.textContent = `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`;
    
    let daysToRender = [];
    
    if (currentViewMode === 'week') {
        // 周视图：渲染选中日期所在周的7天
        const selectedDayOfWeek = selectedDate.getDay(); // 0-6, 0是星期日
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDayOfWeek);
        
        // 创建一个包含7个日期的数组
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + i);
            daysToRender.push(currentDay);
        }
    } else {
        // 月视图：渲染整个月的日期
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // 获取当月第一天
        const firstDay = new Date(year, month, 1);
        // 获取当月最后一天
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取当月第一天是星期几
        const firstDayOfWeek = firstDay.getDay();
        
        // 获取上个月的最后几天（补足到第一行）
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevMonthDay = new Date(year, month, -i);
            daysToRender.push(prevMonthDay);
        }
        
        // 获取当月的所有日期
        for (let i = 1; i <= lastDay.getDate(); i++) {
            daysToRender.push(new Date(year, month, i));
        }
        
        // 获取下个月的前几天（补足到完整的日历网格）
        const totalCells = Math.ceil(daysToRender.length / 7) * 7;
        for (let i = daysToRender.length; i < totalCells; i++) {
            const nextMonthDay = new Date(year, month + 1, i - daysToRender.length + 1);
            daysToRender.push(nextMonthDay);
        }
    }
    
    // 渲染所有日期
    daysToRender.forEach(day => {
        // 创建日期单元格容器
        const cellContainer = document.createElement('div');
        cellContainer.classList.add('flex', 'justify-center', 'items-center');
        
        // 创建日期元素
        const dayElement = document.createElement('div');
        dayElement.textContent = day.getDate();
        
        // 设置基础样式
        dayElement.classList.add(
            'flex', 'items-center', 'justify-center',
            'w-[40px]', 'h-[40px]',
            'rounded-full', 'transition-all',
            'text-sm', 'cursor-pointer'
        );
        
        // 检查是否是今天
        const today = new Date();
        const isToday = day.getDate() === today.getDate() && 
                      day.getMonth() === today.getMonth() && 
                      day.getFullYear() === today.getFullYear();
        
        // 检查是否是选中的日期
        const isSelected = day.getDate() === selectedDate.getDate() && 
                          day.getMonth() === selectedDate.getMonth() && 
                          day.getFullYear() === selectedDate.getFullYear();
        
        // 检查是否是当月的日期
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        
        // 根据不同状态添加样式
        if (!isCurrentMonth) {
            dayElement.classList.add('text-gray-300');
        } else {
            dayElement.classList.add('hover:bg-primary/10');
        }
        
        if (isToday) {
            dayElement.classList.add('font-bold', 'text-primary');
        }
        
        if (isSelected) {
            dayElement.classList.add('bg-primary', 'text-white', 'font-medium');
        }
        
        // 检查日期的待办事项状态并添加标记
        const todoStatus = checkDateTodoStatus(day);
        if (todoStatus) {
            // 创建标记元素
            const marker = document.createElement('div');
            marker.classList.add(
                'absolute', 
                'bottom-0', 
                'w-1.5', 
                'h-1.5', 
                'rounded-full',
                'mb-1'
            );
            
            // 根据待办事项状态设置标记颜色
            if (todoStatus === 'completed') {
                marker.classList.add('bg-green-500'); // 绿色标记：所有待办事项都已完成
            } else {
                marker.classList.add('bg-red-500'); // 红色标记：有待办事项（无论是否完成）
            }
            
            // 为日期元素添加相对定位，以便标记可以绝对定位
            dayElement.classList.add('relative');
            
            // 将标记添加到日期元素
            dayElement.appendChild(marker);
        }
        
        // 添加点击事件
        dayElement.addEventListener('click', () => {
            selectedDate = new Date(day);
            renderCalendar();
            showTodosForDate(selectedDate);
        });
        
        // 将日期元素添加到单元格容器中
        cellContainer.appendChild(dayElement);
        // 将单元格容器添加到日历容器中
        daysContainer.appendChild(cellContainer);
    });
}

// 显示指定日期的待办
function showTodosForDate(date) {
    const todoList = document.getElementById('todo-list');
    const emptyTodo = document.getElementById('empty-todo');
    const currentDateDisplay = document.getElementById('current-date-display');
    
    // 格式化日期显示
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdayNames[date.getDay()];
    
    currentDateDisplay.textContent = `${year}年${month}月${day}日 ${weekday}`;
    
    // 获取日期的待办数据
    const dateKey = `${year}-${month}-${day}`;
    const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
    
    // 清空待办列表
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.classList.add('hidden');
        emptyTodo.classList.remove('hidden');
    } else {
        todoList.classList.remove('hidden');
        emptyTodo.classList.add('hidden');
        
        // 按照优先级和完成状态排序
        const sortedTodos = [...todos].sort((a, b) => {
            // 先按完成状态排序（未完成的在前）
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // 再按优先级排序（高优先级在前）
            const priorityOrder = { high: 0, medium: 1, low: 2, null: 3 };
            return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        });
        
        // 添加排序后的待办
        sortedTodos.forEach(todo => {
            addTodoToDOM(todo, dateKey);
        });
    }
}

// 添加待办到DOM
function addTodoToDOM(todo, dateKey) {
    const todoList = document.getElementById('todo-list');
    
    const todoItem = document.createElement('li');
    todoItem.classList.add('flex', 'items-center', 'space-x-2', 'p-2', 'rounded-lg', 'hover:bg-gray-50', 'transition-colors', 'cursor-move');
    
    // 根据优先级添加对应的CSS类
    if (todo.priority === 'high') {
        todoItem.classList.add('priority-high');
    } else if (todo.priority === 'medium') {
        todoItem.classList.add('priority-medium');
    } else if (todo.priority === 'low') {
        todoItem.classList.add('priority-low');
    }
    
    todoItem.setAttribute('draggable', 'true');
    todoItem.dataset.todoId = todo.id;
    
    // 拖拽事件处理
    todoItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', todo.id);
        todoItem.classList.add('opacity-50');
    });
    
    todoItem.addEventListener('dragend', () => {
        todoItem.classList.remove('opacity-50');
        // 移除所有临时的拖拽样式
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    });
    
    todoItem.addEventListener('dragover', (e) => {
        e.preventDefault();
        // 移除其他元素的拖拽样式
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        // 添加当前元素的拖拽样式
        todoItem.classList.add('drag-over');
    });
    
    todoItem.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedTodoId = parseInt(e.dataTransfer.getData('text/plain'));
        const targetTodoId = todo.id;
        
        if (draggedTodoId !== targetTodoId) {
            reorderTodos(draggedTodoId, targetTodoId, dateKey);
        }
        
        todoItem.classList.remove('drag-over');
    });
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.classList.add('w-4', 'h-4', 'accent-primary', 'cursor-pointer');
    checkbox.addEventListener('change', () => {
        toggleTodoStatus(todo.id, dateKey);
    });
    
    const todoText = document.createElement('span');
    todoText.textContent = todo.text;
    todoText.classList.add('flex-1', 'text-gray-700');
    if (todo.completed) {
        todoText.classList.add('line-through', 'text-gray-400');
    }

    // 添加创建时间显示
    const createTimeElement = document.createElement('span');
    createTimeElement.textContent = todo.createdAt ? formatDateTime(todo.createdAt) : '';
    createTimeElement.classList.add('text-xs', 'text-gray-400', 'ml-2');
    todoItem.appendChild(createTimeElement);
    
    // 优先级选择器
    const priorityContainer = document.createElement('div');
    priorityContainer.classList.add('relative');
    
    const priorityButton = document.createElement('button');
    priorityButton.classList.add('p-1', 'text-xs', 'rounded-full');
    
    // 设置按钮样式和图标根据当前优先级
    if (todo.priority === 'high') {
        priorityButton.innerHTML = '<i class="fa fa-flag text-red-500"></i>';
    } else if (todo.priority === 'medium') {
        priorityButton.innerHTML = '<i class="fa fa-flag text-amber-500"></i>';
    } else if (todo.priority === 'low') {
        priorityButton.innerHTML = '<i class="fa fa-flag text-green-500"></i>';
    } else {
        priorityButton.innerHTML = '<i class="fa fa-flag-o text-gray-400"></i>';
    }
    
    priorityButton.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 隐藏其他所有的优先级下拉菜单
        document.querySelectorAll('.priority-dropdown').forEach(dropdown => {
            dropdown.remove();
        });
        
        // 创建优先级下拉菜单
        const dropdown = document.createElement('div');
        dropdown.classList.add('priority-dropdown', 'absolute', 'right-0', 'mt-1', 'w-36', 'bg-white', 'rounded-lg', 'shadow-lg', 'py-1', 'z-10');
        
        // 高优先级选项
        const highOption = document.createElement('div');
        highOption.classList.add('flex', 'items-center', 'px-4', 'py-2', 'text-sm', 'hover:bg-gray-100', 'cursor-pointer');
        highOption.innerHTML = '<i class="fa fa-flag text-red-500 mr-2"></i>高优先级';
        highOption.addEventListener('click', () => {
            updateTodoPriority(todo.id, dateKey, 'high');
            dropdown.remove();
        });
        
        // 中优先级选项
        const mediumOption = document.createElement('div');
        mediumOption.classList.add('flex', 'items-center', 'px-4', 'py-2', 'text-sm', 'hover:bg-gray-100', 'cursor-pointer');
        mediumOption.innerHTML = '<i class="fa fa-flag text-amber-500 mr-2"></i>中优先级';
        mediumOption.addEventListener('click', () => {
            updateTodoPriority(todo.id, dateKey, 'medium');
            dropdown.remove();
        });
        
        // 低优先级选项
        const lowOption = document.createElement('div');
        lowOption.classList.add('flex', 'items-center', 'px-4', 'py-2', 'text-sm', 'hover:bg-gray-100', 'cursor-pointer');
        lowOption.innerHTML = '<i class="fa fa-flag text-green-500 mr-2"></i>低优先级';
        lowOption.addEventListener('click', () => {
            updateTodoPriority(todo.id, dateKey, 'low');
            dropdown.remove();
        });
        
        // 清除优先级选项
        const clearOption = document.createElement('div');
        clearOption.classList.add('flex', 'items-center', 'px-4', 'py-2', 'text-sm', 'hover:bg-gray-100', 'cursor-pointer');
        clearOption.innerHTML = '<i class="fa fa-flag-o text-gray-400 mr-2"></i>清除优先级';
        clearOption.addEventListener('click', () => {
            updateTodoPriority(todo.id, dateKey, null);
            dropdown.remove();
        });
        
        // 组装下拉菜单
        dropdown.appendChild(highOption);
        dropdown.appendChild(mediumOption);
        dropdown.appendChild(lowOption);
        dropdown.appendChild(clearOption);
        
        // 添加到容器
        priorityContainer.appendChild(dropdown);
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', closeDropdown);
        
        function closeDropdown(event) {
            if (!dropdown.contains(event.target) && event.target !== priorityButton) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        }
    });
    
    priorityContainer.appendChild(priorityButton);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa fa-trash-o text-gray-400 hover:text-red-500 transition-colors"></i>';
    deleteBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors');
    deleteBtn.addEventListener('click', () => {
        deleteTodo(todo.id, dateKey);
    });
    
    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    todoItem.appendChild(priorityContainer);
    todoItem.appendChild(deleteBtn);
    
    todoList.appendChild(todoItem);
}

// 更新待办事项优先级
function updateTodoPriority(todoId, dateKey, priority) {
    const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
    
    // 查找并更新待办
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex !== -1) {
        todos[todoIndex].priority = priority;
        todos[todoIndex].updatedAt = new Date().toISOString();
        
        // 保存到localStorage
        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
        
        // 更新显示
        showTodosForDate(selectedDate);
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 重新排序待办事项
function reorderTodos(draggedId, targetId, dateKey) {
    const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
    
    // 找到拖拽和目标待办的索引
    const draggedIndex = todos.findIndex(todo => todo.id === draggedId);
    const targetIndex = todos.findIndex(todo => todo.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        // 分离拖拽的待办
        const [draggedTodo] = todos.splice(draggedIndex, 1);
        
        // 插入到新位置
        todos.splice(targetIndex, 0, draggedTodo);
        
        // 保存到localStorage
        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
        
        // 更新显示
        showTodosForDate(selectedDate);
    }
}

// 添加新待办
async function addTodo() { // 确保函数是异步的，因为Supabase操作是异步的
    const todoInput = document.getElementById('todo-input');
    const text = todoInput.value.trim();

    if (text) {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        const dateKey = `${year}-${month}-${day}`;

        // 检查Supabase客户端是否已初始化
        if (window.supabase) {
            try {
                // 获取当前用户信息
                const { data: { user } } = await window.supabase.auth.getUser();

                // 只有当用户登录时才同步到云端
                if (user) {
                    // 新待办的数据结构，包括 user_id
                    const newTodo = {
                        text: text,
                        user_id: user.id, // 将待办事项与用户关联
                        completed: false,
                        priority: null, // null, 'low', 'medium', 'high'
                        date_key: dateKey
                    };

                    // 向 Supabase 插入数据
                    const { data, error } = await window.supabase
                        .from('todos')
                        .insert([newTodo])
                        .select(); // 插入后返回新创建的数据

                    if (error) {
                        console.error('Error inserting todo:', error);
                        alert('云端同步失败，待办事项将只保存在本地。');
                        // 只在本地保存作为备用方案
                        const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
                        todos.push(newTodo);
                        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
                    } else {
                        console.log('数据成功写入Supabase:', data);
                        // 只有当数据成功写入Supabase后，才将其保存到本地存储
                        const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
                        todos.push(newTodo);
                        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
                    }

                    // 清空输入框
                    todoInput.value = '';

                    // 更新显示
                    showTodosForDate(selectedDate);
                    renderCalendar();

                    return;
                }
            } catch (error) {
                console.error('Supabase操作异常:', error);
                // 异常情况下继续执行本地保存逻辑
            }
        }
        
        // 如果Supabase未初始化、用户未登录或操作失败，只保存到本地
        const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        todos.push(newTodo);
        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));

        // 清空输入框并更新显示
        todoInput.value = '';
        showTodosForDate(selectedDate);
        renderCalendar();
    }
}

// 切换待办状态
function toggleTodoStatus(id, dateKey) {
    // 获取现有待办
    const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
    
    // 查找并更新待办
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        todos[todoIndex].updatedAt = new Date().toISOString();
        
        // 保存到localStorage
        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
        
        // 更新显示
        showTodosForDate(selectedDate);
        // 更新日历标记
        renderCalendar();
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 删除待办
function deleteTodo(id, dateKey) {
    // 获取现有待办
    const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
    
    // 过滤掉要删除的待办
    const updatedTodos = todos.filter(todo => todo.id !== id);
    
    // 保存到localStorage
    localStorage.setItem(`todos_${dateKey}`, JSON.stringify(updatedTodos));
    
    // 更新显示
    showTodosForDate(selectedDate);
    // 更新日历标记
    renderCalendar();
    
    // 触发数据同步到云端
    if (window.syncData) {
        window.syncData();
    }
}

// 初始化长期计划页面
function initPlanPage() {
    // 使用防抖函数确保按钮初始化完成
    function debounce(fn, wait) {
        let timer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(context, args);
            }, wait);
        };
    }
    
    // 初始化搜索框
    const initSearchBox = debounce(() => {
        const searchInput = document.getElementById('plan-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderPlans();
            });
        }
    }, 100);
    
    // 初始化添加计划按钮的函数
    const initAddPlanButton = debounce(() => {
        const addPlanBtn = document.getElementById('add-plan');
        
        if (addPlanBtn) {
            // 移除旧的事件监听器
            const newAddPlanBtn = addPlanBtn.cloneNode(true);
            addPlanBtn.parentNode.replaceChild(newAddPlanBtn, addPlanBtn);
            
            // 添加新的事件监听器
            newAddPlanBtn.addEventListener('click', () => {
                // 直接显示模态框，不依赖任何可能有问题的函数
                const modalBackdrop = document.getElementById('modal-backdrop');
                const modalContainer = document.getElementById('modal-container');
                const modalTitle = document.getElementById('modal-title');
                const modalInput = document.getElementById('modal-input');
                const modalSave = document.getElementById('modal-save');
                const modalCancel = document.getElementById('modal-cancel');
                
                // 设置模态框内容
                modalTitle.textContent = '添加新计划';
                modalInput.placeholder = '请输入计划标题';
                modalInput.value = '';
                
                // 显示模态框
                modalBackdrop.classList.remove('hidden');
                setTimeout(() => {
                    modalContainer.classList.remove('scale-95', 'opacity-0');
                    modalContainer.classList.add('scale-100', 'opacity-100');
                    modalInput.focus();
                }, 10);
                
                // 保存按钮点击事件
                const handleSave = () => {
                    const title = modalInput.value.trim();
                    if (title) {
                        addNewPlan(title);
                    }
                    // 隐藏模态框
                    modalContainer.classList.remove('scale-100', 'opacity-100');
                    modalContainer.classList.add('scale-95', 'opacity-0');
                    setTimeout(() => {
                        modalBackdrop.classList.add('hidden');
                    }, 300);
                    // 移除事件监听器，避免重复绑定
                    modalSave.removeEventListener('click', handleSave);
                    modalCancel.removeEventListener('click', handleCancel);
                };
                
                // 取消按钮点击事件
                const handleCancel = () => {
                    // 隐藏模态框
                    modalContainer.classList.remove('scale-100', 'opacity-100');
                    modalContainer.classList.add('scale-95', 'opacity-0');
                    setTimeout(() => {
                        modalBackdrop.classList.add('hidden');
                    }, 300);
                    // 移除事件监听器，避免重复绑定
                    modalSave.removeEventListener('click', handleSave);
                    modalCancel.removeEventListener('click', handleCancel);
                };
                
                // 绑定事件
                modalSave.addEventListener('click', handleSave);
                modalCancel.addEventListener('click', handleCancel);
            });
        }
    }, 100);
    
    // 立即尝试初始化
    initAddPlanButton();
    initSearchBox();
    
    // 监听页面切换，确保按钮和搜索框总是能正确初始化
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link') && e.target.closest('.nav-link').getAttribute('href') === '#plan') {
            initAddPlanButton();
            initSearchBox();
        }
    });
    
    // 加载已保存的计划
    loadPlans();
}

// 添加新计划
function addNewPlan(title) {
    // 获取现有计划
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    
    // 创建新计划
    const newPlan = {
        id: Date.now(),
        title: title,
        description: '',
        subtasks: [],
        priority: null, // null, 'low', 'medium', 'high'
        createdAt: Date.now() // 添加创建时间
    };
    
    plans.push(newPlan);
    
    // 保存到localStorage
    localStorage.setItem('plans', JSON.stringify(plans));
    
    // 更新显示
    renderPlans();
}

// 加载计划
function loadPlans() {
    renderPlans();
}

// 渲染计划列表
function renderPlans() {
    const plansContainer = document.getElementById('plans-container');
    const emptyPlan = document.getElementById('empty-plan');
    
    // 获取现有计划
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    
    // 清空容器
    plansContainer.innerHTML = '';
    
    if (plans.length === 0) {
        plansContainer.classList.add('hidden');
        emptyPlan.classList.remove('hidden');
    } else {
        // 获取搜索关键词
        const searchInput = document.getElementById('plan-search');
        const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        // 搜索筛选
        let filteredPlans = plans;
        if (searchKeyword) {
            filteredPlans = plans.filter(plan => {
                // 检查计划标题是否包含关键词
                const titleMatch = plan.title.toLowerCase().includes(searchKeyword);
                
                // 检查子任务内容是否包含关键词
                const subtaskMatch = plan.subtasks && plan.subtasks.some(subtask => 
                    subtask.text.toLowerCase().includes(searchKeyword)
                );
                
                return titleMatch || subtaskMatch;
            });
        }
        
        if (filteredPlans.length === 0) {
            plansContainer.classList.add('hidden');
            emptyPlan.classList.remove('hidden');
        } else {
            plansContainer.classList.remove('hidden');
            emptyPlan.classList.add('hidden');
            
            // 按照完成状态和创建时间排序
            const sortedPlans = [...filteredPlans].sort((a, b) => {
                // 先按完成状态排序（未完成的在前）
                const aCompleted = isPlanCompleted(a);
                const bCompleted = isPlanCompleted(b);
                if (aCompleted !== bCompleted) {
                    return aCompleted ? 1 : -1;
                }
                
                // 再按创建时间排序（最新的在前）
                return b.id - a.id; // 假设id是时间戳
            });
            
            // 渲染每个计划
            sortedPlans.forEach(plan => {
                renderPlan(plan);
            });
        }
    }
}

// 检查计划是否已完成
function isPlanCompleted(plan) {
    // 没有子任务的计划默认为进行中
    if (!plan.subtasks || plan.subtasks.length === 0) {
        return false;
    }
    
    // 检查是否所有子任务都已完成
    return plan.subtasks.every(subtask => subtask.completed);
}

// 更新计划状态显示
function updatePlanStatus(planId) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const plan = plans.find(p => p.id === planId);
    
    if (plan) {
        const planHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
        if (planHeader) {
            const planCard = planHeader.closest('div');
            const statusElement = planHeader.querySelector('.plan-status');
            const isCompleted = isPlanCompleted(plan);
            
            // 更新卡片背景
            if (isCompleted) {
                planCard.classList.add('bg-gray-50');
                planCard.classList.remove('bg-white');
            } else {
                planCard.classList.add('bg-white');
                planCard.classList.remove('bg-gray-50');
            }
            
            // 更新状态显示
            if (statusElement) {
                if (isCompleted) {
                    statusElement.innerHTML = '<span class="text-green-500 text-xs font-medium">已完成</span>';
                } else {
                    statusElement.innerHTML = '<span class="text-gray-400 text-xs font-medium">进行中</span>';
                }
            }
        }
    }
}

// 渲染单个计划
function renderPlan(plan) {
    const plansContainer = document.getElementById('plans-container');
    const planCard = document.createElement('div');
    
    // 根据计划完成状态设置卡片背景
    const isCompleted = isPlanCompleted(plan);
    planCard.classList.add('rounded-xl', 'shadow-md', 'mb-4', 'overflow-hidden');
    if (isCompleted) {
        planCard.classList.add('bg-gray-50');
    } else {
        planCard.classList.add('bg-white');
    }

    // 计划标题和展开/折叠按钮
    const planHeader = document.createElement('div');
    planHeader.classList.add('flex', 'justify-between', 'items-center', 'p-4', 'cursor-pointer');
    planHeader.dataset.planId = plan.id;

    // 左侧内容（标题、状态和创建时间）
    const leftContent = document.createElement('div');
    leftContent.classList.add('flex', 'flex-col', 'space-y-1');
    
    const titleContainer = document.createElement('div');
    titleContainer.classList.add('flex', 'items-center', 'space-x-2');
    
    const planTitle = document.createElement('h3');
    planTitle.textContent = plan.title;
    planTitle.classList.add('font-semibold', 'text-gray-800');
    
    // 状态显示元素
    const statusElement = document.createElement('span');
    statusElement.classList.add('plan-status');
    if (isCompleted) {
        statusElement.innerHTML = '<span class="text-green-500 text-xs font-medium">已完成</span>';
    } else {
        statusElement.innerHTML = '<span class="text-gray-400 text-xs font-medium">进行中</span>';
    }
    
    titleContainer.appendChild(planTitle);
    titleContainer.appendChild(statusElement);
    
    // 创建时间显示
    const createdTimeElement = document.createElement('span');
    createdTimeElement.textContent = `创建于: ${formatDateTime(plan.createdAt || plan.id)}`;
    createdTimeElement.classList.add('text-xs', 'text-gray-400');
    
    leftContent.appendChild(titleContainer);
    leftContent.appendChild(createdTimeElement);
    planTitle.addEventListener('dblclick', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        showModal(
            '编辑计划标题',
            '请输入新的计划标题',
            plan.title,
            (newTitle) => {
                if (newTitle && newTitle.trim() && newTitle.trim() !== plan.title) {
                    updatePlanTitle(plan.id, newTitle.trim());
                }
            }
        );
    });
    
    // 展开/折叠图标
    const toggleIcon = document.createElement('div');
    toggleIcon.innerHTML = '<i class="fa fa-chevron-down text-gray-400 transition-transform duration-300"></i>';
    toggleIcon.classList.add('flex-shrink-0');
    
    // 删除按钮
    const deletePlanBtn = document.createElement('button');
    deletePlanBtn.innerHTML = '<i class="fa fa-trash-o text-gray-400 hover:text-red-500 transition-colors"></i>';
    deletePlanBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors', 'ml-2');
    deletePlanBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        showConfirmModal(
            '确认删除',
            '确定要删除这个计划吗？此操作无法撤销。',
            () => {
                deletePlan(plan.id);
            }
        );
    });
    
    // 右侧操作区
    const actionsSide = document.createElement('div');
    actionsSide.classList.add('flex', 'items-center');
    actionsSide.appendChild(toggleIcon);
    actionsSide.appendChild(deletePlanBtn);
    
    leftContent.appendChild(planTitle);
    leftContent.appendChild(statusElement);
    
    planHeader.appendChild(leftContent);
    planHeader.appendChild(actionsSide);
    
    // 计划内容区域（默认隐藏）
    const planContent = document.createElement('div');
    planContent.classList.add('px-4', 'pb-4', 'hidden', 'overflow-hidden', 'transition-all', 'duration-300');
    planContent.style.maxHeight = '0';
    planContent.dataset.planId = plan.id;
    
    // 计划描述
    const planDescription = document.createElement('div');
    const descriptionInput = document.createElement('textarea');
    descriptionInput.value = plan.description || '';
    descriptionInput.placeholder = '添加计划描述...';
    descriptionInput.classList.add('w-full', 'p-2', 'text-sm', 'border', 'border-gray-200', 'rounded-lg', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'focus:border-primary', 'transition-all', 'resize-none');
    descriptionInput.rows = 2;
    descriptionInput.addEventListener('blur', () => {
        updatePlanDescription(plan.id, descriptionInput.value);
    });
    
    planDescription.appendChild(descriptionInput);
    
    // 子任务区域
    const subtasksContainer = document.createElement('div');
    subtasksContainer.classList.add('mt-4');
    
    const subtasksList = document.createElement('ul');
    subtasksList.classList.add('space-y-2', 'mb-3');
    
    // 渲染子任务
    (plan.subtasks || []).forEach(subtask => {
        const subtaskItem = document.createElement('li');
        subtaskItem.classList.add('flex', 'items-center', 'space-x-2', 'cursor-move');
        subtaskItem.setAttribute('draggable', 'true');
        subtaskItem.dataset.subtaskId = subtask.id;
        
        // 拖拽事件处理
        subtaskItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({planId: plan.id, subtaskId: subtask.id}));
            subtaskItem.classList.add('opacity-50');
        });
        
        subtaskItem.addEventListener('dragend', () => {
            subtaskItem.classList.remove('opacity-50');
            // 移除所有临时的拖拽样式
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        });
        
        subtaskItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            // 移除其他元素的拖拽样式
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
            // 添加当前元素的拖拽样式
            subtaskItem.classList.add('drag-over');
        });
        
        subtaskItem.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const targetSubtaskId = subtask.id;
            
            if (draggedData.subtaskId !== targetSubtaskId) {
                reorderSubtasks(draggedData.planId, draggedData.subtaskId, targetSubtaskId);
            }
            
            subtaskItem.classList.remove('drag-over');
        });
        
        const subtaskCheckbox = document.createElement('input');
        subtaskCheckbox.type = 'checkbox';
        subtaskCheckbox.checked = subtask.completed;
        subtaskCheckbox.classList.add('w-3', 'h-3', 'accent-primary', 'cursor-pointer');
        subtaskCheckbox.addEventListener('change', () => {
            toggleSubtaskStatus(plan.id, subtask.id);
        });
        
        const subtaskTextContainer = document.createElement('div');
        subtaskTextContainer.classList.add('flex-1');
        
        const subtaskText = document.createElement('span');
        subtaskText.textContent = subtask.text;
        subtaskText.classList.add('text-sm');
        if (subtask.completed) {
            subtaskText.classList.add('line-through', 'text-gray-400');
        }
        
        // 子任务创建时间
        const subtaskCreatedTime = document.createElement('div');
        subtaskCreatedTime.textContent = formatDateTime(subtask.createdAt || subtask.id);
        subtaskCreatedTime.classList.add('text-xs', 'text-gray-400');
        
        subtaskTextContainer.appendChild(subtaskText);
        subtaskTextContainer.appendChild(subtaskCreatedTime);
        
        const subtaskDeleteBtn = document.createElement('button');
        subtaskDeleteBtn.innerHTML = '<i class="fa fa-times text-gray-400 hover:text-red-500 transition-colors"></i>';
        subtaskDeleteBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors');
        subtaskDeleteBtn.addEventListener('click', () => {
            deleteSubtask(plan.id, subtask.id);
        });
        
        subtaskItem.appendChild(subtaskCheckbox);
        subtaskItem.appendChild(subtaskTextContainer);
        subtaskItem.appendChild(subtaskDeleteBtn);
        subtasksList.appendChild(subtaskItem);
    });
    
    // 添加子任务
    const addSubtaskContainer = document.createElement('div');
    addSubtaskContainer.classList.add('flex', 'items-center', 'space-x-2');
    
    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.placeholder = '添加子任务...';
    subtaskInput.classList.add('flex-1', 'text-sm', 'p-2', 'border', 'border-gray-200', 'rounded-lg', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'focus:border-primary', 'transition-all');
    
    const addSubtaskBtn = document.createElement('button');
    addSubtaskBtn.innerHTML = '<i class="fa fa-plus text-primary"></i>';
    addSubtaskBtn.classList.add('p-1.5', 'bg-primary/10', 'rounded-lg', 'hover:bg-primary/20', 'transition-colors');
    addSubtaskBtn.addEventListener('click', () => {
        addSubtask(plan.id, subtaskInput.value);
        subtaskInput.value = '';
    });
    
    subtaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSubtask(plan.id, subtaskInput.value);
            subtaskInput.value = '';
        }
    });
    
    addSubtaskContainer.appendChild(subtaskInput);
    addSubtaskContainer.appendChild(addSubtaskBtn);
    
    subtasksContainer.appendChild(subtasksList);
    subtasksContainer.appendChild(addSubtaskContainer);
    
    // 组装计划内容
    planContent.appendChild(planDescription);
    planContent.appendChild(subtasksContainer);
    
    // 组装计划卡片
    planCard.appendChild(planHeader);
    planCard.appendChild(planContent);
    
    plansContainer.appendChild(planCard);
    
    // 添加点击展开/折叠事件
    planHeader.addEventListener('click', (e) => {
        // 确保不是点击删除按钮时触发
        if (!e.target.closest('button')) {
            const content = document.querySelector(`div[data-plan-id="${plan.id}"]:not(.cursor-pointer)`);
            const icon = toggleIcon.querySelector('i');
            
            if (content.classList.contains('hidden')) {
                // 展开
                content.classList.remove('hidden');
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }, 10);
                icon.style.transform = 'rotate(180deg)';
            } else {
                // 折叠
                content.style.maxHeight = '0';
                content.addEventListener('transitionend', function hideContent() {
                    content.classList.add('hidden');
                    content.removeEventListener('transitionend', hideContent);
                }, { once: true });
                icon.style.transform = 'rotate(0)';
            }
        }
    });
}

// 更新计划标题
function updatePlanTitle(planId, newTitle) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        plans[planIndex].title = newTitle;
        plans[planIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('plans', JSON.stringify(plans));
        renderPlans();
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 更新计划优先级
function updatePlanPriority(planId, priority) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        plans[planIndex].priority = priority;
        plans[planIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('plans', JSON.stringify(plans));
        renderPlans();
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 更新计划描述
function updatePlanDescription(planId, newDescription) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        plans[planIndex].description = newDescription;
        plans[planIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('plans', JSON.stringify(plans));
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 添加子任务
function addSubtask(planId, subtaskText) {
    if (subtaskText && subtaskText.trim()) {
        const plans = JSON.parse(localStorage.getItem('plans') || '[]');
        const planIndex = plans.findIndex(plan => plan.id === planId);
        
        if (planIndex !== -1) {
            const newSubtask = {
                id: Date.now(),
                text: subtaskText.trim(),
                completed: false,
                createdAt: Date.now(), // 添加创建时间
                updatedAt: Date.now()
            };
            
            plans[planIndex].subtasks.push(newSubtask);
            plans[planIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('plans', JSON.stringify(plans));
            
            // 更新计划状态
            updatePlanStatus(planId);
            
            // 简化实现：重新渲染所有计划
            // 这样可以确保所有状态都正确同步，避免复杂的DOM操作导致的问题
            renderPlans();
            
            // 触发数据同步到云端
            if (window.syncData) {
                window.syncData();
            }
        }
    }
}

// 重新排序子任务
function reorderSubtasks(planId, draggedSubtaskId, targetSubtaskId) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        // 找到拖拽和目标子任务的索引
        const draggedIndex = plans[planIndex].subtasks.findIndex(subtask => subtask.id === draggedSubtaskId);
        const targetIndex = plans[planIndex].subtasks.findIndex(subtask => subtask.id === targetSubtaskId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // 分离拖拽的子任务
            const [draggedSubtask] = plans[planIndex].subtasks.splice(draggedIndex, 1);
            
            // 插入到新位置
            plans[planIndex].subtasks.splice(targetIndex, 0, draggedSubtask);
            
            // 更新更新时间戳
            plans[planIndex].updatedAt = new Date().toISOString();
            
            // 保存到localStorage
            localStorage.setItem('plans', JSON.stringify(plans));
            
            // 更新显示
            const planHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
            if (planHeader) {
                const planCard = planHeader.closest('div');
                const planContent = planCard.querySelector(`div[data-plan-id="${planId}"]:not(.cursor-pointer)`);
                const isExpanded = planContent && !planContent.classList.contains('hidden');
                
                if (isExpanded) {
                    // 重新渲染这个特定计划，但保持展开状态
                    const wasExpanded = true;
                    
                    // 先移除旧的计划卡片
                    planCard.remove();
                    
                    // 再渲染更新后的计划
                    renderPlan(plans[planIndex]);
                    
                    // 如果之前是展开状态，重新展开它
                    if (wasExpanded) {
                        setTimeout(() => {
                            const newHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
                            if (newHeader) {
                                newHeader.click();
                            }
                        }, 10);
                    }
                }
            }
            
            // 触发数据同步到云端
            if (window.syncData) {
                window.syncData();
            }
        }
    }
}

// 切换子任务状态
function toggleSubtaskStatus(planId, subtaskId) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        const subtaskIndex = plans[planIndex].subtasks.findIndex(subtask => subtask.id === subtaskId);
        if (subtaskIndex !== -1) {
            plans[planIndex].subtasks[subtaskIndex].completed = !plans[planIndex].subtasks[subtaskIndex].completed;
            plans[planIndex].subtasks[subtaskIndex].updatedAt = new Date().toISOString();
            plans[planIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('plans', JSON.stringify(plans));
            
            // 更新计划状态
            updatePlanStatus(planId);
            
            // 直接更新DOM而不是重新渲染整个列表
            const planHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
            if (planHeader) {
                const planCard = planHeader.closest('div');
                const planContent = planCard.querySelector(`div[data-plan-id="${planId}"]:not(.cursor-pointer)`);
                const isExpanded = planContent && !planContent.classList.contains('hidden');
                
                if (isExpanded) {
                    // 遍历所有子任务元素，找到匹配的子任务
                    const subtaskItems = planCard.querySelectorAll('li.flex.items-center.space-x-2');
                    subtaskItems.forEach(item => {
                        const checkbox = item.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            // 找到与新状态匹配的复选框（因为我们刚刚切换了状态）
                            if (checkbox.checked === plans[planIndex].subtasks[subtaskIndex].completed) {
                                const textElement = item.querySelector('span.text-sm');
                                if (textElement) {
                                    if (plans[planIndex].subtasks[subtaskIndex].completed) {
                                        textElement.classList.add('line-through', 'text-gray-400');
                                    } else {
                                        textElement.classList.remove('line-through', 'text-gray-400');
                                    }
                                }
                            }
                        }
                    });
                }
            }
            
            // 触发数据同步到云端
            if (window.syncData) {
                window.syncData();
            }
        }
    }
}

// 删除子任务
function deleteSubtask(planId, subtaskId) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        // 先保存更新后的数据
        plans[planIndex].subtasks = plans[planIndex].subtasks.filter(subtask => subtask.id !== subtaskId);
        plans[planIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('plans', JSON.stringify(plans));
        
        // 更新计划状态
        updatePlanStatus(planId);
        
        // 直接更新DOM而不是重新渲染整个列表
        const planHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
        if (planHeader) {
            const planCard = planHeader.closest('div');
            const planContent = planCard.querySelector(`div[data-plan-id="${planId}"]:not(.cursor-pointer)`);
            const isExpanded = planContent && !planContent.classList.contains('hidden');
            
            if (isExpanded) {
                // 重新渲染这个特定计划，但保持展开状态
                const wasExpanded = true;
                
                // 先移除旧的计划卡片
                planCard.remove();
                
                // 再渲染更新后的计划
                renderPlan(plans[planIndex]);
                
                // 如果之前是展开状态，重新展开它
                if (wasExpanded) {
                    setTimeout(() => {
                        const newHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
                        if (newHeader) {
                            newHeader.click();
                        }
                    }, 10);
                }
            }
        }
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 删除计划
function deletePlan(planId) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    
    localStorage.setItem('plans', JSON.stringify(updatedPlans));
    renderPlans();
    
    // 触发数据同步到云端
    if (window.syncData) {
        window.syncData();
    }
}

// 初始化随手记页面
function initNotesPage() {
    const saveNoteBtn = document.getElementById('save-note');
    
    saveNoteBtn.addEventListener('click', saveNote);
    
    document.getElementById('note-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveNote();
        }
    });
    
    // 加载已保存的笔记
    loadNotes();
}

// 保存笔记
function saveNote() {
    const noteInput = document.getElementById('note-input');
    const content = noteInput.value.trim();
    
    if (content) {
        // 获取现有笔记
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // 创建新笔记
        const newNote = {
            id: Date.now(),
            content: content,
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.unshift(newNote); // 新笔记添加到开头
        
        // 保存到localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // 清空输入框
        noteInput.value = '';
        
        // 更新显示
        renderNotes();
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 加载笔记
function loadNotes() {
    renderNotes();
}

// 渲染笔记列表
function renderNotes() {
    const notesContainer = document.getElementById('notes-container');
    const emptyNotes = document.getElementById('empty-notes');
    
    // 获取现有笔记
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    // 清空容器
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        notesContainer.classList.add('hidden');
        emptyNotes.classList.remove('hidden');
    } else {
        notesContainer.classList.remove('hidden');
        emptyNotes.classList.add('hidden');
        
        // 渲染每个笔记
        notes.forEach(note => {
            renderNote(note);
        });
    }
}

// 渲染单个笔记
function renderNote(note) {
    const notesContainer = document.getElementById('notes-container');
    
    const noteCard = document.createElement('div');
    noteCard.classList.add('bg-white', 'rounded-xl', 'shadow-md', 'p-4');
    
    // 笔记内容显示模式
    const noteContent = document.createElement('p');
    noteContent.textContent = note.content;
    noteContent.classList.add('text-gray-700', 'mb-3', 'whitespace-pre-wrap');
    
    // 笔记内容编辑模式
    const noteEditor = document.createElement('textarea');
    noteEditor.value = note.content;
    noteEditor.classList.add('w-full', 'text-gray-700', 'mb-3', 'whitespace-pre-wrap', 'p-2', 'border', 'border-primary', 'rounded-lg', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50', 'hidden');
    noteEditor.style.minHeight = '100px';
    
    // 笔记时间戳
    const timestamp = new Date(note.timestamp);
    const formattedTime = formatDate(timestamp);
    
    const noteFooter = document.createElement('div');
    noteFooter.classList.add('flex', 'justify-between', 'items-center');
    
    const timeElement = document.createElement('span');
    timeElement.textContent = formattedTime;
    timeElement.classList.add('text-xs', 'text-gray-400');
    
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('flex', 'space-x-2');
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fa fa-pencil text-gray-400 hover:text-primary transition-colors"></i>';
    editBtn.classList.add('p-1', 'rounded-full', 'hover:bg-primary/10', 'transition-colors');
    editBtn.addEventListener('click', () => {
        // 切换到编辑模式
        noteContent.classList.add('hidden');
        noteEditor.classList.remove('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
        deleteBtn.classList.add('hidden');
        
        // 自动聚焦编辑框
        noteEditor.focus();
    });
    
    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="fa fa-check text-green-500 hover:text-green-600 transition-colors"></i>';
    saveBtn.classList.add('p-1', 'rounded-full', 'hover:bg-green-50', 'transition-colors', 'hidden');
    saveBtn.addEventListener('click', () => {
        // 获取编辑后的内容
        const updatedContent = noteEditor.value.trim();
        if (updatedContent) {
            // 更新笔记
            updateNote(note.id, updatedContent);
        }
        // 切换回显示模式
        noteContent.classList.remove('hidden');
        noteEditor.classList.add('hidden');
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        deleteBtn.classList.remove('hidden');
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fa fa-times text-gray-400 hover:text-gray-600 transition-colors"></i>';
    cancelBtn.classList.add('p-1', 'rounded-full', 'hover:bg-gray-100', 'transition-colors', 'hidden');
    cancelBtn.addEventListener('click', () => {
        // 恢复原始内容
        noteEditor.value = note.content;
        // 切换回显示模式
        noteContent.classList.remove('hidden');
        noteEditor.classList.add('hidden');
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        deleteBtn.classList.remove('hidden');
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa fa-trash-o text-gray-400 hover:text-red-500 transition-colors"></i>';
    deleteBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors');
    deleteBtn.addEventListener('click', () => {
        deleteNote(note.id);
    });
    
    // 组装操作按钮
    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(saveBtn);
    actionsContainer.appendChild(cancelBtn);
    actionsContainer.appendChild(deleteBtn);
    
    noteFooter.appendChild(timeElement);
    noteFooter.appendChild(actionsContainer);
    
    noteCard.appendChild(noteContent);
    noteCard.appendChild(noteEditor);
    noteCard.appendChild(noteFooter);
    
    notesContainer.appendChild(noteCard);
}

// 更新笔记
function updateNote(noteId, newContent) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex !== -1) {
        notes[noteIndex].content = newContent;
        notes[noteIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        
        // 触发数据同步到云端
        if (window.syncData) {
            window.syncData();
        }
    }
}

// 格式化日期
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // 今天
        return '今天 ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    } else if (diffDays === 1) {
        // 昨天
        return '昨天 ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    } else if (diffDays < 7) {
        // 本周内
        const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return weekdayNames[date.getDay()] + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    } else {
        // 其他日期
        return (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    }
}

// 删除笔记
function deleteNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const updatedNotes = notes.filter(note => note.id !== noteId);
    
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    renderNotes();
    
    // 触发数据同步到云端
    if (window.syncData) {
        window.syncData();
    }
}

// AI助手功能
function initAIAssistant() {
    // 获取AI助手相关DOM元素
    const aiChatContainer = document.getElementById('ai-chat-container');
    const aiInput = document.getElementById('ai-input');
    const sendAiQueryBtn = document.getElementById('send-ai-query');
    const minimizeAiBtn = document.getElementById('minimize-ai');
    const closeAiBtn = document.getElementById('close-ai');
    const aiShortcuts = document.querySelectorAll('.ai-shortcut');
    
    // AI助手窗口状态
    let aiAssistantMinimized = false;
    let aiAssistantClosed = false;
    
    // 初始化AI助手相关事件监听器
    
    // 发送AI查询
    sendAiQueryBtn.addEventListener('click', () => {
        sendAIQuery();
    });
    
    // 回车发送消息
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIQuery();
        }
    });
    
    // 自动调整文本域高度
    aiInput.addEventListener('input', () => {
        // 重置高度，以便正确计算内容高度
        aiInput.style.height = 'auto';
        
        // 设置新高度，但不超过最大高度
        const maxHeight = parseInt(window.getComputedStyle(aiInput).maxHeight);
        const newHeight = Math.min(aiInput.scrollHeight, maxHeight);
        aiInput.style.height = newHeight + 'px';
    });
    
    // 最小化AI助手
    minimizeAiBtn.addEventListener('click', () => {
        const aiChatContainer = document.getElementById('ai-chat-container');
        const aiInputContainer = document.querySelector('#notes .lg\\:w-1\\/3 .bg-white.rounded-xl.shadow-md.overflow-hidden.h-full .p-3.border-t.border-gray-200');
        
        if (aiAssistantMinimized) {
            aiChatContainer.style.display = 'block';
            aiInputContainer.style.display = 'block';
            minimizeAiBtn.innerHTML = '<i class="fa fa-window-minimize"></i>';
        } else {
            aiChatContainer.style.display = 'none';
            aiInputContainer.style.display = 'none';
            minimizeAiBtn.innerHTML = '<i class="fa fa-window-maximize"></i>';
        }
        
        aiAssistantMinimized = !aiAssistantMinimized;
    });
    
    // 修改关闭按钮为最小化功能，确保AI助手始终可见
    closeAiBtn.addEventListener('click', () => {
        const aiChatContainer = document.getElementById('ai-chat-container');
        const aiInputContainer = document.querySelector('#notes .lg\\:w-1\\/3 .bg-white.rounded-xl.shadow-md.overflow-hidden.h-full .p-3.border-t.border-gray-200');
        
        // 无论之前状态如何，点击关闭按钮时都只执行最小化操作
        if (!aiAssistantMinimized) {
            aiChatContainer.style.display = 'none';
            aiInputContainer.style.display = 'none';
            minimizeAiBtn.innerHTML = '<i class="fa fa-window-maximize"></i>';
            aiAssistantMinimized = true;
        }
    });
    
    // 快捷功能按钮
    aiShortcuts.forEach(shortcut => {
        shortcut.addEventListener('click', () => {
            const query = shortcut.getAttribute('data-query');
            aiInput.value = query;
            sendAIQuery();
        });
    });
}

// 发送AI查询
async function sendAIQuery() {
    const aiInput = document.getElementById('ai-input');
    const query = aiInput.value.trim();
    
    if (!query) return;
    
    // 显示用户消息
    displayUserMessage(query);
    
    // 清空输入框
    aiInput.value = '';
    
    // 显示AI正在输入
    displayTypingIndicator();
    
    try {
        // 根据用户查询获取相关数据
        const relevantData = collectRelevantData(query);
        
        // 尝试调用服务器端API
        try {
            const response = await fetch('http://localhost:8001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    context: relevantData
                })
            });
            
            // 移除正在输入的指示器
            removeTypingIndicator();
            
            if (response.ok) {
                // 解析响应
                const data = await response.json();
                
                if (!data.error) {
                    // 显示AI回复
                    displayAIMessage(data.response);
                    return;
                }
            }
        } catch (apiError) {
            console.log('API调用失败，使用模拟响应:', apiError);
        }
        
        // 移除正在输入的指示器
        removeTypingIndicator();
        
        // API调用失败时，使用模拟响应
        const mockResponse = generateMockAIResponse(query, relevantData);
        displayAIMessage(mockResponse);
        
    } catch (error) {
        // 移除正在输入的指示器
        removeTypingIndicator();
        
        // 显示错误消息
        console.error('与AI助手通信时出错:', error);
        displayAIMessage('抱歉，处理您的请求时出错，请稍后再试。');
    }
}

// 收集与查询相关的数据
function collectRelevantData(query) {
    const data = {
        todos: [],
        plans: [],
        notes: []
    };
    
    // 获取所有待办事项（根据查询中的日期范围）
    const dateRange = parseDateRangeFromQuery(query);
    data.todos = getAllTodosInDateRange(dateRange);
    
    // 获取所有长期计划
    data.plans = getAllPlans();
    
    // 获取所有笔记（可以根据日期范围过滤）
    data.notes = getAllNotes(dateRange);
    
    return data;
}

// 从查询中解析日期范围
function parseDateRangeFromQuery(query) {
    const today = new Date();
    const dateRange = {
        start: null,
        end: today
    };
    
    // 简单的日期范围解析逻辑
    if (query.includes('这周') || query.includes('本周')) {
        // 本周：从星期日开始到星期六结束
        const dayOfWeek = today.getDay(); // 0-6, 0是星期日
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        dateRange.start = startOfWeek;
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dateRange.end = endOfWeek;
    } else if (query.includes('本月') || query.includes('这个月')) {
        // 本月：从1号到月底
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        dateRange.start = startOfMonth;
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        dateRange.end = endOfMonth;
    } else if (query.includes('今天')) {
        // 今天
        dateRange.start = today;
    } else if (query.includes('昨天')) {
        // 昨天
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        dateRange.start = yesterday;
        dateRange.end = yesterday;
    } else if (query.includes('最近') || query.includes('近期')) {
        // 最近7天
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        dateRange.start = sevenDaysAgo;
    }
    
    return dateRange;
}

// 获取指定日期范围内的所有待办事项
function getAllTodosInDateRange(dateRange) {
    const todos = [];
    const localStorageKeys = Object.keys(localStorage);
    
    // 如果没有指定开始日期，获取所有待办事项
    if (!dateRange.start) {
        localStorageKeys.forEach(key => {
            if (key.startsWith('todos_')) {
                const dateStr = key.substring(6); // 去掉'todos_'前缀
                const dateTodos = JSON.parse(localStorage.getItem(key) || '[]');
                
                dateTodos.forEach(todo => {
                    todos.push({
                        ...todo,
                        date: dateStr
                    });
                });
            }
        });
        
        return todos;
    }
    
    // 根据日期范围获取待办事项
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // 遍历日期范围内的每一天
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const dateKey = `${year}-${month}-${day}`;
        
        const dateTodos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
        
        dateTodos.forEach(todo => {
            todos.push({
                ...todo,
                date: dateKey
            });
        });
        
        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return todos;
}

// 获取所有长期计划
function getAllPlans() {
    return JSON.parse(localStorage.getItem('plans') || '[]');
}

// 获取所有笔记（可根据日期范围过滤）
function getAllNotes(dateRange) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    // 如果没有指定日期范围或没有开始日期，返回所有笔记
    if (!dateRange || !dateRange.start) {
        return notes;
    }
    
    // 根据日期范围过滤笔记
    const startTimestamp = dateRange.start.getTime();
    const endTimestamp = dateRange.end.getTime();
    
    return notes.filter(note => {
        const noteDate = new Date(note.timestamp);
        const noteTimestamp = noteDate.getTime();
        return noteTimestamp >= startTimestamp && noteTimestamp <= endTimestamp;
    });
}

// 构建发送给AI的提示
function buildAIPrompt(query, data) {
    let prompt = `用户需求：${query}\n\n`;
    
    // 添加待办事项数据
    if (data.todos && data.todos.length > 0) {
        prompt += "待办事项数据：\n";
        data.todos.forEach((todo, index) => {
            prompt += `日期：${todo.date}，内容：${todo.text}，状态：${todo.completed ? '已完成' : '未完成'}\n`;
        });
        prompt += "\n";
    }
    
    // 添加长期计划数据
    if (data.plans && data.plans.length > 0) {
        prompt += "长期计划数据：\n";
        data.plans.forEach((plan, index) => {
            const isCompleted = plan.subtasks && plan.subtasks.length > 0 && 
                               plan.subtasks.every(subtask => subtask.completed);
            
            prompt += `计划名称：${plan.title}，状态：${isCompleted ? '已完成' : '进行中'}\n`;
            
            if (plan.subtasks && plan.subtasks.length > 0) {
                prompt += "  子任务：\n";
                plan.subtasks.forEach((subtask, subtaskIndex) => {
                    prompt += `    ${subtaskIndex + 1}. ${subtask.text}（${subtask.completed ? '已完成' : '未完成'}）\n`;
                });
            }
        });
        prompt += "\n";
    }
    
    // 添加笔记数据
    if (data.notes && data.notes.length > 0) {
        prompt += "随手记数据：\n";
        data.notes.forEach((note, index) => {
            const noteDate = new Date(note.timestamp);
            const formattedDate = `${noteDate.getFullYear()}-${noteDate.getMonth() + 1}-${noteDate.getDate()}`;
            prompt += `日期：${formattedDate}，内容：${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}\n`;
        });
    }
    
    // 添加系统提示
    prompt += "\n请根据以上数据，以第一人称、友好的口吻回答用户的问题。回答要简洁明了，符合用户的查询意图。";
    
    return prompt;
}

// 生成模拟的AI响应（实际应用中应调用DeepSeek API）
function generateMockAIResponse(query, data) {
    if (query.includes('总结') && (query.includes('进度') || query.includes('计划'))) {
        // 日程进度总结
        const completedTodos = data.todos.filter(todo => todo.completed);
        const incompleteTodos = data.todos.filter(todo => !todo.completed);
        
        let response = "这是你最近的日程进度总结：\n\n";
        
        if (data.todos.length === 0) {
            response = "你还没有设置任何任务哦！";
        } else {
            response += `已完成的任务：${completedTodos.length} 个\n`;
            if (completedTodos.length > 0) {
                response += "\n已完成任务清单：\n";
                completedTodos.slice(0, 3).forEach((todo, index) => {
                    response += `- ${todo.text}（${todo.date}）\n`;
                });
                if (completedTodos.length > 3) {
                    response += `... 还有 ${completedTodos.length - 3} 个已完成任务\n`;
                }
            }
            
            if (incompleteTodos.length > 0) {
                response += "\n未完成的任务：${incompleteTodos.length} 个\n";
                response += "\n未完成任务清单：\n";
                incompleteTodos.forEach((todo, index) => {
                    response += `- ${todo.text}（${todo.date}）\n`;
                });
                response += "\n记得尽快完成这些任务哦！";
            }
        }
        
        return response;
    } else if (query.includes('未完成')) {
        // 未完成任务列表
        const incompleteTodos = data.todos.filter(todo => !todo.completed);
        
        if (incompleteTodos.length === 0) {
            return "恭喜你！目前没有未完成的任务。";
        } else {
            let response = "你有以下未完成的任务：\n\n";
            incompleteTodos.forEach((todo, index) => {
                response += `${index + 1}. ${todo.text}（${todo.date}）\n`;
            });
            response += "\n建议你优先完成这些任务，保持良好的进度！";
            return response;
        }
    } else if (query.includes('总结报告') || query.includes('本月的总结')) {
        // 阶段性总结报告
        const completedTodos = data.todos.filter(todo => todo.completed);
        const incompleteTodos = data.todos.filter(todo => !todo.completed);
        const completedPlans = data.plans.filter(plan => 
            plan.subtasks && plan.subtasks.length > 0 && 
            plan.subtasks.every(subtask => subtask.completed)
        );
        const ongoingPlans = data.plans.filter(plan => 
            !(plan.subtasks && plan.subtasks.length > 0 && 
            plan.subtasks.every(subtask => subtask.completed))
        );
        
        let response = "以下是你的阶段性总结报告：\n\n";
        
        // 核心成就
        response += "### 核心成就\n";
        if (completedTodos.length > 0) {
            response += `- 已完成 ${completedTodos.length} 项待办任务\n`;
        }
        if (completedPlans.length > 0) {
            response += `- 已完成 ${completedPlans.length} 个长期计划\n`;
            completedPlans.slice(0, 2).forEach(plan => {
                response += `  - ${plan.title}\n`;
            });
        }
        
        // 未完成任务
        if (incompleteTodos.length > 0 || ongoingPlans.length > 0) {
            response += "\n### 待跟进事项\n";
            if (incompleteTodos.length > 0) {
                response += `- 还有 ${incompleteTodos.length} 项待办任务未完成\n`;
            }
            if (ongoingPlans.length > 0) {
                response += `- 有 ${ongoingPlans.length} 个长期计划正在进行中\n`;
                ongoingPlans.slice(0, 2).forEach(plan => {
                    response += `  - ${plan.title}\n`;
                });
            }
        }
        
        // 关键想法
        if (data.notes.length > 0) {
            response += "\n### 关键想法\n";
            response += "从你的随手记中，我发现了这些值得关注的想法：\n";
            const keyNotes = data.notes.slice(0, 3);
            keyNotes.forEach((note, index) => {
                const shortContent = note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content;
                response += `- ${shortContent}\n`;
            });
        }
        
        // 建议
        response += "\n### 下一阶段建议\n";
        response += "1. 优先完成剩余的待办任务，避免拖延\n";
        response += "2. 继续推进正在进行的长期计划\n";
        response += "3. 保持记录随手记的习惯，这有助于整理思路和发现新想法\n";
        
        return response;
    } else {
        // 默认回复
        return "感谢你的提问！我是你的AI助手，可以帮助你总结日程进度和生成阶段性报告。请尝试使用类似这样的指令：\n- 总结我这周的进度\n- 告诉我哪些任务没完成\n- 帮我写一份本月的总结";
    }
}

// 显示用户消息
function displayUserMessage(message) {
    const aiChatContainer = document.getElementById('ai-chat-container');
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', 'items-start', 'mb-4', 'justify-end');
    
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('mr-2', 'bg-primary', 'text-white', 'rounded-lg', 'p-2', 'text-sm', 'max-w-[80%]');
    messageBubble.textContent = message;
    
    const avatar = document.createElement('div');
    avatar.classList.add('w-7', 'h-7', 'rounded-full', 'flex', 'items-center', 'justify-center', 'shrink-0', 'overflow-hidden', 'scale-95');
    const img = document.createElement('img');
    img.src = 'img_v3_02qj_038f2cf5-39dc-463f-b767-650a489b4e7g.jpg';
    img.alt = '用户';
    img.classList.add('w-full', 'h-full', 'object-cover');
    avatar.appendChild(img);
    
    messageElement.appendChild(messageBubble);
    messageElement.appendChild(avatar);
    
    aiChatContainer.appendChild(messageElement);
    
    // 滚动到底部
    aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
}

// 显示AI消息
function displayAIMessage(message) {
    const aiChatContainer = document.getElementById('ai-chat-container');
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', 'items-start', 'mb-4');
    
    const avatar = document.createElement('div');
    avatar.classList.add('w-7', 'h-7', 'rounded-full', 'flex', 'items-center', 'justify-center', 'shrink-0', 'overflow-hidden', 'scale-95');
    const img = document.createElement('img');
    img.src = 'img_v3_02qj_049c5594-7b6a-419f-8306-729e3a82607g_MIDDLE.webp';
    img.alt = 'AI助手';
    img.classList.add('w-full', 'h-full', 'object-cover');
    avatar.appendChild(img);
    
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('ml-2', 'bg-gray-100', 'rounded-lg', 'p-2', 'text-sm', 'max-w-[80%]', 'whitespace-pre-wrap');
    
    // 处理markdown格式（简单支持）
    let formattedMessage = message;
    
    // 处理标题
    formattedMessage = formattedMessage.replace(/^### (.+)$/gm, '<strong class="block font-semibold mt-2 mb-1">$1</strong>');
    
    // 处理列表项
    formattedMessage = formattedMessage.replace(/^- (.+)$/gm, '<div class="ml-1">• $1</div>');
    
    messageBubble.innerHTML = formattedMessage;
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageBubble);
    
    aiChatContainer.appendChild(messageElement);
    
    // 滚动到底部
    aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
}

// 显示AI正在输入的指示器
function displayTypingIndicator() {
    const aiChatContainer = document.getElementById('ai-chat-container');
    
    const typingElement = document.createElement('div');
    typingElement.id = 'ai-typing-indicator';
    typingElement.classList.add('flex', 'items-start', 'mb-4');
    
    const avatar = document.createElement('div');
    avatar.classList.add('w-7', 'h-7', 'rounded-full', 'flex', 'items-center', 'justify-center', 'shrink-0', 'overflow-hidden', 'scale-95');
    const img = document.createElement('img');
    img.src = 'img_v3_02qj_049c5594-7b6a-419f-8306-729e3a82607g_MIDDLE.webp';
    img.alt = 'AI助手';
    img.classList.add('w-full', 'h-full', 'object-cover');
    avatar.appendChild(img);
    
    const typingBubble = document.createElement('div');
    typingBubble.classList.add('ml-2', 'bg-gray-100', 'rounded-lg', 'p-2', 'text-sm');
    
    // 添加三个跳动的点
    typingBubble.innerHTML = `
        <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 100ms;"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 200ms;"></div>
        </div>
    `;
    
    typingElement.appendChild(avatar);
    typingElement.appendChild(typingBubble);
    
    aiChatContainer.appendChild(typingElement);
    
    // 滚动到底部
    aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
}

// 移除AI正在输入的指示器
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 更新初始化函数，添加AI助手初始化
function initNotesPage() {
    const saveNoteBtn = document.getElementById('save-note');
    
    saveNoteBtn.addEventListener('click', saveNote);
    
    document.getElementById('note-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            saveNote();
        }
    });
    
    // 加载已保存的笔记
    loadNotes();
    
    // 初始化AI助手
    initAIAssistant();
}

// 初始化认证和数据同步模块
document.addEventListener('DOMContentLoaded', () => {
    // 启动应用
    initApp();
    
    // 初始化认证模块
    if (window.initAuth) {
        window.initAuth();
    }
    
    // 初始化数据同步
    if (window.initDataSync) {
        window.initDataSync();
    }
    
    // 监听数据同步完成事件，更新UI
    window.addEventListener('dataSynced', () => {
        // 重新加载当前页面的数据
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            if (activePage.id === 'today-todos') {
                const today = new Date().toISOString().split('T')[0];
                showTodosForDate(today);
            } else if (activePage.id === 'long-term-plans') {
                loadPlans();
            } else if (activePage.id === 'notes') {
                loadNotes();
            }
        }
    });
});