// todo Object = { id, description, date, complete }

/* Saved todos (localStorage) functions */

function fetchSavedTodoList () {
  var todoList = window.localStorage.getItem('todoList');
  if (todoList) {
    todoList = JSON.parse(todoList);
    if (todoList.length > 0) {
      return todoList;
    }
  }
  return -1;
}

function updateSavedTodoList (todoList) {
  window.localStorage.setItem('todoList', JSON.stringify(todoList));
}

function fetchSavedTodoById (id) {
  id = id.split('-')[1]; // todo-0 (HTML Element) !== 0 (JSON Object)
  var todoList = fetchSavedTodoList();
  if (todoList !== -1) {
    for (var i = 0; i < todoList.length; i++) {
      if (todoList[i].id == id) {
        return todoList[i];
      }
    }
  }
  return -1;
}

/* Todo functions */

function addTodo (todo) {
  var todoList = fetchSavedTodoList();
  if (todoList !== -1) {
    todoList.push(todo);
  } else {
    todoList = [todo];
  }
  updateSavedTodoList(todoList);
}

function updateTodo (todo) {
  var todoList = fetchSavedTodoList();
  if (todoList !== -1) {
    for (var i = 0; i < todoList.length; i++) {
      if (todoList[i].id === todo.id) {
        todoList[i] = todo;
        updateSavedTodoList(todoList);
        return;
      }
    }
  }
}

function deleteTodo (todo) {
  var todoList = fetchSavedTodoList();
  for (var i = 0; i < todoList.length; i++) {
    if (todo.id === todoList[i].id) {
      var deleteCheck = prompt('Remove this todo? [y/n]');
      if (deleteCheck && deleteCheck.toLowerCase() === 'y') {
        if (todoList.length > 1) {
          todoList.splice(i, 1);
        } else {
          todoList = {};
        }
        updateSavedTodoList(todoList);
        alert('Todo deleted');
      }
      return;
    }
  }
}

/* Todo event handlers */

function handleAddTodo () {
  var todoList = fetchSavedTodoList();
  if (todoList.length === todoLimit) {
    alert('You have reached 5 todos. Let\'s get something done first!');
    return;
  }
  var todoId = todoList[todoList.length - 1] ? todoList[todoList.length - 1].id + 1 : 0; // get the next id
  var description = prompt('What do you need to do?');
  if (description) {
    if (todoList === -1) {
      cleanUpElement('#todo-list'); // removes hint text
    }
    var todo = {
      id: todoId,
      description: description,
      date: null,
      complete: false
    };
    addTodo(todo);
    renderTodoBox();
  } else {
    alert('Empty todo. Please try again!');
  }
}

function handleEditTodo () {
  var todoElement = document.querySelector('.todo-edit-item');
  var todo = fetchSavedTodoById(todoElement.id);
  todo.description = document.querySelector('#edit-todo-description').value;
  updateTodo(todo);
  todoElement.classList.remove('todo-edit-item');
  renderTodoBox();
  toggleModal('close');
}

function handleCompleteTodo (element) {
  var todo = fetchSavedTodoById(element.id);
  todo.complete = !todo.complete;
  updateTodo(todo);
  todo.complete
    ? element.classList.add('complete')
    : element.classList.remove('complete');
}

/* Modal functions */

function toggleModal (state) {
  document.querySelector('#modal').classList.toggle('hidden');
  document.querySelector('#modal-overlay').classList.toggle('hidden');
}

function closeModal () {
  var todo = document.querySelector('.todo-edit-item');
  if (todo) {
    todo.classList.remove('todo-edit-item');
  }
  toggleModal('close');
}

function loadModal () {
  document.querySelector('#edit-todo-save-btn').addEventListener('click', handleEditTodo, false);
  document.querySelector('.modal-close-button').addEventListener('click', function () {
    closeModal();
  }, false);
  document.querySelector('#modal').addEventListener('keydown', function (e) {
    if (this.className == 'hidden') {
      return;
    }
    switch (e.key.toLowerCase()) {
      case 'enter':
        handleEditTodo();
        break;
      case 'escape':
        closeModal();
        break;
    }
  }, false);
}

function updateModal (todo) {
  todo.classList.add('todo-edit-item');
  var editInputBox = document.querySelector('#edit-todo-description');
  editInputBox.value = fetchSavedTodoById(todo.id).description;
  toggleModal('open');
  editInputBox.focus();
}

/* Utilities */

// formats todo date property for rendering
function formatDate (date, displayTime) {
  var newDate = '';
  newDate += date.getFullYear() + '/';
  newDate += (date.getMonth() + 1) + '/'; // getMonth() is zero based
  newDate += date.getDate() + ' ';
  if (displayTime) {
    newDate += date.getHours() + ':';
    var minutes = date.getMinutes();
    newDate += minutes.length === 1 ? '0' + minutes : minutes;
  }
  return newDate;
}

// cleanup HTML Element contents
function cleanUpElement (query) {
  var element = document.querySelector(query);
  element.innerHTML = '';
  return element;
}

/* Rendering */

function renderTodoItem (todo) {
  var todoElement = document.createElement('DIV');
  todoElement.id = 'todo-' + todo.id;
  todoElement.classList.add('todo');
  if (todo.complete) {
    todoElement.classList.add('complete');
  }
  var todoContent = '<input type="checkbox" name="" class="todo-complete"';
  todoContent += todo.complete ? ' checked>' : '>';
  todoContent += '<span class="todo-description no-select">' + todo.description + '</span>';
  if (todo.date) {
    todoContent += '<span class="todo-date">' + formatDate(todo.date) + '</span>';
  } else {
    todoContent += '<span class="todo-date">' + '' + '</span>';
  }

  var deleteBtnId = 'todo-' + todo.id + '-delete-button';
  todoContent += '<span id="' + deleteBtnId + '" class="btn-delete">Remove</span>';
  todoElement.innerHTML = todoContent;
  return todoElement;
}

function renderTodoBox () {
  var todoListElement = cleanUpElement('#todo-list');
  var todoList = fetchSavedTodoList();
  var todoElement;
  if (todoList === -1) {
    todoElement = document.createElement('P');
    todoElement.classList.add('todo-empty', 'hint-text', 'text-center');
    var todoContent = document.createTextNode('No todos todo. Find some todos to do and lets do them dude.');
    todoElement.appendChild(todoContent);
    todoListElement.appendChild(todoElement);
  } else {
    for (var i = 0; i < todoList.length; i++) {
      todoElement = renderTodoItem(todoList[i]);
      todoElement.lastChild.addEventListener('click', function () {
        deleteTodo(fetchSavedTodoById(this.id));
        renderTodoBox();
      }, false);
      todoListElement.appendChild(todoElement);
    }
  }
}

/* Startup */

function firstRun () {
  var todoListElement = document.querySelector('#todo-list');

  todoListElement.addEventListener('click', function (e) {
    var clickedElement = e.target;

    // Todo Complete event
    if (clickedElement.className == 'todo-complete') {
      var todoElement = clickedElement.parentElement;
      handleCompleteTodo(todoElement);
      return;
    }

    // Todo Edit event
    if (clickedElement.className == 'btn-delete') {
      return;
    }
    if (clickedElement.className == 'todo' || clickedElement.parentElement.className == 'todo') {
      if (clickedElement.className == 'todo') {
        updateModal(clickedElement);
      }
      if (clickedElement.parentElement.className == 'todo') {
        updateModal(clickedElement.parentElement);
      }
    }
  }, false);

  // intialize components
  document.querySelector('#todo-add-button').addEventListener('click', handleAddTodo, false);
  loadModal();

  // initialize shortcuts
  window.addEventListener('keydown', function (e) {
    var shortcutsActive = e.shiftKey && (isMac ? e.ctrlKey : e.altKey);
    var modal = document.querySelector('#modal');
    if (!shortcutsActive || modal.className !== 'hidden') {
      return;
    } else {
      switch (e.key.toLowerCase()) {
        case 'a':
          handleAddTodo();
          break;
        case 'e':
          var todo = document.querySelector('#todo-list').lastChild;
          todo && todo.className === 'todo' ? updateModal(todo) : handleAddTodo();
          break;
        case 'r':
          var todoList = fetchSavedTodoList();
          deleteTodo(todoList[todoList.length - 1]);
          renderTodoBox();
          break;
        case 'c':
          var todoElement = document.querySelector('#todo-list').lastChild;
          handleCompleteTodo(todoElement);
          renderTodoBox();
          break;
      }
    }
  });
}

var isMac = window.navigator.platform.indexOf('Mac') !== -1 ? true : false; // we need to have different shortcuts for macOS
var todoLimit = 5;
var currentDate = new Date();
var today = formatDate(currentDate, false);
console.log('Today is', today);
console.log('See the source code at https://github.com/yougotwill/todo-box :)');
renderTodoBox();
firstRun();
