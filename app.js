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
        currentDate.setDate(currentDate.getDate() - 7);
        selectedDate = new Date(currentDate);
        renderCalendar();
        showTodosForDate(selectedDate);
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        selectedDate = new Date(currentDate);
        renderCalendar();
        showTodosForDate(selectedDate);
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

// 渲染日历 - 周历格式
function renderCalendar() {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const daysContainer = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    
    // 清空日历
    daysContainer.innerHTML = '';
    
    // 显示当前月份
    currentMonthElement.textContent = `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`;
    
    // 获取选中日期所在周的第一天（星期日）
    const selectedDayOfWeek = selectedDate.getDay(); // 0-6, 0是星期日
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDayOfWeek);
    
    // 创建一个包含7个日期的数组
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        weekDays.push(currentDay);
    }
    
    // 渲染一周的7天
    weekDays.forEach(day => {
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
        
        // 分离已完成和未完成的待办
        const completedTodos = todos.filter(todo => todo.completed);
        const activeTodos = todos.filter(todo => !todo.completed);
        
        // 先添加未完成的待办
        activeTodos.forEach(todo => {
            addTodoToDOM(todo, dateKey);
        });
        
        // 再添加已完成的待办
        completedTodos.forEach(todo => {
            addTodoToDOM(todo, dateKey);
        });
    }
}

// 添加待办到DOM
function addTodoToDOM(todo, dateKey) {
    const todoList = document.getElementById('todo-list');
    
    const todoItem = document.createElement('li');
    todoItem.classList.add('flex', 'items-center', 'space-x-2', 'p-2', 'rounded-lg', 'hover:bg-gray-50', 'transition-colors');
    
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
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa fa-trash-o text-gray-400 hover:text-red-500 transition-colors"></i>';
    deleteBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors');
    deleteBtn.addEventListener('click', () => {
        deleteTodo(todo.id, dateKey);
    });
    
    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    todoItem.appendChild(deleteBtn);
    
    todoList.appendChild(todoItem);
}

// 添加新待办
function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const text = todoInput.value.trim();
    
    if (text) {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        const dateKey = `${year}-${month}-${day}`;
        
        // 获取现有待办
        const todos = JSON.parse(localStorage.getItem(`todos_${dateKey}`) || '[]');
        
        // 添加新待办
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        todos.push(newTodo);
        
        // 保存到localStorage
        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
        
        // 清空输入框
        todoInput.value = '';
        
        // 更新显示
        showTodosForDate(selectedDate);
        // 更新日历标记
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
        
        // 保存到localStorage
        localStorage.setItem(`todos_${dateKey}`, JSON.stringify(todos));
        
        // 更新显示
        showTodosForDate(selectedDate);
        // 更新日历标记
        renderCalendar();
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
    
    // 监听页面切换，确保按钮总是能正确初始化
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link') && e.target.closest('.nav-link').getAttribute('href') === '#plan') {
            initAddPlanButton();
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
        subtasks: []
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
        plansContainer.classList.remove('hidden');
        emptyPlan.classList.add('hidden');
        
        // 渲染每个计划
        plans.forEach(plan => {
            renderPlan(plan);
        });
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

    // 左侧内容（标题和状态）
    const leftContent = document.createElement('div');
    leftContent.classList.add('flex', 'items-center', 'space-x-2');
    
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
        subtaskItem.classList.add('flex', 'items-center', 'space-x-2');
        
        const subtaskCheckbox = document.createElement('input');
        subtaskCheckbox.type = 'checkbox';
        subtaskCheckbox.checked = subtask.completed;
        subtaskCheckbox.classList.add('w-3', 'h-3', 'accent-primary', 'cursor-pointer');
        subtaskCheckbox.addEventListener('change', () => {
            toggleSubtaskStatus(plan.id, subtask.id);
        });
        
        const subtaskText = document.createElement('span');
        subtaskText.textContent = subtask.text;
        subtaskText.classList.add('text-sm', 'flex-1');
        if (subtask.completed) {
            subtaskText.classList.add('line-through', 'text-gray-400');
        }
        
        const subtaskDeleteBtn = document.createElement('button');
        subtaskDeleteBtn.innerHTML = '<i class="fa fa-times text-gray-400 hover:text-red-500 transition-colors"></i>';
        subtaskDeleteBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors');
        subtaskDeleteBtn.addEventListener('click', () => {
            deleteSubtask(plan.id, subtask.id);
        });
        
        subtaskItem.appendChild(subtaskCheckbox);
        subtaskItem.appendChild(subtaskText);
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
        localStorage.setItem('plans', JSON.stringify(plans));
        renderPlans();
    }
}

// 更新计划描述
function updatePlanDescription(planId, newDescription) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        plans[planIndex].description = newDescription;
        localStorage.setItem('plans', JSON.stringify(plans));
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
                completed: false
            };
            
            plans[planIndex].subtasks.push(newSubtask);
            localStorage.setItem('plans', JSON.stringify(plans));
            
            // 更新计划状态
            updatePlanStatus(planId);
            
            // 直接更新DOM而不是重新渲染整个列表
            const planHeader = document.querySelector(`div[data-plan-id="${planId}"].cursor-pointer`);
            if (planHeader) {
                const planCard = planHeader.closest('div');
                const subtasksList = planCard.querySelector('ul.space-y-2');
                const planContent = planCard.querySelector(`div[data-plan-id="${planId}"]:not(.cursor-pointer)`);
                const isExpanded = planContent && !planContent.classList.contains('hidden');
                
                if (isExpanded && subtasksList) {
                    // 创建新的子任务DOM元素
                    const subtaskItem = document.createElement('li');
                    subtaskItem.classList.add('flex', 'items-center', 'space-x-2');
                    
                    const subtaskCheckbox = document.createElement('input');
                    subtaskCheckbox.type = 'checkbox';
                    subtaskCheckbox.checked = newSubtask.completed;
                    subtaskCheckbox.classList.add('w-3', 'h-3', 'accent-primary', 'cursor-pointer');
                    subtaskCheckbox.addEventListener('change', () => {
                        toggleSubtaskStatus(planId, newSubtask.id);
                    });
                    
                    const subtaskText = document.createElement('span');
                    subtaskText.textContent = newSubtask.text;
                    subtaskText.classList.add('text-sm', 'flex-1');
                    if (newSubtask.completed) {
                        subtaskText.classList.add('line-through', 'text-gray-400');
                    }
                    
                    const subtaskDeleteBtn = document.createElement('button');
                    subtaskDeleteBtn.innerHTML = '<i class="fa fa-times text-gray-400 hover:text-red-500 transition-colors"></i>';
                    subtaskDeleteBtn.classList.add('p-1', 'rounded-full', 'hover:bg-red-50', 'transition-colors');
                    subtaskDeleteBtn.addEventListener('click', () => {
                        deleteSubtask(planId, newSubtask.id);
                    });
                    
                    subtaskItem.appendChild(subtaskCheckbox);
                    subtaskItem.appendChild(subtaskText);
                    subtaskItem.appendChild(subtaskDeleteBtn);
                    subtasksList.appendChild(subtaskItem);
                }
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
    }
}

// 删除计划
function deletePlan(planId) {
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const updatedPlans = plans.filter(plan => plan.id !== planId);
    
    localStorage.setItem('plans', JSON.stringify(updatedPlans));
    renderPlans();
}

// 初始化随手记页面
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
            timestamp: new Date().toISOString()
        };
        
        notes.unshift(newNote); // 新笔记添加到开头
        
        // 保存到localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // 清空输入框
        noteInput.value = '';
        
        // 更新显示
        renderNotes();
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
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
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
}

// 启动应用
initApp();